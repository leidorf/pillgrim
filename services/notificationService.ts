import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { Medication } from "../types/medication";
import { Colors } from "../constants/theme";
import i18n from "../utils/i18n";
import { useSettingsStore } from "../store/settingsStore";

const CHANNEL_ID = "medication-reminders";
const CHANNEL_ID_FULLSCREEN = "medication-reminders-fullscreen";

const getGlobalHideNames = (): boolean =>
  useSettingsStore.getState().hideNotificationNames;
const getFullscreen = (): boolean =>
  useSettingsStore.getState().fullscreenNotification;
const activeChannelId = (): string =>
  getFullscreen() ? CHANNEL_ID_FULLSCREEN : CHANNEL_ID;

const CATEGORY_ID = "medication-actions";

/* --------------------------- Vibration patterns --------------------------- */
const VIBRATION_PATTERNS: Record<string, number[]> = {
  short: [0, 150, 100, 150],
  normal: [0, 250, 250, 250],
  long: [0, 500, 200, 500, 200, 500],
  alarm: [0, 500, 200, 500],
};

function getVibratePattern(): number[] | undefined {
  const { vibrationEnabled, vibrationPattern } = useSettingsStore.getState();
  if (!vibrationEnabled) return undefined;
  return VIBRATION_PATTERNS[vibrationPattern] ?? VIBRATION_PATTERNS.normal;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/* ---------------------- Register category with actions --------------------- */
export async function setupNotificationCategories(): Promise<void> {
  if (!Device.isDevice) return;
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: "taken",
      buttonTitle: i18n.t("notifications.actionTaken"),
      options: { opensAppToForeground: true },
    },
    {
      identifier: "skip",
      buttonTitle: i18n.t("notifications.actionSkip"),
      options: { opensAppToForeground: true },
    },
  ]);
}

/* ------------------------------- Permission ------------------------------- */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn("Notifications require physical device");
    return false;
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") return false;
    }
  } else {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") return false;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Medication Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.primary,
      sound: "default",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.NOTIFICATION,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      bypassDnd: false,
    });

    await Notifications.setNotificationChannelAsync(CHANNEL_ID_FULLSCREEN, {
      name: "Medication Reminders (Fullscreen)",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.primary,
      sound: "default",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.NOTIFICATION,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      bypassDnd: false,
    });
  }

  await setupNotificationCategories();

  return true;
}

/* -------------------------- Notification Content -------------------------- */
function buildContent(params: {
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Notifications.NotificationContentInput {
  return {
    title: params.title,
    body: params.body,
    data: params.data,
    sound: "default",
    priority: Notifications.AndroidNotificationPriority.HIGH,
    vibrate: getVibratePattern(),
    autoDismiss: true,
    color: Colors.primary,
    categoryIdentifier: CATEGORY_ID,
  };
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(":").map(Number);
  return { hours: h, minutes: m };
}

function toExpoWeekday(jsDay: number): number {
  return jsDay + 1;
}

function buildTitle(medication: Medication): string {
  if (getGlobalHideNames()) {
    return i18n.t("notifications.defaultTitle");
  }
  if (medication.notificationSettings?.hideName) {
    return i18n.t("notifications.defaultTitle");
  }
  return medication.name;
}

function buildBody(medication: Medication, dose: string, time: string): string {
  const parts: string[] = [];

  dose && parts.push(dose);
  if (medication.note && medication.note !== "any") {
    parts.push(noteLabel(medication.note));
  }

  return parts.length > 0
    ? parts.join(" · ")
    : i18n.t("notifications.defaultBody") + ` (${time})`;
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

/* ------------------------- Schedule Notifications ------------------------- */
export async function scheduleMedicationNotifications(
  medication: Medication,
): Promise<string[]> {
  if (!medication.notificationSettings?.enabled) return [];
  if (!medication.schedule || !medication.timeDoses?.length) return [];

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return [];

  const ids: string[] = [];
  const { schedule, timeDoses } = medication;

  for (const { time, dose } of timeDoses) {
    const { hours, minutes } = parseTime(time);
    const title = buildTitle(medication);
    const body = buildBody(medication, dose, time);
    const data: Record<string, unknown> = {
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

/* ----------------------------- Schedule Daily ----------------------------- */
async function scheduleDailyDose(params: {
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Promise<string[]> {
  const id = await Notifications.scheduleNotificationAsync({
    content: buildContent({
      title: params.title,
      body: params.body,
      data: params.data,
    }),
    trigger: {
      channelId: activeChannelId(),
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: params.hours,
      minute: params.minutes,
    },
  });
  return [id];
}

/* ----------------------------- Schedule Weekly ---------------------------- */
async function scheduleWeeklyDose(params: {
  days: number[];
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Promise<string[]> {
  const ids: string[] = [];

  for (const day of params.days) {
    const id = await Notifications.scheduleNotificationAsync({
      content: buildContent({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger: {
        channelId: activeChannelId(),
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: toExpoWeekday(day),
        hour: params.hours,
        minute: params.minutes,
      },
    });
    ids.push(id);
  }

  return ids;
}

/* --------------------------- Schedule Biweekly --------------------------- */
async function scheduleBiweeklyDose(params: {
  startDate: string;
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();

  let next = new Date(params.startDate);
  next.setHours(params.hours, params.minutes, 0, 0);

  while (next <= now) {
    next.setDate(next.getDate() + 14);
  }
  const maxOccurrences = 26;

  for (let i = 0; i < maxOccurrences; i++) {
    const trigger = new Date(next);
    trigger.setDate(trigger.getDate() + i * 14);

    const id = await Notifications.scheduleNotificationAsync({
      content: buildContent({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger: {
        channelId: activeChannelId(),
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
    ids.push(id);
  }

  return ids;
}

/* ---------------------------- Schedule Interval --------------------------- */
async function scheduleIntervalDose(params: {
  intervalDays: number;
  startDate: string;
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();

  let next = new Date(params.startDate);
  next.setHours(params.hours, params.minutes, 0, 0);

  while (next <= now) {
    next.setDate(next.getDate() + params.intervalDays);
  }

  const maxOccurrences = Math.min(64, Math.floor(365 / params.intervalDays));

  for (let i = 0; i < maxOccurrences; i++) {
    const trigger = new Date(next);
    trigger.setDate(trigger.getDate() + i * params.intervalDays);

    const id = await Notifications.scheduleNotificationAsync({
      content: buildContent({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger: {
        channelId: activeChannelId(),
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
    ids.push(id);
  }

  return ids;
}

/* ---------------------------- Schedule Monthly ---------------------------- */
async function scheduleMonthlyDose(params: {
  days: number[];
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
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

      const id = await Notifications.scheduleNotificationAsync({
        content: buildContent({
          title: params.title,
          body: params.body,
          data: params.data,
        }),
        trigger: {
          channelId: activeChannelId(),
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
      ids.push(id);
    }
  }

  return ids;
}

/* --------------------------------- Cancel --------------------------------- */
export async function cancelMedicationNotifications(
  notificationIds: string[],
): Promise<void> {
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}

/* ------------------------------- Reschedule ------------------------------- */
export async function rescheduleMedicationNotifications(
  medication: Medication,
  previousIds: string[],
): Promise<string[]> {
  await cancelMedicationNotifications(previousIds);
  return scheduleMedicationNotifications(medication);
}

/* ----------------------------- Reschedule All ----------------------------- */
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

/* ----------------------------- Low Stock Alert ---------------------------- */
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

  const id = await Notifications.scheduleNotificationAsync({
    content: buildContent({
      title,
      body,
      data: { medicationId: medication.id, type: "low_stock" },
    }),
    trigger: null,
  });

  return id;
}

/* ------------------------------- Snooze ----------------------------------- */
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

  const id = await Notifications.scheduleNotificationAsync({
    content: buildContent({
      title,
      body,
      data: {
        medicationId: medication.id,
        scheduledTime: time,
        snoozed: true,
        snoozeMinutes: minutes,
      },
    }),
    trigger: {
      channelId: activeChannelId(),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return { id, title, body };
}
