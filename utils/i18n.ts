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
  | "ar"
  | "zh-CN"
  | "zh-Hant"
  | "en"
  | "fr"
  | "de"
  | "it"
  | "ja"
  | "ko"
  | "pt"
  | "ru"
  | "es"
  | "tr";

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "zh-CN", label: "Simplified Chinese", nativeLabel: "简体中文" },
  { code: "zh-Hant", label: "Traditional Chinese", nativeLabel: "繁體中文" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
  { code: "pt", label: "Portugese", nativeLabel: "Português" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
];

export const SYSTEM_DEFAULT = "system" as const;

export function resolveLocale(code: string | null | undefined): LanguageCode {
  if (!code) return "en";
  if (LANGUAGES.some((l) => l.code === code)) {
    return code as LanguageCode;
  }
  const lang = code.split("-")[0].toLowerCase();
  if (lang === "zh") return "zh-CN";
  if (LANGUAGES.some((l) => l.code === lang)) {
    return lang as LanguageCode;
  }
  return "en";
}

export function getSystemLanguage(): LanguageCode {
  const locale = Localization.getLocales()[0];
  if (!locale) return "en";

  if (locale.languageCode === "zh") {
    const tag = locale.languageTag ?? "";
    if (tag.includes("Hant")) return "zh-Hant";
    if (tag.includes("Hans")) return "zh-CN";

    const region = locale.regionCode;
    if (region === "TW" || region === "HK" || region === "MO") return "zh-Hant";
    return "zh-CN";
  }

  return resolveLocale(locale.languageTag ?? locale.languageCode);
}

const resources = {
  ar: { translation: ar },
  "zh-CN": { translation: zhCN },
  "zh-Hant": { translation: zhHant },
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
  ru: { translation: ru },
  es: { translation: es },
  tr: { translation: tr },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getSystemLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
