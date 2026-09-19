import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontScale } from "../theme/typography";
import { ThemeMode } from "../constants/theme";
import i18n, { getSystemLanguage, LanguageCode } from "../utils/i18n";
import { NotificationSound } from "../utils/notificationSounds";

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type VibrationPattern = "short" | "normal" | "long" | "alarm";

type TimeFormat = "12h" | "24h";

export type LanguageSetting = LanguageCode | "system";

type SettingsStoreProps = {
  timeFormat: TimeFormat;
  weekStartsOn: WeekStart;
  fontScale: FontScale;
  themeMode: ThemeMode;
  language: LanguageSetting;
  hideNotificationNames: boolean;
  vibrationEnabled: boolean;
  vibrationPattern: VibrationPattern;
  notificationSound: NotificationSound;
  isOnboardCompleted: boolean;
  _hasHydrated: boolean;
  setTimeFormat: (format: TimeFormat) => void;
  setWeekStartsOn: (start: WeekStart) => void;
  setFontScale: (scale: FontScale) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: LanguageSetting) => void;
  setHideNotificationNames: (hide: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setVibrationPattern: (pattern: VibrationPattern) => void;
  setNotificationSound: (sound: NotificationSound) => void;
  setIsOnboardCompleted: (completed: boolean) => void;
  resetOnboarding: () => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useSettingsStore = create<SettingsStoreProps>()(
  persist(
    (set) => ({
      timeFormat: "24h",
      weekStartsOn: 1,
      fontScale: "normal",
      themeMode: "system",
      language: "system",
      hideNotificationNames: false,
      vibrationEnabled: true,
      vibrationPattern: "normal",
      notificationSound: "default",
      isOnboardCompleted: false,
      _hasHydrated: false,
      setTimeFormat: (format) => set({ timeFormat: format }),
      setWeekStartsOn: (start) => set({ weekStartsOn: start }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setLanguage: (language) => {
        const resolved = language === "system" ? getSystemLanguage() : language;
        i18n.changeLanguage(resolved);
        set({ language: language });
      },
      setHideNotificationNames: (hide) => set({ hideNotificationNames: hide }),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      setVibrationPattern: (pattern) => set({ vibrationPattern: pattern }),
      setNotificationSound: (sound) => set({ notificationSound: sound }),
      setIsOnboardCompleted: (completed) =>
        set({ isOnboardCompleted: completed }),
      resetOnboarding: () => set({ isOnboardCompleted: false }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        timeFormat: state.timeFormat,
        weekStartsOn: state.weekStartsOn,
        fontScale: state.fontScale,
        themeMode: state.themeMode,
        language: state.language,
        hideNotificationNames: state.hideNotificationNames,
        vibrationEnabled: state.vibrationEnabled,
        vibrationPattern: state.vibrationPattern,
        notificationSound: state.notificationSound,
        isOnboardCompleted: state.isOnboardCompleted,
      }),
    },
  ),
);
