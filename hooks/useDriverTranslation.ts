import { useCallback } from "react";
import { useTranslation } from "./useTranslation";
import { driverTranslations, type DriverTranslationKey } from "../configs/driverTranslations";

export function useDriverTranslation() {
  const { languageCode } = useTranslation();
  const lang = (languageCode in driverTranslations ? languageCode : "en") as keyof typeof driverTranslations;

  const dt = useCallback(
    (key: DriverTranslationKey) => driverTranslations[lang][key] ?? driverTranslations.en[key],
    [lang],
  );

  return { dt, languageCode: lang };
}
