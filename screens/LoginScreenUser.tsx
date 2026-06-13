// screens/LoginScreenUser.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { loginUserService } from '../services/authService';
import { loginUser, logoutUser } from '../redux/slices/authSlice';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import SocialLoginButtons from '../components/SocialLoginButtons';
import type { SocialAuthResult } from '../services/socialAuth';
import { RootStackParamList } from '../services/types';
import { canUsePartnerApp, canUseRiderApp, getUserRole } from '../utils/partnerRoles';
import { showMessage } from '../utils/showMessage';
import { analytics } from '../utils/mixpanel';
import { useTranslation } from '../hooks/useTranslation';
import LanguagePicker from '../components/LanguagePicker';
import PartnerButton from '../components/ui/PartnerButton';
import { theme } from '../configs/theme';
import {
  DEV_TEST_DOCTOR_LOGIN,
  DEV_TEST_LOGIN_BUTTON_LABEL,
  isDevLoginEnabled,
} from '../configs/devTestLogin';

const LoginScreenUser = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    analytics.trackScreenView('Partner Login Screen');
  }, []);

  const navigateAfterLogin = (response: {
    is_driver?: boolean;
    is_customer?: boolean;
    user_id?: number;
    username?: string;
    user?: Record<string, unknown>;
  }) => {
    if (!canUsePartnerApp(response as Parameters<typeof canUsePartnerApp>[0]) && !canUseRiderApp(response as Parameters<typeof canUseRiderApp>[0])) {
      const msg = t('unsupportedAccountMessage');
      setLoginError(msg);
      showMessage(t('unsupportedAccount'), msg);
      dispatch(logoutUser());
      return;
    }
    setLoginError(null);
    const role = getUserRole(response as Parameters<typeof getUserRole>[0]);
    const userType = response.is_driver ? 'driver' : role === 'doctor' ? 'doctor' : 'partner';
    analytics.trackLogin(response.user_id?.toString() || response.username || 'unknown', {
      user_type: userType,
      platform: Platform.OS === 'web' ? 'partner-web' : 'partner-mobile',
    });
    if (Platform.OS !== 'web') {
      showMessage(t('success'), t('loginSuccess'));
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      const msg = t('fillAllFields');
      setLoginError(msg);
      showMessage(t('error'), msg);
      return;
    }
    setLoading(true);
    setLoginError(null);
    try {
      const response = await loginUserService(username, password);
      dispatch(loginUser(response));
      navigateAfterLogin(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('loginFailed');
      setLoginError(message);
      analytics.trackError('Partner Login Failed', { username, error: message });
      showMessage(t('error'), message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestLogin = () => {
    setUsername(DEV_TEST_DOCTOR_LOGIN.username);
    setPassword(DEV_TEST_DOCTOR_LOGIN.password);
  };

  const handleSocialSuccess = (result: SocialAuthResult) => {
    if (!result.token) return;
    dispatch(loginUser(result));
    analytics.trackLogin(result.user_id?.toString() || result.username, {
      user_type: result.is_driver ? 'driver' : 'restaurant',
      platform: 'partner-mobile',
      method: 'social',
    });
    navigateAfterLogin(result);
  };

  return (
    <LinearGradient colors={[...theme.gradient.hero]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => navigation.navigate('Join' as never)} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Image source={require('../assets/azul.png')} style={styles.logo} />
                <LanguagePicker />
              </View>

              <Text style={styles.title}>{t('loginTitle')}</Text>
              <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>

              <TouchableOpacity onPress={() => navigation.navigate('SignupScreen' as never)}>
                <Text style={styles.signupLink}>
                  {t('noAccount')}{' '}
                  <Text style={styles.signupText}>{t('registerHere')}</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.field}>
                <Text style={styles.label}>{t('username')}</Text>
                <TextInput
                  placeholder={t('username')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              {loginError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{loginError}</Text>
                </View>
              ) : null}

              <View style={styles.field}>
                <Text style={styles.label}>{t('password')}</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    value={password}
                    placeholder={t('passwordPlaceholder')}
                    placeholderTextColor={theme.colors.textMuted}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onSubmitEditing={() => void handleSubmit()}
                    returnKeyType="go"
                    style={[styles.input, styles.passwordInput]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((s) => !s)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <EyeOff width={20} height={20} color={theme.colors.textSecondary} />
                    ) : (
                      <Eye width={20} height={20} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
                <Text style={styles.forgotLink}>{t('forgotPassword')}</Text>
              </TouchableOpacity>

              {isDevLoginEnabled() && (
                <TouchableOpacity
                  onPress={handleFillTestLogin}
                  style={styles.devFillBtn}
                  disabled={loading}
                >
                  <Text style={styles.devFillText}>{DEV_TEST_LOGIN_BUTTON_LABEL}</Text>
                </TouchableOpacity>
              )}

              <PartnerButton
                label={t('login')}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitBtn}
              />

              <SocialLoginButtons onSuccess={handleSocialSuccess} disabled={loading} />
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
      <ForgotPasswordModal
        show={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  signupLink: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  signupText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  forgotLink: {
    textAlign: 'right',
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
    marginBottom: theme.spacing.lg,
  },
  devFillBtn: {
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
  devFillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  errorBanner: {
    marginBottom: theme.spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    marginBottom: theme.spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreenUser;
