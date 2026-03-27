export const DOSE_UNITS_BY_FORM: Record<
  string,
  { label: string; value: string; needsAmount: boolean }[]
> = {
  tablet: [
    { label: "mg", value: "mg", needsAmount: true },
    { label: "g", value: "g", needsAmount: true },
    { label: "tablet", value: "tablet", needsAmount: true },
  ],
  capsule: [
    { label: "mg", value: "mg", needsAmount: true },
    { label: "g", value: "g", needsAmount: true },
    { label: "capsule", value: "capsule", needsAmount: true },
  ],
  syrup: [
    { label: "mL", value: "ml", needsAmount: true },
    { label: "mg", value: "mg", needsAmount: true },
    { label: "tsp", value: "tsp", needsAmount: true },
    { label: "tbsp", value: "tbsp", needsAmount: true },
  ],
  drop: [
    { label: "drops", value: "drop", needsAmount: true },
    { label: "mL", value: "ml", needsAmount: true },
  ],
  injection: [
    { label: "mL", value: "ml", needsAmount: true },
    { label: "mg", value: "mg", needsAmount: true },
    { label: "IU", value: "iu", needsAmount: true },
    { label: "ampule", value: "ampule", needsAmount: true },
  ],
  spray: [
    { label: "puff", value: "puff", needsAmount: true },
    { label: "spray", value: "spray", needsAmount: true },
    { label: "mL", value: "ml", needsAmount: true },
  ],
  cream: [
    { label: "g", value: "g", needsAmount: true },
    { label: "mg", value: "mg", needsAmount: true },
    { label: "application", value: "application", needsAmount: false },
  ],
};

export const DEFAULT_UNITS = [
  { label: "mg", value: "mg", needsAmount: true },
  { label: "mL", value: "ml", needsAmount: true },
  { label: "tablet", value: "tablet", needsAmount: true },
  { label: "drops", value: "drop", needsAmount: true },
];
