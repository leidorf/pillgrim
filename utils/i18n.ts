import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../assets/locales/en.json";
import pt from "../assets/locales/pt.json";
import tr from "../assets/locales/tr.json";
import fr from "../assets/locales/fr.json";
import es from "../assets/locales/es.json";
import de from "../assets/locales/de.json";
import ru from "../assets/locales/ru.json";
import zhCN from "../assets/locales/zh-CN.json";
import zhHant from "../assets/locales/zh-Hant.json";
import ar from "../assets/locales/ar.json";
import ja from "../assets/locales/ja.json";
import ko from "../assets/locales/ko.json";
import it from "../assets/locales/it.json";

export type LanguageCode =
  | "en"
  | "pt"
  | "tr"
  | "fr"
  | "es"
  | "de"
  | "ru"
  | "zh-CN"
  | "zh-Hant"
  | "ar"
  | "ja"
  | "ko"
  | "it";

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "pt", label: "Portugese", nativeLabel: "Português" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "zh-CN", label: "Simplified Chinese", nativeLabel: "简体中文" },
  { code: "zh-Hant", label: "Traditional Chinese", nativeLabel: "繁體中文" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
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

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  tr: { translation: tr },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  ru: { translation: ru },
  "zh-CN": { translation: zhCN },
  "zh-Hant": { translation: zhHant },
  ar: { translation: ar },
  ja: { translation: ja },
  ko: { translation: ko },
  it: { translation: it },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getSystemLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
