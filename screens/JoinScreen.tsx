import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';
import { useTranslation } from '../hooks/useTranslation';
import LanguagePicker from '../components/LanguagePicker';
import PartnerButton from '../components/ui/PartnerButton';
import { FeatureCard } from '../components/ui/FeatureCard';
import { theme } from '../configs/theme';
import { analytics } from '../utils/mixpanel';

const JoinScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  useEffect(() => {
    analytics.trackScreenView('Partner Welcome Screen');
  }, []);

  return (
    <LinearGradient colors={[...theme.gradient.hero]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.langRow}>
            <LanguagePicker compact />
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            style={[styles.heroBlock, isWide && styles.heroBlockWide]}
          >
            <View style={styles.logoRing}>
              <Image source={require('../assets/azul.png')} style={styles.logo} />
            </View>
            <Text style={styles.appName}>{t('partnerAppName')}</Text>
            <Text style={styles.tagline}>{t('partnerTagline')}</Text>
            <Text style={styles.heroTitle}>{t('partnerHeroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('partnerHeroSubtitle')}</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 32 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 700, delay: 150 }}
            style={[styles.features, isWide && styles.featuresWide]}
          >
            <FeatureCard
              icon="shopping-bag"
              title={t('partnerFeatureOrdersTitle')}
              description={t('partnerFeatureOrdersDesc')}
            />
            <FeatureCard
              icon="trending-up"
              title={t('partnerFeatureEarningsTitle')}
              description={t('partnerFeatureEarningsDesc')}
            />
            <FeatureCard
              icon="settings"
              title={t('partnerFeatureManageTitle')}
              description={t('partnerFeatureManageDesc')}
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 300 }}
            style={[styles.actions, isWide && styles.actionsWide]}
          >
            <PartnerButton
              label={t('signInToAccount')}
              onPress={() => navigation.navigate('UserLogin')}
            />
            <View style={styles.actionGap} />
            <PartnerButton
              label={t('becomePartner')}
              variant="secondary"
              onPress={() => navigation.navigate('SignupScreen')}
            />
          </MotiView>

          <Text style={styles.footer}>© {new Date().getFullYear()} Kudya</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  scrollWide: {
    maxWidth: 960,
    paddingHorizontal: theme.spacing.xl,
  },
  langRow: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroBlockWide: {
    marginBottom: theme.spacing.xl,
  },
  logoRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  features: {
    marginBottom: theme.spacing.lg,
  },
  featuresWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actions: {
    marginTop: theme.spacing.sm,
  },
  actionsWide: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  actionGap: {
    height: theme.spacing.sm,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: theme.spacing.lg,
  },
});

export default JoinScreen;
