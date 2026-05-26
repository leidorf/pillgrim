import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

export type LanguageCode = "en" | "tr";

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
];

export const SYSTEM_DEFAULT = "system" as const;

export function resolveLocale(code: string | null | undefined): LanguageCode {
  if (!code) return "en";
  const lang = code.split("-")[0].toLowerCase();
  return (LANGUAGES.some((l) => l.code === lang) ? lang : "en") as LanguageCode;
}

export function getSystemLanguage(): LanguageCode {
  const locale = Localization.getLocales()[0]?.languageCode;
  return resolveLocale(locale);
}

const resources: Record<string, { translation: Record<string, any> }> = {
  en: { translation: require("../assets/locales/en.json") },
  tr: { translation: require("../assets/locales/tr.json") },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getSystemLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
