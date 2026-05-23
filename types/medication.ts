import { Schedule } from "./schedule";

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
  notificationIds?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MedicationLog = {
  id: string;
  medicationId: string;
  scheduledDate: string;
  scheduledTime: string;
  doseAmount?: number;
  takenAt?: Date;
  skipped?: boolean;
  doseTaken?: string;
};

export type LogStatus = "pending" | "taken" | "skipped" | "missed";


export type LogFilter = {
  startDate: string;
  endDate: string;
  medicationId?: string;
  status?: LogStatus | "all";
};
