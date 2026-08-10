import { useSettings } from "./store";

type Dict = Record<string, { ar: string; en: string }>;

const T: Dict = {
  home: { ar: "الرئيسية", en: "Home" },
  procedures: { ar: "إجراءاتي", en: "My Procedures" },
  documents: { ar: "أوراقي", en: "My Documents" },
  help: { ar: "مساعدة", en: "Help" },
  settings: { ar: "إعدادات الوصول", en: "Accessibility" },
  textSize: { ar: "حجم الخط", en: "Text size" },
  normal: { ar: "عادي", en: "Normal" },
  large: { ar: "كبير", en: "Large" },
  xl: { ar: "كبير جدًا", en: "Extra large" },
  contrast: { ar: "تباين عالي", en: "High contrast" },
  language: { ar: "اللغة", en: "Language" },
  contentArabic: {
    ar: "",
    en: "Procedure content is currently available in Arabic only.",
  },
};

export function useT() {
  const { settings } = useSettings();
  const lang = settings.lang;
  const t = (key: keyof typeof T | string) => {
    const entry = T[key as string];
    if (!entry) return String(key);
    return lang === "en" ? entry.en : entry.ar;
  };
  return { t, lang, dir: lang === "en" ? "ltr" : "rtl" } as const;
}
