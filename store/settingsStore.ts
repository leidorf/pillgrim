import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontScale } from "../theme/typography";
import { ThemeMode } from "../constants/theme";

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type TimeFormat = "12h" | "24h";

type SettingsStore = {
  timeFormat: TimeFormat;
  weekStartsOn: WeekStart;
  fontScale: FontScale;
  themeMode: ThemeMode;
  setTimeFormat: (format: TimeFormat) => void;
  setWeekStartsOn: (start: WeekStart) => void;
  setFontScale: (scale: FontScale) => void;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      timeFormat: "24h",
      weekStartsOn: 1,
      fontScale: "normal",
      themeMode: "system",
      setTimeFormat: (format) => set({ timeFormat: format }),
      setWeekStartsOn: (start) => set({ weekStartsOn: start }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
