import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { Medication } from "../types/medication";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
    await Notifications.setNotificationChannelAsync("medication-reminders", {
      name: "Medication Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#689F38",
      sound: "default",
    });
  }
  return true;
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(":").map(Number);
  return { hours: h, minutes: m };
}

function toExpoWeekday(jsDay: number): number {
  return jsDay + 1;
}

function buildTitle(medication: Medication): string {
  if (medication.notificationSettings?.hideName) {
    return "Medication Reminder";
  }
  return `${medication.name}`;
}

function buildBody(medication: Medication, dose: string, time: string): string {
  const parts: string[] = [];

  dose && parts.push(dose);
  if (medication.note && medication.note !== "any") {
    parts.push(noteLabel(medication.note));
  }

  return parts.length > 0
    ? parts.join(" · ")
    : `Time to take your medication (${time})`;
}

function noteLabel(note: string): string {
  const map: Record<string, string> = {
    before_meal: "Before meal",
    with_meal: "With meal",
    after_meal: "After meal",
    empty_stomach: "On empty stomach",
  };
  return map[note] ?? note;
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
      case "biweekly":
        notificationIds = await scheduleWeeklyDose({
          days: schedule.days ?? [],
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

      case "monthly":
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
    content: { title: params.title, body: params.body, data: params.data },
    trigger: {
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
      content: { title: params.title, body: params.body, data: params.data },
      trigger: {
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
      content: { title: params.title, body: params.body, data: params.data },
      trigger: {
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
        content: { title: params.title, body: params.body, data: params.data },
        trigger: {
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
    ? "Low Medication Stock"
    : `Low ${medication.name} Stock`;

  const body = `Only ${medication.stock} dose${medication.stock === 1 ? "" : "s"} remaining. Time to refill.`;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { medicationId: medication.id, type: "low_stock" },
    },
    trigger: null,
  });

  return id;
}
