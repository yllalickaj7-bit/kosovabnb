import { createContext, useContext, useState, ReactNode } from "react";
import { Language, translations, TranslationKey } from "@/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("lang") as Language) || "sq";
  });

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
