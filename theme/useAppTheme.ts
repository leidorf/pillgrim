import { Appearance, useColorScheme } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { lightColors, darkColors } from "../constants/theme";

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const [appearanceScheme, setAppearanceScheme] = useState(
    Appearance.getColorScheme(),
  );
  const themeMode = useSettingsStore((s) => s.themeMode);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setAppearanceScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      const effectiveScheme = systemScheme ?? appearanceScheme ?? "light";
      return effectiveScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemScheme, appearanceScheme]);

  return useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
}
