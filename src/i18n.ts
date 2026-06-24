import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import adminFr from "./admin/locales/fr.json";
import adminEn from "./admin/locales/en.json";

const stored = typeof window !== "undefined" ? localStorage.getItem("cle-lang") : null;

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr, admin: adminFr },
    en: { translation: en, admin: adminEn },
  },
  lng: stored || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
