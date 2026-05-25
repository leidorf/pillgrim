export type ThemeMode = "system" | "light" | "dark";

export type Theme = {
  primary: string;
  primaryDark: string;
  primaryText: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  border: string;
  borderLight: string;
};

export const lightColors: Theme = {
  primary: "#7CB342",
  primaryDark: "#4B7A26",
  primaryText: "#33691E",
  background: "#FAFBFA",
  surface: "#EEF1EC",
  surfaceElevated: "#FFFFFF",
  textPrimary: "#1B1E1B",
  textSecondary: "#535953",
  textMuted: "#696D69",
  textDisabled: "#AFB5AF",
  success: "#2E7D32",
  successLight: "#E8F5E9",
  error: "#C62828",
  errorLight: "#FFEBEE",
  warning: "#C24100",
  warningLight: "#FFF3E0",
  border: "#DCE0D9",
  borderLight: "#EDF0EB",
} as const;

export const darkColors: Theme = {
  primary: "#8BC34A",
  primaryDark: "#9CCC65",
  primaryText: "#AED581",
  background: "#101410",
  surface: "#1A1E1A",
  surfaceElevated: "#242924",
  textPrimary: "#E4E8E0",
  textSecondary: "#A8AFA8",
  textMuted: "#848A84",
  textDisabled: "#5A605A",
  success: "#4CAF50",
  successLight: "#1B2E1E",
  error: "#EF5350",
  errorLight: "#3B1C1C",
  warning: "#FF9800",
  warningLight: "#3A2410",
  border: "#2A2F2A",
  borderLight: "#1E221E",
} as const;

export const Colors = lightColors;
