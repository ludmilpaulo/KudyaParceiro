import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_MANUAL_KEY,
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
  followDeviceLanguage: () => Promise<void>;
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
        const [stored, manualFlag] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
          AsyncStorage.getItem(LANGUAGE_MANUAL_KEY),
        ]);
        const storedLocale =
          stored && supportedLocales.includes(stored as SupportedLocale)
            ? (stored as SupportedLocale)
            : null;
        const legacyChoice = manualFlag == null && storedLocale != null;
        const manual = (manualFlag === '1' || legacyChoice) && storedLocale != null;
        if (legacyChoice) {
          await AsyncStorage.setItem(LANGUAGE_MANUAL_KEY, '1');
        }
        const systemLang = detectDeviceLanguage();
        let next: SupportedLocale = manual && storedLocale ? storedLocale : systemLang;

        try {
          const pref = await store
            .dispatch(languageApi.endpoints.getLanguagePreference.initiate())
            .unwrap();
          if (manual && storedLocale) {
            await store.dispatch(
              languageApi.endpoints.updateLanguagePreference.initiate({
                preferredLanguage: storedLocale,
                systemLanguage: systemLang,
              }),
            );
          } else if (
            pref.preferredLanguage &&
            supportedLocales.includes(pref.preferredLanguage)
          ) {
            next = pref.preferredLanguage;
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
            await AsyncStorage.setItem(LANGUAGE_MANUAL_KEY, '1');
          } else {
            await store.dispatch(
              languageApi.endpoints.updateLanguagePreference.initiate({
                systemLanguage: systemLang,
              }),
            );
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
    await AsyncStorage.setItem(LANGUAGE_MANUAL_KEY, '1');
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

  const followDeviceLanguage = useCallback(async () => {
    const next = detectDeviceLanguage();
    applyLanguage(next);
    setLanguageCode(next);
    await AsyncStorage.multiRemove([LANGUAGE_MANUAL_KEY, LANGUAGE_STORAGE_KEY]);
    try {
      await store.dispatch(
        languageApi.endpoints.updateLanguagePreference.initiate({
          systemLanguage: next,
        }),
      );
    } catch {
      // Device language still applies locally.
    }
  }, []);

  const value = useMemo(
    () => ({ languageCode, setLanguage, followDeviceLanguage, isReady, supportedLocales }),
    [languageCode, setLanguage, followDeviceLanguage, isReady],
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
