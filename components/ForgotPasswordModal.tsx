import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { baseAPI } from '../services/types';
import { useTranslation } from '../hooks/useTranslation';
import { theme } from '../configs/theme';

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${baseAPI}/conta/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailSent(true);
        Alert.alert(t('success'), t('resetPasswordSuccess'));
      } else {
        Alert.alert(t('error'), data.message || t('resetPasswordFailed'));
      }
    } catch {
      Alert.alert(t('error'), t('resetPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Modal transparent visible={show} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {emailSent ? (
            <>
              <Text style={styles.title}>{t('resetPasswordEmailSent')}</Text>
              <Text style={styles.body}>{t('emailSent')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>{t('close')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>{t('resetPassword')}</Text>
              <Text style={styles.label}>{t('email')}</Text>
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder={t('enterEmail')}
                placeholderTextColor={theme.colors.textMuted}
              />
              <View style={styles.actions}>
                <TouchableOpacity onPress={onClose} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t('send')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: theme.spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  body: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    fontSize: 16,
    backgroundColor: theme.colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ForgotPasswordModal;
