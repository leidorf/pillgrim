export type UnitOption = {
  label: string;
  value: string;
  needsAmount: boolean;
  labelKey?: string;
};

export const DOSE_UNITS_BY_FORM: Record<string, UnitOption[]> = {
  tablet: [
    { label: "mg", value: "mg", needsAmount: true },
    { label: "g", value: "g", needsAmount: true },
    { label: "tablet", value: "tablet", needsAmount: true, labelKey: "units.tablet" },
  ],
  capsule: [
    { label: "mg", value: "mg", needsAmount: true },
    { label: "g", value: "g", needsAmount: true },
    { label: "capsule", value: "capsule", needsAmount: true, labelKey: "units.capsule" },
  ],
  syrup: [
    { label: "mL", value: "ml", needsAmount: true },
    { label: "mg", value: "mg", needsAmount: true },
    { label: "tsp", value: "tsp", needsAmount: true, labelKey: "units.tsp" },
    { label: "tbsp", value: "tbsp", needsAmount: true, labelKey: "units.tbsp" },
  ],
  drop: [
    { label: "drops", value: "drop", needsAmount: true, labelKey: "units.drops" },
    { label: "mL", value: "ml", needsAmount: true },
  ],
  injection: [
    { label: "mL", value: "ml", needsAmount: true },
    { label: "mg", value: "mg", needsAmount: true },
    { label: "IU", value: "iu", needsAmount: true },
    { label: "ampule", value: "ampule", needsAmount: true, labelKey: "units.ampule" },
  ],
  spray: [
    { label: "puff", value: "puff", needsAmount: true, labelKey: "units.puff" },
    { label: "spray", value: "spray", needsAmount: true, labelKey: "units.spray" },
    { label: "mL", value: "ml", needsAmount: true },
  ],
  cream: [
    { label: "g", value: "g", needsAmount: true },
    { label: "mg", value: "mg", needsAmount: true },
    { label: "application", value: "application", needsAmount: false, labelKey: "units.application" },
  ],
};

export const DEFAULT_UNITS: UnitOption[] = [
  { label: "mg", value: "mg", needsAmount: true },
  { label: "mL", value: "ml", needsAmount: true },
  { label: "tablet", value: "tablet", needsAmount: true, labelKey: "units.tablet" },
  { label: "drops", value: "drop", needsAmount: true, labelKey: "units.drops" },
];
