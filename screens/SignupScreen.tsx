import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type TextInput as TextInputType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import { loginUser } from '../redux/slices/authSlice';
import { signupPartner, signupDriver } from '../services/partnerSignupService';
import {
  fetchBusinessCategories,
  getCategoryIcon,
  isStoreLikeCategory,
  type BusinessCategory,
} from '../services/platformApi';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getApiConnectionHint } from '../utils/apiClient';
import type { DriverServiceMode } from '../services/authTypes';
import { DRIVER_SERVICE_MODES } from '../utils/partnerRoles';
import { analytics } from '../utils/mixpanel';
import { useTranslation } from '../hooks/useTranslation';
import LanguagePicker from '../components/LanguagePicker';
import PartnerButton from '../components/ui/PartnerButton';
import { theme } from '../configs/theme';
import { useLanguage } from '../contexts/LanguageContext';

type AccountType = 'partner' | 'driver';

const DRIVER_MODE_LABELS: Record<DriverServiceMode, string> = {
  taxi: 'driverModeTaxi',
  food_delivery: 'driverModeFood',
  parcel_delivery: 'driverModeParcel',
};

const isWeb = Platform.OS === 'web';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { t, languageCode } = useTranslation();
  const { languageCode: lang } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInputType>(null);

  const [accountType, setAccountType] = useState<AccountType>('partner');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [driverModes, setDriverModes] = useState<DriverServiceMode[]>([...DRIVER_SERVICE_MODES]);
  const [logo, setLogo] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [license, setLicense] = useState<{ uri: string; type: string; name: string; } | null>(null);

  useEffect(() => {
    analytics.trackScreenView('Partner Signup Screen');
    void loadCategories();
  }, [lang, languageCode]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      const data = await fetchBusinessCategories(lang || languageCode, 'mobile');
      setCategories(data);
      setSelectedCategory((current) => {
        if (current && data.some((c) => c.slug === current)) return current;
        return data[0]?.slug ?? null;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('categoriesLoadFailed');
      setCategoriesError(message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const pickFile = async (kind: 'logo' | 'license') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `${kind}.jpg`,
    };
    if (kind === 'logo') setLogo(file);
    else setLicense(file);
  };

  const toggleDriverMode = (mode: DriverServiceMode) => {
    setDriverModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const handleSubmit = async () => {
    if (!username || !email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (accountType === 'partner') {
      if (categories.length === 0 || !selectedCategory) {
        Alert.alert(t('error'), categoriesError || t('categoriesLoadFailed'));
        void loadCategories();
        return;
      }
      if (!businessName || !phone || !address) {
        Alert.alert(t('error'), t('fillAllFields'));
        return;
      }
      if (isStoreLikeCategory(selectedCategory) && !logo) {
        Alert.alert(t('error'), t('selectLogo'));
        return;
      }
    } else if (driverModes.length === 0) {
      Alert.alert(t('error'), t('driverModesRequired'));
      return;
    }

    setLoading(true);
    try {
      const session =
        accountType === 'partner'
          ? await signupPartner({
              username,
              email,
              password,
              businessName,
              phone,
              address,
              business_category: selectedCategory!,
              logo: logo || undefined,
              store_license: license || undefined,
            })
          : await signupDriver({
              username,
              email,
              password,
              service_modes: driverModes,
            });

      analytics.trackSignup(String(session.user_id), {
        username,
        accountType,
        category: selectedCategory,
        driverModes,
      });
      dispatch(loginUser(session));
      Alert.alert(t('success'), t('signupSuccess'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('signupFailed');
      Alert.alert(t('error'), message);
    } finally {
      setLoading(false);
    }
  };

  const formBody = (
    <>
      <TouchableOpacity onPress={() => navigation.navigate('Join')} style={styles.backBtn}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Image source={require('../assets/azul.png')} style={styles.logo} />
          <LanguagePicker />
        </View>

        <Text style={styles.title}>{t('signupTitle')}</Text>
        <Text style={styles.subtitle}>{t('signupSubtitle')}</Text>

        <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
          <Text style={styles.loginLink}>
            {t('alreadyHaveAccount')}{' '}
            <Text style={styles.loginLinkAccent}>{t('loginHere')}</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeCard, accountType === 'partner' && styles.typeCardActive]}
            onPress={() => setAccountType('partner')}
          >
            <Text style={[styles.typeTitle, accountType === 'partner' && styles.typeTitleActive]}>
              {t('rolePartner')}
            </Text>
            <Text style={styles.typeDesc}>{t('signupPartnerDesc')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeCard, accountType === 'driver' && styles.typeCardActive]}
            onPress={() => setAccountType('driver')}
          >
            <Text style={[styles.typeTitle, accountType === 'driver' && styles.typeTitleActive]}>
              {t('roleDriver')}
            </Text>
            <Text style={styles.typeDesc}>{t('signupDriverDesc')}</Text>
          </TouchableOpacity>
        </View>

        {accountType === 'partner' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('selectPartnerCategory')}</Text>
            {__DEV__ ? (
              <Text style={styles.categoriesHint}>{getApiConnectionHint()}</Text>
            ) : null}
            {loadingCategories ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : categoriesError ? (
              <View style={styles.categoriesErrorBox}>
                <Text style={styles.categoriesErrorText}>{categoriesError}</Text>
                <Text style={styles.categoriesHint}>{getApiConnectionHint()}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => void loadCategories()}>
                  <Text style={styles.retryBtnText}>{t('retry', 'Retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.categoriesErrorBox}>
                <Text style={styles.categoriesErrorText}>{t('categoriesLoadFailed')}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => void loadCategories()}>
                  <Text style={styles.retryBtnText}>{t('retry', 'Retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.categoriesCount}>
                  {categories.length} {t('categoriesAvailable', 'categories available')}
                </Text>
                <ScrollView
                  style={styles.categoryScroll}
                  contentContainerStyle={styles.categoryGrid}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  {categories.map((category) => {
                    const selected = selectedCategory === category.slug;
                    const iconName = getCategoryIcon(category.slug);
                    const useFa5 = ['utensils', 'shopping-basket', 'stethoscope', 'bed', 'car'].includes(iconName);
                    return (
                      <TouchableOpacity
                        key={category.slug}
                        onPress={() => setSelectedCategory(category.slug)}
                        style={[
                          styles.categoryCard,
                          selected && {
                            borderColor: category.color,
                            backgroundColor: `${category.color}12`,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.categoryIconWrap,
                            { backgroundColor: selected ? `${category.color}22` : '#F1F5F9' },
                          ]}
                        >
                          {useFa5 ? (
                            <FontAwesome5
                              name={iconName as 'utensils'}
                              size={16}
                              color={selected ? category.color : '#64748B'}
                              solid
                            />
                          ) : (
                            <Feather
                              name={iconName as 'home'}
                              size={16}
                              color={selected ? category.color : '#64748B'}
                            />
                          )}
                        </View>
                        <View style={styles.categoryCopy}>
                          <Text
                            style={[
                              styles.categoryText,
                              selected && { color: category.color, fontWeight: '700' },
                            ]}
                          >
                            {category.name}
                          </Text>
                          <Text style={styles.categoryDesc} numberOfLines={2}>
                            {category.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>{t('businessName')}</Text>
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder={t('businessName')}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={t('phone')}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('address')}</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder={t('address')}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>

            {selectedCategory && isStoreLikeCategory(selectedCategory) && (
              <>
                <TouchableOpacity style={styles.fileBtn} onPress={() => pickFile('logo')}>
                  <Text style={styles.fileBtnText}>
                    {logo ? `${t('selectLogo')} ✓` : t('selectLogo')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fileBtn} onPress={() => pickFile('license')}>
                  <Text style={styles.fileBtnText}>
                    {license ? `${t('selectLicense')} ✓` : t('selectLicense')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('selectDriverModes')}</Text>
            {DRIVER_SERVICE_MODES.map((mode) => {
              const active = driverModes.includes(mode);
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => toggleDriverMode(mode)}
                  style={[styles.modeCard, active && styles.modeCardActive]}
                >
                  <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>
                    {t(DRIVER_MODE_LABELS[mode])}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>{t('username')}</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder={t('username')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t('email')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('password')}</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder={t('passwordPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.passwordInput]}
              onFocus={() => {
                if (!isWeb) return;
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 150);
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
              {showPassword ? (
                <EyeOff width={20} height={20} color={theme.colors.textSecondary} />
              ) : (
                <Eye width={20} height={20} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <PartnerButton label={t('signUp')} onPress={handleSubmit} loading={loading} style={styles.submitBtn} />
      </MotiView>
    </>
  );

  return (
    <LinearGradient colors={[...theme.gradient.hero]} style={styles.flex}>
      {isWeb ? (
        <ScrollView
          ref={scrollRef}
          style={styles.webScrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          scrollEnabled
        >
          {formBody}
        </ScrollView>
      ) : (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={8}>
              <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                nestedScrollEnabled
              >
                {formBody}
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              nestedScrollEnabled
              scrollEnabled
              bounces
            >
              {formBody}
            </ScrollView>
          )}
        </SafeAreaView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
  safeArea: { flex: 1, minHeight: 0 },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  webScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 3,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: { marginBottom: theme.spacing.sm, alignSelf: 'flex-start', padding: 8 },
  backText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: theme.spacing.lg,
  },
  header: { alignItems: 'center', marginBottom: theme.spacing.md },
  logo: { width: 64, height: 64, borderRadius: 32, marginBottom: theme.spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  loginLink: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  loginLinkAccent: { color: theme.colors.primary, fontWeight: '700' },
  typeRow: { gap: 10, marginBottom: theme.spacing.lg },
  typeCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  typeCardActive: { borderColor: theme.colors.primary, backgroundColor: '#EFF6FF' },
  typeTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  typeTitleActive: { color: theme.colors.primary },
  typeDesc: { fontSize: 12, lineHeight: 17, color: theme.colors.textSecondary },
  section: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm },
  categoriesCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  categoryScroll: {
    maxHeight: 320,
    marginBottom: theme.spacing.md,
  },
  categoryGrid: { gap: 8, paddingBottom: 4 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryCopy: { flex: 1 },
  categoryText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  categoryDesc: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4 },
  categoriesErrorBox: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: theme.spacing.sm,
  },
  categoriesErrorText: { fontSize: 13, color: '#B91C1C', marginBottom: 6 },
  categoriesHint: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 10 },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  modeCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 8,
    backgroundColor: theme.colors.background,
  },
  modeCardActive: { borderColor: theme.colors.primary, backgroundColor: '#EFF6FF' },
  modeTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  modeTitleActive: { color: theme.colors.primary },
  field: { marginBottom: theme.spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
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
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 14, padding: 4 },
  fileBtn: {
    padding: 14,
    marginBottom: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  fileBtnText: { color: theme.colors.primary, fontWeight: '600' },
  submitBtn: { marginTop: theme.spacing.sm },
});

export default SignupScreen;
