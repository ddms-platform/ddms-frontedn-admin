import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'VN' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  // Derive language directly from i18n state - no separate state needed
  const language: Language = i18n.language === 'en' ? 'EN' : 'VN';

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang === 'EN' ? 'en' : 'vn');
    },
    [i18n],
  );

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default context (VN) if provider is missing
    return {
      language: 'VN' as Language,
      setLanguage: () => {},
    };
  }
  return context;
}
