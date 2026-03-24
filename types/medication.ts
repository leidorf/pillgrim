export type Medication = {
  id?: string;
  name: string;
  dose?: string;
  stock?: number;
  time?: string;
  schedule?: string;
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
