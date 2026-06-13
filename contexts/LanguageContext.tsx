import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_STORAGE_KEY,
  SupportedLocale,
  detectDeviceLanguage,
  getLanguage,
  setLanguage as applyLanguage,
  supportedLocales,
} from '../configs/i18n';
import { store } from '../redux/store';
import { languageApi } from '../redux/slices/languageApi';

type LanguageContextValue = {
  languageCode: SupportedLocale;
  setLanguage: (code: SupportedLocale) => Promise<void>;
  isReady: boolean;
  supportedLocales: readonly SupportedLocale[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [languageCode, setLanguageCode] = useState<SupportedLocale>(getLanguage());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        const systemLang = detectDeviceLanguage();
        let next: SupportedLocale =
          stored && supportedLocales.includes(stored as SupportedLocale)
            ? (stored as SupportedLocale)
            : systemLang;

        try {
          const pref = await store
            .dispatch(languageApi.endpoints.getLanguagePreference.initiate())
            .unwrap();
          if (pref.preferredLanguage && supportedLocales.includes(pref.preferredLanguage as SupportedLocale)) {
            next = pref.preferredLanguage as SupportedLocale;
          }
        } catch {
          // Use local/device language when backend is unavailable.
        }

        if (!cancelled) {
          applyLanguage(next);
          setLanguageCode(next);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (code: SupportedLocale) => {
    applyLanguage(code);
    setLanguageCode(code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    try {
      await store.dispatch(
        languageApi.endpoints.updateLanguagePreference.initiate({
          preferredLanguage: code,
          systemLanguage: detectDeviceLanguage(),
        }),
      );
    } catch {
      // Preference is still persisted locally.
    }
  }, []);

  const value = useMemo(
    () => ({ languageCode, setLanguage, isReady, supportedLocales }),
    [languageCode, setLanguage, isReady],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
