import { DefaultTheme, Theme as NavigationTheme } from "@react-navigation/native";
import { lightColors, darkColors } from "../constants/theme";

export function getNavigationTheme(isDark: boolean): NavigationTheme {
  const colors = isDark ? darkColors : lightColors;
  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surfaceElevated,
      border: colors.border,
      text: colors.textPrimary,
      notification: colors.error,
    },
  };
}
