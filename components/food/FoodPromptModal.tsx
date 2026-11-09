import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { sanitizePinInput } from '../../features/food/foodHelpers';

export type FoodPromptInputKind = 'number' | 'text' | 'pin';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  inputKind?: FoodPromptInputKind | null;
  inputLabel?: string;
  hint?: string;
  initialValue?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  busy?: boolean;
  serverError?: string | null;
  /** Returns a user-facing message when the value is not acceptable. */
  validate?: (value: string) => string | null;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  children?: React.ReactNode;
};

export default function FoodPromptModal({
  visible,
  title,
  message,
  inputKind = null,
  inputLabel,
  hint,
  initialValue = '',
  confirmLabel,
  cancelLabel,
  destructive = false,
  busy = false,
  serverError,
  validate,
  onConfirm,
  onCancel,
  children,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setLocalError(null);
    }
  }, [visible, initialValue]);

  const handleChange = (text: string) => {
    setValue(inputKind === 'pin' ? sanitizePinInput(text) : text);
    setLocalError(null);
  };

  const handleConfirm = () => {
    const problem = validate ? validate(value) : null;
    if (problem) {
      setLocalError(problem);
      return;
    }
    onConfirm(value);
  };

  const errorText = localError ?? serverError ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={busy ? undefined : onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {inputKind ? (
            <View style={styles.field}>
              {inputLabel ? <Text style={styles.label}>{inputLabel}</Text> : null}
              <TextInput
                value={value}
                onChangeText={handleChange}
                editable={!busy}
                autoFocus
                keyboardType={inputKind === 'text' ? 'default' : 'number-pad'}
                multiline={inputKind === 'text'}
                maxLength={inputKind === 'pin' ? 6 : inputKind === 'number' ? 3 : 255}
                secureTextEntry={inputKind === 'pin'}
                autoComplete="off"
                autoCorrect={inputKind === 'text'}
                importantForAutofill="no"
                style={[styles.input, inputKind === 'text' && styles.inputMultiline]}
                accessibilityLabel={inputLabel ?? title}
              />
              {hint ? <Text style={styles.hint}>{hint}</Text> : null}
            </View>
          ) : null}
          {children}
          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
          <View style={styles.row}>
            <Pressable onPress={onCancel} disabled={busy} style={[styles.button, styles.secondary]}>
              <Text style={styles.secondaryText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={busy}
              style={[styles.button, destructive ? styles.danger : styles.primary, busy && styles.disabled]}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{confirmLabel}</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  message: { marginTop: 8, fontSize: 14, color: '#334155' },
  field: { marginTop: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#0f172a' },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  hint: { marginTop: 6, fontSize: 12, color: '#64748b' },
  error: { marginTop: 10, color: '#b91c1c', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  button: { minWidth: 96, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', marginLeft: 10 },
  primary: { backgroundColor: '#0171CE' },
  danger: { backgroundColor: '#dc2626' },
  secondary: { backgroundColor: '#e2e8f0' },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#0f172a', fontWeight: '700' },
});
