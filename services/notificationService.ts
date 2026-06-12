import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Medication } from "../types/medication";
import { Colors } from "../constants/theme";
import i18n from "../utils/i18n";
import { useSettingsStore } from "../store/settingsStore";
import { resolveNotificationSound } from "../utils/notificationSounds";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHANNEL_ID = "medication-reminders";
const CATEGORY_ID = "medication-actions";
const ACTION_TAKEN = "taken";
const ACTION_SKIP = "skip";
const PERM_DENIED_KEY = "notification_permission_denied";

/* ---------------------- Settings helpers (safe outside React) ---------------------- */
export const VIBRATION_PATTERNS: Record<string, number[]> = {
  short: [10, 150, 100, 150],
  normal: [10, 250, 250, 250],
  long: [10, 500, 200, 500, 200, 500],
  alarm: [10, 500, 200, 500],
};

const getVibration = (): number[] | undefined => {
  const { vibrationEnabled, vibrationPattern } = useSettingsStore.getState();
  if (!vibrationEnabled) return undefined;
  return VIBRATION_PATTERNS[vibrationPattern] ?? VIBRATION_PATTERNS.normal;
};

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

/* ------------------- Shared notification content builder ------------------ */
function buildNotificationContent(params: {
  title: string;
  body: string;
  data: Record<string, unknown>;
  withActions?: boolean;
}) {
  const vibration = getVibration();
  const showActions = params.withActions !== false;
  const soundPref = useSettingsStore.getState().notificationSound;
  const sound = resolveNotificationSound(soundPref);
  console.log("[Notifications] buildNotificationContent sound:", {
    soundPref,
    resolved: sound,
    platform: Platform.OS,
    title: params.title,
  });

  return {
    title: params.title,
    body: params.body,
    data: params.data,
    ...(sound !== undefined ? { sound } : {}),
    color: Colors.primary,
    ...(vibration ? { vibrate: vibration } : {}),
    priority: Notifications.AndroidNotificationPriority.HIGH,
    categoryIdentifier: showActions ? CATEGORY_ID : undefined,
    autoDismiss: true,
  };
}

function getSoundChannelId(): string {
  if (Platform.OS !== "android") return CHANNEL_ID;
  const { notificationSound } = useSettingsStore.getState();
  const sound = resolveNotificationSound(notificationSound);
  if (!sound || sound === "default") return CHANNEL_ID;
  return `${CHANNEL_ID}-${notificationSound}`;
}

/* --------------- Channel, category & handler setup ---------------- */
export async function ensureChannel(): Promise<string> {
  if (Platform.OS !== "android") return CHANNEL_ID;

  const channelId = getSoundChannelId();
  const { notificationSound } = useSettingsStore.getState();
  const resolvedSound = resolveNotificationSound(notificationSound);
  const sound: string =
    typeof resolvedSound === "string" ? resolvedSound : "default";
  const vibration = getVibration();

  await Notifications.setNotificationChannelAsync(channelId, {
    name: "Medication Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: vibration ?? null,
    sound,
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: vibration !== undefined,
  });

  return channelId;
}

let categoryEnsured = false;

export async function ensureCategory(): Promise<void> {
  if (categoryEnsured) return;
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: ACTION_TAKEN,
      buttonTitle: i18n.t("notifications.actionTaken"),
      options: { opensAppToForeground: true },
    },
    {
      identifier: ACTION_SKIP,
      buttonTitle: i18n.t("notifications.actionSkip"),
      options: { opensAppToForeground: true },
    },
  ]);
  categoryEnsured = true;
}

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/* ---------------------------- Permission check ---------------------------- */
export async function checkNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/* ------------------------- Permission request ---------------------------- */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();

  if (status === "granted") return true;
  if (!canAskAgain) return false;

  const wasDenied = await AsyncStorage.getItem(PERM_DENIED_KEY);
  if (wasDenied === "true") return false;

  const result = await Notifications.requestPermissionsAsync();

  if (result.status !== "granted") {
    await AsyncStorage.setItem(PERM_DENIED_KEY, "true");
    return false;
  }

  if (Platform.OS === "android") {
    try {
      await ensureChannel();
    } catch (err) {
      console.error("[Notifications] Channel creation failed:", err);
    }
  }

  return true;
}

/* -------------------------- Schedule functions --------------------------- */
export async function scheduleMedicationNotifications(
  medication: Medication,
): Promise<string[]> {
  if (!medication.notificationSettings?.enabled) return [];
  if (!medication.schedule || !medication.timeDoses?.length) return [];

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn(
      "[Notifications] Permission denied - no notifications scheduled",
    );
    return [];
  }

  await ensureCategory();
  const channelId = await ensureChannel();
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
          channelId,
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
          channelId,
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
          channelId,
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
            channelId,
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
          channelId,
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
          channelId,
        });
        break;
      case "prn":
        break;
    }

    ids.push(...notificationIds);
  }

  return ids;
}

/* ------------------------------- Daily --------------------------------- */
async function scheduleDailyDose(params: {
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channelId: string;
}): Promise<string[]> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: buildNotificationContent({
        title: params.title,
        body: params.body,
        data: params.data,
      }),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: params.channelId,
        hour: params.hours,
        minute: params.minutes,
      },
    });
    console.log("[Notifications] Daily trigger:", id);
    return [id];
  } catch (err: any) {
    console.error("[Notifications] Daily trigger FAILED:", err?.message ?? err);
    return [];
  }
}

/* ------------------------------ Weekly --------------------------------- */
async function scheduleWeeklyDose(params: {
  days: number[];
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channelId: string;
}): Promise<string[]> {
  const ids: string[] = [];
  for (const day of params.days) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: buildNotificationContent({
          title: params.title,
          body: params.body,
          data: params.data,
        }),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId: params.channelId,
          weekday: day + 1,
          hour: params.hours,
          minute: params.minutes,
        },
      });
      console.log("[Notifications] Weekly trigger:", id, "weekday:", day + 1);
      ids.push(id);
    } catch (err: any) {
      console.error(
        "[Notifications] Weekly trigger FAILED:",
        err?.message ?? err,
      );
    }
  }
  return ids;
}

/* ----------------------------- Biweekly ------------------------------- */
async function scheduleBiweeklyDose(params: {
  startDate: string;
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channelId: string;
}): Promise<string[]> {
  const ids: string[] = [];
  const now = new Date();
  let next = new Date(params.startDate);
  next.setHours(params.hours, params.minutes, 0, 0);
  while (next <= now) next.setDate(next.getDate() + 14);

  for (let i = 0; i < 26; i++) {
    const triggerDate = new Date(next);
    triggerDate.setDate(triggerDate.getDate() + i * 14);
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: buildNotificationContent({
          title: params.title,
          body: params.body,
          data: params.data,
        }),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: params.channelId,
        },
      });
      ids.push(id);
    } catch (err: any) {
      console.error(
        "[Notifications] Biweekly trigger FAILED:",
        err?.message ?? err,
      );
    }
  }
  return ids;
}

/* ----------------------------- Interval ------------------------------- */
async function scheduleIntervalDose(params: {
  intervalDays: number;
  startDate: string;
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channelId: string;
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
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: buildNotificationContent({
          title: params.title,
          body: params.body,
          data: params.data,
        }),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: params.channelId,
        },
      });
      ids.push(id);
    } catch (err: any) {
      console.error(
        "[Notifications] Interval trigger FAILED:",
        err?.message ?? err,
      );
    }
  }
  return ids;
}

/* ----------------------------- Monthly ------------------------------- */
async function scheduleMonthlyDose(params: {
  days: number[];
  hours: number;
  minutes: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channelId: string;
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
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: buildNotificationContent({
            title: params.title,
            body: params.body,
            data: params.data,
          }),
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
            channelId: params.channelId,
          },
        });
        ids.push(id);
      } catch (err: any) {
        console.error(
          "[Notifications] Monthly trigger FAILED:",
          err?.message ?? err,
        );
      }
    }
  }
  return ids;
}

/* -------------------------- Cancel / Reschedule ------------------------- */
export async function cancelMedicationNotifications(
  notificationIds: string[],
): Promise<void> {
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
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

/* ------------------------------- Low stock ------------------------------ */
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
  const channelId = await ensureChannel();

  const id = await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent({
      title,
      body,
      data,
      withActions: false,
    }),
    trigger:
      Platform.OS === "android"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(Date.now() + 1000),
            channelId,
          }
        : null,
  });
  return id;
}

/* -------------------------------- Snooze -------------------------------- */
export async function snoozeMedicationNotification(
  medication: Medication,
  time: string,
  minutes: number,
  dose?: string,
): Promise<{ id: string | null; title: string; body: string }> {
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) return { id: null, title: "", body: "" };

  const title = buildTitle(medication);
  const body = buildBody(medication, dose || "", time);
  const triggerDate = new Date(Date.now() + minutes * 60000);
  const data: Record<string, unknown> = {
    medicationId: medication.id,
    scheduledTime: time,
    snoozed: 1,
    snoozeMinutes: minutes,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent({ title, body, data }),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: CHANNEL_ID,
    },
  });
  return { id, title, body };
}

/* -------------------------- Foreground listener ------------------------- */
export function onForegroundNotificationEvent(
  callback: (
    actionIdentifier: string,
    response: Notifications.NotificationResponse,
  ) => void,
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const actionId = response.actionIdentifier;
      if (
        actionId === Notifications.DEFAULT_ACTION_IDENTIFIER ||
        actionId === ACTION_TAKEN ||
        actionId === ACTION_SKIP
      ) {
        callback(actionId, response);
      }
    },
  );
  return () => subscription.remove();
}

/* ----------------------- Shared action processor ------------------------ */
export async function processNotificationAction(
  actionId: string,
  medicationId: string,
  scheduledTime: string,
): Promise<void> {
  const { useLogStore } = await import("../store/logsStore");
  const { useMedicationStore } = await import("../store/medicationStore");
  const { getLocalDateString } = await import("../utils/dateUtils");

  const date = getLocalDateString(new Date());

  for (let i = 0; i < 5; i++) {
    const { medications } = useMedicationStore.getState();
    if (medications.length > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (actionId === ACTION_TAKEN) {
    const med = useMedicationStore
      .getState()
      .medications.find((m) => m.id === medicationId);
    const doseStr = med?.timeDoses?.find(
      (td) => td.time === scheduledTime,
    )?.dose;
    const doseAmount = doseStr ? parseInt(doseStr, 10) || undefined : undefined;

    const { logs, addLog, updateLog } = useLogStore.getState();
    const existing = logs.find(
      (l) =>
        l.medicationId === medicationId &&
        l.scheduledDate === date &&
        l.scheduledTime === scheduledTime,
    );
    if (existing) {
      updateLog(existing.id, {
        takenAt: new Date(),
        skipped: false,
        doseAmount,
      });
    } else {
      addLog({
        medicationId,
        scheduledDate: date,
        scheduledTime,
        takenAt: new Date(),
        skipped: false,
        doseAmount,
      });
    }
    if (doseAmount && doseAmount > 0) {
      useMedicationStore.getState().updateStock(medicationId, -doseAmount);
    }
  } else if (actionId === ACTION_SKIP) {
    const { logs, addLog, updateLog } = useLogStore.getState();
    const existing = logs.find(
      (l) =>
        l.medicationId === medicationId &&
        l.scheduledDate === date &&
        l.scheduledTime === scheduledTime,
    );
    if (existing) {
      updateLog(existing.id, { skipped: true });
    } else {
      addLog({
        medicationId,
        scheduledDate: date,
        scheduledTime,
        skipped: true,
      });
    }
  }
}

/* ----------------------- Background handler (cold-start helper) --------- */
export function getInitialNotificationResponse(): Notifications.NotificationResponse | null {
  return Notifications.getLastNotificationResponse();
}

export function clearInitialNotificationResponse(): void {
  Notifications.clearLastNotificationResponse();
}
