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

export type Medication = {
  id?: string;
  name: string;
  form?: "pill" | "tablet" | "syringe" | string;
  schedule?: Schedule;
  times?: string[];
  dose?: string;
  /* -------------------------------- Optional -------------------------------- */
  stock?: number;
  note?:
    | "Before Meal"
    | "With Meal"
    | "After Meal"
    | "Doesn't Matter"
    | undefined;
  isTaken?: boolean;
  isActive?: boolean;
};

export type MedicationLog = {
  medicationId: string;
  takenAt: Date;
  action: "taken" | "untaken";
};

export type MedicationProps = Medication & {
  onToggle?: (id: string) => void;
};
