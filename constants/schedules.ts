import { ScheduleType } from "../types/medication";

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
