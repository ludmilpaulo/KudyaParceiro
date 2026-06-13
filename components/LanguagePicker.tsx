import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLocale, localeLabels } from '../configs/i18n';
import { useTranslation } from '../hooks/useTranslation';
import { theme } from '../configs/theme';

type Props = {
  /** Light text for dark backgrounds (welcome screen) */
  compact?: boolean;
};

export default function LanguagePicker({ compact = false }: Props) {
  const { languageCode, setLanguage, supportedLocales: locales } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {!compact && (
        <Text style={styles.label}>{t('preferredLanguage')}</Text>
      )}
      <View style={styles.row}>
        {locales.map((code: SupportedLocale) => {
          const selected = languageCode === code;
          return (
            <TouchableOpacity
              key={code}
              onPress={() => setLanguage(code)}
              style={[
                styles.chip,
                compact && styles.chipCompact,
                selected && (compact ? styles.chipSelectedCompact : styles.chipSelected),
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  compact && styles.chipTextCompact,
                  selected && !compact && styles.chipTextSelected,
                  selected && compact && styles.chipTextSelectedCompact,
                ]}
              >
                {compact ? code.toUpperCase() : localeLabels[code]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.md,
  },
  wrapCompact: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipSelectedCompact: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  chipTextCompact: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipTextSelectedCompact: {
    color: theme.colors.primary,
  },
});
