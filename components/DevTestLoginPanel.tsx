/**
 * Dev-only seed login shortcuts. Loaded via require() behind __DEV__ in LoginScreenUser
 * so credentials are stripped from production bundles.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../configs/theme';

type Props = {
  onFill: (username: string, password: string) => void;
  disabled?: boolean;
};

const DEV_ACCOUNTS = [
  { label: 'Fill test driver login (Manuel)', username: 'manuel@kudya.shop', password: 'seedpass123', half: false },
  { label: 'Fill seed_driver login', username: 'seed_driver', password: 'seedpass123', half: false },
  { label: 'Fill test doctor login', username: 'doctor@kudya.shop', password: 'seedpass123', half: true },
  { label: 'Fill test store login', username: 'store@kudya.shop', password: 'seedpass123', half: true },
] as const;

export default function DevTestLoginPanel({ onFill, disabled }: Props) {
  return (
    <View style={styles.row}>
      {DEV_ACCOUNTS.map((account) => (
        <TouchableOpacity
          key={account.username}
          onPress={() => onFill(account.username, account.password)}
          style={[styles.btn, account.half ? styles.btnHalf : null]}
          disabled={disabled}
        >
          <Text style={styles.text}>{account.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  btn: {
    marginBottom: theme.spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  btnHalf: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 0,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
