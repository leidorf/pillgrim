import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontScale } from "../theme/typography";
import { ThemeMode } from "../constants/theme";
import i18n, { getSystemLanguage, LanguageCode } from "../utils/i18n";

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type TimeFormat = "12h" | "24h";

export type LanguageSetting = LanguageCode | "system";

type SettingsStore = {
  timeFormat: TimeFormat;
  weekStartsOn: WeekStart;
  fontScale: FontScale;
  themeMode: ThemeMode;
  language: LanguageSetting;
  hideNotificationNames: boolean;
  fullscreenNotification: boolean;
  vibrationEnabled: boolean;
  vibrationPattern: "short" | "normal" | "long" | "alarm";
  setTimeFormat: (format: TimeFormat) => void;
  setWeekStartsOn: (start: WeekStart) => void;
  setFontScale: (scale: FontScale) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: LanguageSetting) => void;
  setHideNotificationNames: (hide: boolean) => void;
  setFullscreenNotification: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setVibrationPattern: (pattern: "short" | "normal" | "long" | "alarm") => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      timeFormat: "24h",
      weekStartsOn: 1,
      fontScale: "normal",
      themeMode: "system",
      language: "system",
      hideNotificationNames: false,
      fullscreenNotification: false,
      setTimeFormat: (format) => set({ timeFormat: format }),
      setWeekStartsOn: (start) => set({ weekStartsOn: start }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setHideNotificationNames: (hide) => set({ hideNotificationNames: hide }),
      setFullscreenNotification: (enabled) =>
        set({ fullscreenNotification: enabled }),
      vibrationEnabled: true,
      vibrationPattern: "normal",
      setVibrationEnabled: (enabled: boolean) =>
        set({ vibrationEnabled: enabled }),
      setVibrationPattern: (pattern: "short" | "normal" | "long" | "alarm") =>
        set({ vibrationPattern: pattern }),
      setLanguage: (lang) => {
        const resolved = lang === "system" ? getSystemLanguage() : lang;
        i18n.changeLanguage(resolved);
        set({ language: lang });
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
