import { useCallback } from 'react';
import { useTranslation } from './useTranslation';
import { foodT, type FoodTranslationKey } from '../configs/foodTranslations';

export function useFoodTranslation() {
  const { languageCode } = useTranslation();

  const ft = useCallback(
    (key: FoodTranslationKey, vars?: Record<string, string | number>) => foodT(languageCode, key, vars),
    [languageCode],
  );

  return { ft, languageCode };
}
