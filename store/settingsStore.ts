import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type TimeFormat = "12h" | "24h";

type SettingsStore = {
  timeFormat: TimeFormat;
  weekStartsOn: WeekStart;
  setTimeFormat: (format: TimeFormat) => void;
  setWeekStartsOn: (start: WeekStart) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      timeFormat: "24h",
      weekStartsOn: 1,
      setTimeFormat: (format) => set({ timeFormat: format }),
      setWeekStartsOn: (start) => set({ weekStartsOn: start }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
