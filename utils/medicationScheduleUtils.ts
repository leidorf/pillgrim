import { Medication, MedicationLog, LogStatus } from "../types/medication";

// Types
export type WeekdayMap = Record<number, number>;

export type DailyScheduleEntry = {
  medication: Medication;
  scheduledDate: string;
  scheduledTime: string;
  displayTime: string;
  dose: string;
  log: MedicationLog | undefined;
  status: LogStatus;
  logKey: string;
};

export type DayStats = {
  hasSchedule: boolean;
  totalMeds: number;
  takenMeds: number;
  skippedMeds: number;
  missedMeds: number;
  pendingMeds: number;
  adherenceRate: number;
};

// Schedule check
export function isMedicationScheduledForDate(
  med: Medication,
  date: Date,
  weekdayMap: WeekdayMap,
): boolean {
  if (!med.schedule || !med.isActive) return false;

  const { type, days, interval, startDate } = med.schedule;
  const dayOfMonth = date.getDate();
  const weekday = weekdayMap[date.getDay()];

  switch (type) {
    case "daily":
      return true;

    case "weekly":
      return days?.includes(weekday) ?? false;

    case "biweekly": {
      if (!startDate) return false;
      const diffDays = Math.floor(
        (date.getTime() - new Date(startDate).getTime()) / 86_400_000,
      );
      return diffDays >= 0 && diffDays % 14 === 0;
    }

    case "monthly":
      if (!startDate) return false;
      return dayOfMonth === new Date(startDate).getDate();

    case "specificmonth":
      return days?.includes(dayOfMonth) ?? false;

    case "interval": {
      if (!interval || !startDate) return false;
      const diffDays = Math.floor(
        (date.getTime() - new Date(startDate).getTime()) / 86_400_000,
      );
      return diffDays >= 0 && diffDays % interval === 0;
    }

    case "prn":
      return false;

    default:
      return false;
  }
}

// Status derivation
export function deriveStatus(
  log: MedicationLog | undefined,
  scheduledDate: string,
  scheduledTime: string,
  now: Date = new Date(),
): LogStatus {
  if (log?.takenAt && !log.skipped) return "taken";
  if (log?.skipped) return "skipped";

  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  if (scheduledDateTime < now) return "missed";

  return "pending";
}

// Core builder
export function buildDailySchedule(
  medications: Medication[],
  logs: MedicationLog[],
  date: Date,
  weekdayMap: WeekdayMap,
  formatTime: (time: string) => string,
  now: Date = new Date(),
): DailyScheduleEntry[] {
  const dateStr = getDateString(date);
  const dayLogs = logs.filter((l) => l.scheduledDate === dateStr);
  const entries: DailyScheduleEntry[] = [];

  for (const med of medications) {
    if (!isMedicationScheduledForDate(med, date, weekdayMap)) continue;
    if (!med.timeDoses?.length) continue;

    for (const td of med.timeDoses) {
      const log = dayLogs.find(
        (l) => l.medicationId === med.id && l.scheduledTime === td.time,
      );
      const status = deriveStatus(log, dateStr, td.time, now);

      entries.push({
        medication: med,
        scheduledDate: dateStr,
        scheduledTime: td.time,
        displayTime: formatTime(td.time),
        dose: td.dose,
        log,
        status,
        logKey: `${med.id}-${dateStr}-${td.time}`,
      });
    }
  }

  return entries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

// Day stats
export function computeDayStats(entries: DailyScheduleEntry[]): DayStats {
  if (entries.length === 0) {
    return {
      hasSchedule: false,
      totalMeds: 0,
      takenMeds: 0,
      skippedMeds: 0,
      missedMeds: 0,
      pendingMeds: 0,
      adherenceRate: 0,
    };
  }

  const takenMeds = entries.filter((e) => e.status === "taken").length;
  const skippedMeds = entries.filter((e) => e.status === "skipped").length;
  const missedMeds = entries.filter((e) => e.status === "missed").length;
  const pendingMeds = entries.filter((e) => e.status === "pending").length;
  const totalMeds = entries.length;

  const actionable = takenMeds + missedMeds;
  const adherenceRate =
    actionable > 0 ? Math.round((takenMeds / actionable) * 100) : 100;

  return {
    hasSchedule: true,
    totalMeds,
    takenMeds,
    skippedMeds,
    missedMeds,
    pendingMeds,
    adherenceRate,
  };
}

// Date range builder
export function buildScheduleForDateRange(
  medications: Medication[],
  logs: MedicationLog[],
  startDate: Date,
  endDate: Date,
  weekdayMap: WeekdayMap,
  formatTime: (time: string) => string,
  now: Date = new Date(),
): Map<string, DailyScheduleEntry[]> {
  const result = new Map<string, DailyScheduleEntry[]>();
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    const dateStr = getDateString(cursor);
    const entries = buildDailySchedule(
      medications,
      logs,
      new Date(cursor),
      weekdayMap,
      formatTime,
      now,
    );
    result.set(dateStr, entries);
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

// Filter entries
export function filterScheduleEntries(
  entries: DailyScheduleEntry[],
  status?: LogStatus | "all",
  medicationId?: string,
): DailyScheduleEntry[] {
  return entries.filter((e) => {
    if (medicationId && e.medication.id !== medicationId) return false;
    if (!status || status === "all") return true;
    return e.status === status;
  });
}

// Helpers
export function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
