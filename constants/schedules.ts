import { ScheduleType } from "../types/schedule";

export const TIER1_SCHEDULES: { id: ScheduleType; label: string }[] = [
  { id: "daily", label: "Every Day" },
  { id: "weekly", label: "Specific Weekdays" },
  { id: "interval", label: "Every X Days" },
  { id: "prn", label: "Use as Needed" },
];

export const TIER2_SCHEDULES: { id: ScheduleType; label: string }[] = [
  { id: "monthly", label: "Once a Month" },
  { id: "biweekly", label: "Every 2 Weeks" },
  { id: "specificmonth", label: "Specific Days of the Month" },
];

export const WEEKDAY_LABELS = [
  { value: 0 as const, label: "Sunday" },
  { value: 1 as const, label: "Monday" },
  { value: 2 as const, label: "Tuesday" },
  { value: 3 as const, label: "Wednesday" },
  { value: 4 as const, label: "Thursday" },
  { value: 5 as const, label: "Friday" },
  { value: 6 as const, label: "Saturday" },
];

export const WEEKDAYS = [
  { id: 0, label: "Su" },
  { id: 1, label: "Mo" },
  { id: 2, label: "Tu" },
  { id: 3, label: "We" },
  { id: 4, label: "Th" },
  { id: 5, label: "Fr" },
  { id: 6, label: "Sa" },
];