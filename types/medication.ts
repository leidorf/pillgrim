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
  id: string;
  name: string;
  form?:
    | "tablet"
    | "capsule"
    | "syrup"
    | "drop"
    | "injection"
    | "spray"
    | "cream";
  schedule?: Schedule;
  timeDoses?: {
    time: string;
    dose: string;
  }[];
  /* -------------------------------- Optional -------------------------------- */
  note?:
    | "before_meal"
    | "with_meal"
    | "after_meal"
    | "empty_stomach"
    | "any"
    | string;
  stock?: number;
  photoUri?: string;
  notificationSettings?: {
    enabled: boolean;
    hideName: boolean;
    lowStockAlert: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MedicationLog = {
  id: string;
  medicationId: string;
  scheduledDate: string;
  scheduledTime: string;
  takenAt?: Date;
  skipped?: boolean;
  doseTaken?: string;
};

export type LogStatus = "pending" | "taken" | "skipped" | "missed";

export type MedicationProps = Medication & {
  onToggle?: (id: string, time: string) => void;
  onSkip?: (id: string, time: string) => void;
  status?: LogStatus;
};

export type DailySchedule = {
  date: string;
  medications: {
    medication: Medication;
    times: {
      time: string;
      log?: MedicationLog;
      status: LogStatus;
    }[];
  }[];
};

export type LogFilter = {
  startDate: string;
  endDate: string;
  medicationId?: string;
  status?: LogStatus | "all";
};
