import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tailwind from 'tailwind-react-native-classnames';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLocale, localeLabels } from '../configs/i18n';
import { useTranslation } from '../hooks/useTranslation';

export default function LanguagePicker() {
  const { languageCode, setLanguage, supportedLocales: locales } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={tailwind`mb-4`}>
      <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>
        {t('preferredLanguage')}
      </Text>
      <View style={tailwind`flex-row flex-wrap`}>
        {locales.map((code: SupportedLocale) => {
          const selected = languageCode === code;
          return (
            <TouchableOpacity
              key={code}
              onPress={() => setLanguage(code)}
              style={tailwind`px-3 py-2 rounded-full mr-2 mb-2 border ${
                selected ? 'bg-blue-700 border-blue-700' : 'bg-gray-100 border-gray-300'
              }`}
            >
              <Text style={tailwind`${selected ? 'text-white' : 'text-gray-800'} font-medium text-sm`}>
                {localeLabels[code]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
