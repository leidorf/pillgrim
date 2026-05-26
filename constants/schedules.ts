import { ScheduleType } from "../types/schedule";

export const TIER1_SCHEDULES: { id: ScheduleType; label: string; labelKey: string }[] = [
  { id: "daily", label: "Every Day", labelKey: "schedules.daily" },
  { id: "weekly", label: "Specific Weekdays", labelKey: "schedules.weekly" },
  { id: "interval", label: "Every X Days", labelKey: "schedules.interval" },
  { id: "prn", label: "Use as Needed", labelKey: "schedules.prn" },
];

export const TIER2_SCHEDULES: { id: ScheduleType; label: string; labelKey: string }[] = [
  { id: "monthly", label: "Once a Month", labelKey: "schedules.monthly" },
  { id: "biweekly", label: "Every 2 Weeks", labelKey: "schedules.biweekly" },
  { id: "specificmonth", label: "Specific Days of the Month", labelKey: "schedules.specificmonth" },
];

export const WEEKDAY_LABELS = [
  { value: 0 as const, label: "Sunday", labelKey: "weekdays.sunday" },
  { value: 1 as const, label: "Monday", labelKey: "weekdays.monday" },
  { value: 2 as const, label: "Tuesday", labelKey: "weekdays.tuesday" },
  { value: 3 as const, label: "Wednesday", labelKey: "weekdays.wednesday" },
  { value: 4 as const, label: "Thursday", labelKey: "weekdays.thursday" },
  { value: 5 as const, label: "Friday", labelKey: "weekdays.friday" },
  { value: 6 as const, label: "Saturday", labelKey: "weekdays.saturday" },
];

export const WEEKDAYS = [
  { id: 0, label: "Su", labelKey: "weekdays.sunShort" },
  { id: 1, label: "Mo", labelKey: "weekdays.monShort" },
  { id: 2, label: "Tu", labelKey: "weekdays.tueShort" },
  { id: 3, label: "We", labelKey: "weekdays.wedShort" },
  { id: 4, label: "Th", labelKey: "weekdays.thuShort" },
  { id: 5, label: "Fr", labelKey: "weekdays.friShort" },
  { id: 6, label: "Sa", labelKey: "weekdays.satShort" },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
