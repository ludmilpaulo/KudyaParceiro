import translations, { TranslationKey } from '../configs/translations';
import { t as localT } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { financialT } from '../configs/financialTranslations';
import { thunesT } from '../configs/thunesTranslations';
import { groceryPartnerT } from '../configs/groceryPartnerTranslations';
import { useApiTranslations } from './useApiTranslations';

export function useTranslation() {
  const { languageCode, setLanguage, isReady } = useLanguage();
  const apiTranslations = useApiTranslations(languageCode);

  function t(key: string, fallback?: string): string {
    const financialValue = financialT(languageCode, key);
    if (financialValue) return financialValue;
    const thunesValue = thunesT(languageCode, key);
    if (thunesValue) return thunesValue;
    const groceryPartnerValue = groceryPartnerT(languageCode, key);
    if (groceryPartnerValue) return groceryPartnerValue;
    const apiValue = apiTranslations[key];
    if (apiValue) return apiValue;
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
