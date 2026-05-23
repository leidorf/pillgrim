
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ScheduleType =
  | "daily"
  | "weekly"
  | "interval"
  | "prn"
  | "monthly"
  | "biweekly"
  | "specificmonth";

export type Schedule = {
  type: ScheduleType;
  days?: number[];
  interval?: number;
  startDate: string;
};

