import { useLanguage } from "../contexts/LanguageContext";
import doctorTranslations, { doctorT, type DoctorTranslationKey } from "../configs/doctorTranslations";

export function useDoctorTranslation() {
  const { languageCode } = useLanguage();

  const dt = (key: DoctorTranslationKey, fallback?: string) =>
    doctorT(key, languageCode) || fallback || key;

  return { dt, languageCode, doctorTranslations: doctorTranslations[languageCode] };
}
