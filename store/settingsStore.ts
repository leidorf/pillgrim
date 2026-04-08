import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TimeFormat = "12h" | "24h";

type SettingsStore = {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      timeFormat: "24h",
      setTimeFormat: (format) => set({ timeFormat: format }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);