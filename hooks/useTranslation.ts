import translations, { TranslationKey } from '../configs/translations';
import { t as localT } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';

export function useTranslation() {
  const { languageCode, setLanguage, isReady } = useLanguage();

  function t(key: string, fallback?: string): string {
    const table = translations[languageCode] as Record<string, string>;
    const en = translations.en as Record<string, string>;
    const fromTable = table[key] ?? en[key];
    if (fromTable) return fromTable;
    const staticVal = localT(key as TranslationKey, languageCode);
    if (staticVal !== key) return staticVal;
    return fallback ?? key;
  }

  return { t, languageCode, setLanguage, isReady };
}
