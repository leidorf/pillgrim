import { DefaultTheme } from "@react-navigation/native";
import { Colors } from "../constants/theme";

export const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.surfaceElevated,
    border: Colors.border,
    text: Colors.textPrimary,
    notification: Colors.error,
  },
};
