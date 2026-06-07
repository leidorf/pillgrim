import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  TriggerType,
  RepeatFrequency,
  EventType,
  TimestampTrigger,
  AndroidAction,
  AuthorizationStatus,
} from "@notifee/react-native";
import { Platform } from "react-native";
import { Medication } from "../types/medication";
import { Colors } from "../constants/theme";
import i18n from "../utils/i18n";
import { useSettingsStore } from "../store/settingsStore";

const CHANNEL_ID = "medication-reminders";

const getVibration = (): number[] | undefined => {
  const { vibrationEnabled, vibrationPattern } = useSettingsStore.getState();
  if (!vibrationEnabled) return undefined;
  const patterns: Record<string, number[]> = {
    short: [10, 150, 100, 150],
    normal: [10, 250, 250, 250],
    long: [10, 500, 200, 500, 200, 500],
    alarm: [10, 500, 200, 500],
  };
  return patterns[vibrationPattern] ?? patterns.normal;
};

const getFullscreen = (): boolean =>
  useSettingsStore.getState().fullscreenNotification;
const getGlobalHideNames = (): boolean =>
  useSettingsStore.getState().hideNotificationNames;

/* ----------------------------- Text builders ----------------------------- */
function buildTitle(medication: Medication): string {
  if (getGlobalHideNames() || medication.notificationSettings?.hideName) {
    return i18n.t("notifications.defaultTitle");
  }
  return medication.name;
}

function noteLabel(note: string): string {
  const keyMap: Record<string, string> = {
    before_meal: "instructions.beforeMeal",
    with_meal: "instructions.withMeal",
    after_meal: "instructions.afterMeal",
    empty_stomach: "instructions.emptyStomach",
  };
  return keyMap[note] ? i18n.t(keyMap[note]) : note;
}

function buildBody(medication: Medication, dose: string, time: string): string {
  const parts: string[] = [];
  if (dose) parts.push(dose);
  if (medication.note && medication.note !== "any") {
    parts.push(noteLabel(medication.note));
  }
  return parts.length > 0
    ? parts.join(" · ")
    : i18n.t("notifications.defaultBody") + " (" + time + ")";
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(":").map(Number);
  return { hours: h, minutes: m };
}

/* --------------------------- Action definitions --------------------------- */
const ACTION_TAKEN = "taken";
const ACTION_SKIP = "skip";

function makeActions(): AndroidAction[] {
  return [
    {
      title: i18n.t("notifications.actionTaken"),
      pressAction: { id: ACTION_TAKEN },
    },
    {
      title: i18n.t("notifications.actionSkip"),
      pressAction: { id: ACTION_SKIP },
    },
  ];
}

/* ---------------- Shared notification body for all triggers --------------- */
function buildNotificationPayload(params: {
  title: string;
  body: string;
  data: Record<string, string | number | object>;
  withActions?: boolean;
}) {
  const fullscreen = getFullscreen();
  const vibration = getVibration();
  const showActions = params.withActions !== false;

  const android: any = {
    channelId: CHANNEL_ID,
    category: showActions ? AndroidCategory.ALARM : AndroidCategory.REMINDER,
    color: Colors.primary,
    ...(showActions ? { actions: makeActions() } : {}),
    pressAction: { id: "default" },
  };

  if (vibration) {
    android.vibrationPattern = vibration;
  }

  if (fullscreen) {
    android.fullScreenAction = {
      id: "default",
      launchActivity: "com.anonymous.medicationreminder.MainActivity",
    };
    android.importance = AndroidImportance.HIGH;
    android.lightUpScreen = true;
    android.ongoing = true;
    android.showTimestamp = true;
    android.showChronometer = false;
    console.log(
      "[Notifee] Fullscreen mode ON — fullScreenAction added to payload",
    );
  }

  return {
    title: params.title,
    body: params.body,
    data: params.data,
    android,
    ios: {
      sound: "default",
      ...(fullscreen ? { criticalAlert: { volume: 1.0 } as any } : {}),
      categoryId: "medication-actions",
    },
  };
}

/* ----------------------- Channel & permission setup ----------------------- */

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  console.log("[Notifee] Permission status:", JSON.stringify(settings));

  if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.warn("[Notifee] Notifications denied by user");
    return false;
  }

  if (Platform.OS === "android") {
    try {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: "Medication Reminders",
        importance: AndroidImportance.HIGH,
        vibration: true,
        visibility: AndroidVisibility.PUBLIC,
        bypassDnd: true,
      });
      console.log("[Notifee] Channel created:", CHANNEL_ID);
    } catch (err) {
      console.error("[Notifee] Channel creation failed:", err);
    }
  }

  return true;
}

/* --------------------------- Schedule functions --------------------------- */
export async function scheduleMedicationNotifications(
  medication: Medication,
): Promise<string[]> {
  if (!medication.notificationSettings?.enabled) return [];
  if (!medication.schedule || !medication.timeDoses?.length) return [];

  console.log(
    "[Notifee] Scheduling for:",
    medication.name,
    medication.schedule.type,
    medication.timeDoses?.map((td) => td.time),
  );

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn("[Notifee] Permission denied — no notifications scheduled");
    return [];
  }

  const ids: string[] = [];
  const { schedule, timeDoses } = medication;

  for (const { time, dose } of timeDoses) {
    const { hours, minutes } = parseTime(time);
    const title = buildTitle(medication);
    const body = buildBody(medication, dose, time);
    const data: Record<string, string | number | object> = {
      medicationId: medication.id,
      scheduledTime: time,
    };

    let notificationIds: string[] = [];

    switch (schedule.type) {
      case "daily":
        notificationIds = await scheduleDailyDose({
          hours,
          minutes,
          title,
          body,
          data,
        });
        break;
      case "weekly":
        notificationIds = await scheduleWeeklyDose({
          days: schedule.days ?? [],
          hours,
          minutes,
          title,
          body,
          data,
        });
        break;
      case "biweekly":
        notificationIds = await scheduleBiweeklyDose({
          startDate: schedule.startDate,
          hours,
          minutes,
          title,
          body,
          data,
        });
        break;
      case "interval":
        if (schedule.interval) {
          notificationIds = await scheduleIntervalDose({
            intervalDays: schedule.interval,
            startDate: schedule.startDate,
            hours,
            minutes,
            title,
            body,
            data,
          });
        }
        break;
      case "monthly": {
        const startDay = new Date(schedule.startDate).getDate();
        notificationIds = await scheduleMonthlyDose({
          days: [startDay],
          hours,
          minutes,
          title,
          body,
          data,
        });
        break;
      }
      case "specificmonth":
        notificationIds = await scheduleMonthlyDose({
          days: schedule.days ?? [],
          hours,
          minutes,
          title,
          body,
          data,
        });
        break;
      case "prn":
        break;
    }

    ids.push(...notificationIds);
  }

  return ids;
}

/* -------------------------------- Daily --------------------------------- */
async function scheduleDailyDose(params: {
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, string | number | object>;
}): Promise<string[]> {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    params.hours,
    params.minutes,
    0,
    0,
  );
  if (next <= now) next.setDate(next.getDate() + 1);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: next.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  const id = await notifee.createTriggerNotification(
    buildNotificationPayload({
      title: params.title,
      body: params.body,
      data: params.data,
    }),
    trigger,
  );
  console.log(
    "[Notifee] Daily trigger created:",
    id,
    "next:",
    new Date(trigger.timestamp).toLocaleString(),
  );
  return [id];
}

/* ------------------------------- Weekly --------------------------------- */
async function scheduleWeeklyDose(params: {
  days: number[];
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, string | number | object>;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();

  for (const day of params.days) {
    const next = new Date(now);
    const daysUntil = (day + 7 - now.getDay()) % 7;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(params.hours, params.minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: next.getTime(),
      repeatFrequency: RepeatFrequency.WEEKLY,
      alarmManager: { allowWhileIdle: true },
    };

    const id = await notifee.createTriggerNotification(
      buildNotificationPayload({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger,
    );
    ids.push(id);
  }
  return ids;
}

/* ------------------------------ Biweekly -------------------------------- */
async function scheduleBiweeklyDose(params: {
  startDate: string;
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, string | number | object>;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();
  let next = new Date(params.startDate);
  next.setHours(params.hours, params.minutes, 0, 0);
  while (next <= now) next.setDate(next.getDate() + 14);

  for (let i = 0; i < 26; i++) {
    const triggerDate = new Date(next);
    triggerDate.setDate(triggerDate.getDate() + i * 14);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      alarmManager: { allowWhileIdle: true },
    };

    const id = await notifee.createTriggerNotification(
      buildNotificationPayload({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger,
    );
    ids.push(id);
  }
  return ids;
}

/* ------------------------------ Interval -------------------------------- */
async function scheduleIntervalDose(params: {
  intervalDays: number;
  startDate: string;
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, string | number | object>;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();
  let next = new Date(params.startDate);
  next.setHours(params.hours, params.minutes, 0, 0);
  while (next <= now) next.setDate(next.getDate() + params.intervalDays);

  const maxOccurrences = Math.min(64, Math.floor(365 / params.intervalDays));

  for (let i = 0; i < maxOccurrences; i++) {
    const triggerDate = new Date(next);
    triggerDate.setDate(triggerDate.getDate() + i * params.intervalDays);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      alarmManager: { allowWhileIdle: true },
    };

    const id = await notifee.createTriggerNotification(
      buildNotificationPayload({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger,
    );
    ids.push(id);
  }
  return ids;
}

/* ------------------------------ Monthly -------------------------------- */
async function scheduleMonthlyDose(params: {
  days: number[];
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, string | number | object>;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();

  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    for (const day of params.days) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() + monthOffset,
        day,
        params.hours,
        params.minutes,
        0,
        0,
      );
      if (date <= now) continue;

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        alarmManager: { allowWhileIdle: true },
      };

      const id = await notifee.createTriggerNotification(
        buildNotificationPayload({
          title: params.title,
          body: params.body,
          data: params.data,
        }),
        trigger,
      );
      ids.push(id);
    }
  }
  return ids;
}

/* --------------------------- Cancel / Reschedule -------------------------- */

export async function cancelMedicationNotifications(
  notificationIds: string[],
): Promise<void> {
  await Promise.all(
    notificationIds.map((id) =>
      notifee.cancelTriggerNotification(id).catch(() => {}),
    ),
  );
}

export async function rescheduleMedicationNotifications(
  medication: Medication,
  previousIds: string[],
): Promise<string[]> {
  await cancelMedicationNotifications(previousIds);
  return scheduleMedicationNotifications(medication);
}

export async function rescheduleAllNotifications(
  medications: Medication[],
  getStoredIds: (medicationId: string) => string[],
  saveIds: (medicationId: string, ids: string[]) => void,
): Promise<void> {
  for (const med of medications) {
    if (!med.isActive) continue;
    const previousIds = getStoredIds(med.id);
    const newIds = await rescheduleMedicationNotifications(med, previousIds);
    saveIds(med.id, newIds);
  }
}

/* -------------------------------- Low stock ------------------------------- */

export async function scheduleLowStockNotification(
  medication: Medication,
  threshold = 5,
): Promise<string | null> {
  if (!medication.notificationSettings?.lowStockAlert) return null;
  if (medication.stock === undefined || medication.stock > threshold)
    return null;

  const title = medication.notificationSettings.hideName
    ? i18n.t("notifications.lowStockTitle")
    : i18n.t("notifications.lowStockTitleWithName", { name: medication.name });

  const body = i18n.t("notifications.lowStockBody", {
    count: medication.stock ?? 0,
  });
  const data = { medicationId: medication.id, type: "low_stock" };

  const id = await notifee.displayNotification(
    buildNotificationPayload({ title, body, data, withActions: false }),
  );
  return id;
}

/* --------------------------------- Snooze --------------------------------- */

export async function snoozeMedicationNotification(
  medication: Medication,
  time: string,
  minutes: number,
  dose?: string,
): Promise<{ id: string | null; title: string; body: string }> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return { id: null, title: "", body: "" };

  const title = buildTitle(medication);
  const body = buildBody(medication, dose || "", time);
  const triggerDate = new Date(Date.now() + minutes * 60000);
  const data = {
    medicationId: medication.id,
    scheduledTime: time,
    snoozed: 1,
    snoozeMinutes: minutes,
  };

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    alarmManager: { allowWhileIdle: true },
  };

  const id = await notifee.createTriggerNotification(
    buildNotificationPayload({ title, body, data }),
    trigger,
  );
  return { id, title, body };
}

/* --------------------------- Foreground handler --------------------------- */

export function onForegroundNotificationEvent(
  callback: (type: EventType, detail: any) => void,
): () => void {
  return notifee.onForegroundEvent((event: any) => {
    callback(event.type, event.detail);
  });
}

/* --------------------------- Background handler --------------------------- */
notifee.onBackgroundEvent(async ({ type, detail }: any) => {
  if (type !== EventType.ACTION_PRESS || !detail.pressAction?.id) return;

  const data = detail.notification?.data as
    | Record<string, string | number | object>
    | undefined;
  if (!data?.medicationId || !data?.scheduledTime) return;

  const { useLogStore } = await import("../store/logsStore");
  const { useMedicationStore } = await import("../store/medicationStore");
  const { getLocalDateString } = await import("../utils/dateUtils");

  const date = getLocalDateString(new Date());
  const actionId = detail.pressAction.id;

  if (actionId === ACTION_TAKEN) {
    const med = useMedicationStore
      .getState()
      .medications.find((m) => m.id === data.medicationId);
    const doseStr = med?.timeDoses?.find(
      (td) => td.time === data.scheduledTime,
    )?.dose;
    const doseAmount = doseStr ? parseInt(doseStr, 10) || undefined : undefined;

    const { logs, addLog, updateLog } = useLogStore.getState();
    const existing = logs.find(
      (l) =>
        l.medicationId === data.medicationId &&
        l.scheduledDate === date &&
        l.scheduledTime === data.scheduledTime,
    );
    if (existing) {
      updateLog(existing.id, {
        takenAt: new Date(),
        skipped: false,
        doseAmount,
      });
    } else {
      addLog({
        medicationId: data.medicationId as string,
        scheduledDate: date,
        scheduledTime: data.scheduledTime as string,
        takenAt: new Date(),
        skipped: false,
        doseAmount,
      });
    }
    if (doseAmount && doseAmount > 0) {
      useMedicationStore
        .getState()
        .updateStock(data.medicationId as string, -doseAmount);
    }
  } else if (actionId === ACTION_SKIP) {
    const { logs, addLog, updateLog } = useLogStore.getState();
    const existing = logs.find(
      (l) =>
        l.medicationId === data.medicationId &&
        l.scheduledDate === date &&
        l.scheduledTime === data.scheduledTime,
    );
    if (existing) {
      updateLog(existing.id, { skipped: true });
    } else {
      addLog({
        medicationId: data.medicationId as string,
        scheduledDate: date,
        scheduledTime: data.scheduledTime as string,
        skipped: true,
      });
    }
  }
});
