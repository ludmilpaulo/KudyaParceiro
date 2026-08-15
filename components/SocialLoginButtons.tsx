import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import tw from 'twrnc';
import {
  useGoogleAuth,
  useFacebookAuth,
  completeGoogleAuth,
  completeFacebookAuth,
  signInWithInstagram,
  signInWithTikTok,
  signInWithApple,
  isSocialLoginConfigured,
  SocialAuthResult,
  SocialProvider,
} from '../services/socialAuth';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKey } from '../configs/i18n';

type Props = {
  onSuccess: (result: SocialAuthResult) => void;
  disabled?: boolean;
};

const PROVIDERS: { id: SocialProvider; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { id: 'google', labelKey: 'continueGoogle', icon: <AntDesign name="google" size={18} color="#DB4437" /> },
  { id: 'facebook', labelKey: 'continueFacebook', icon: <FontAwesome5 name="facebook" size={18} color="#1877F2" /> },
  { id: 'instagram', labelKey: 'continueInstagram', icon: <FontAwesome5 name="instagram" size={18} color="#E4405F" /> },
  { id: 'tiktok', labelKey: 'continueTiktok', icon: <FontAwesome5 name="tiktok" size={18} color="#000" /> },
];

function providerErrorKey(provider: SocialProvider): TranslationKey {
  if (provider === 'google') return 'googleSignInFailed';
  if (provider === 'facebook') return 'facebookSignInFailed';
  if (provider === 'tiktok') return 'tiktokSignInFailed';
  if (provider === 'apple') return 'appleSignInFailed';
  return 'loginFailed';
}

export default function SocialLoginButtons({ onSuccess, disabled }: Props) {
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [googleRequest, googleResponse, promptGoogle] = useGoogleAuth();
  const [fbRequest, fbResponse, promptFacebook] = useFacebookAuth();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      (async () => {
        try {
          setLoadingProvider('google');
          onSuccess(await completeGoogleAuth(googleResponse.authentication));
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : '';
          if (!/cancel/i.test(message)) {
            Alert.alert(t('error'), t('googleSignInFailed'));
          }
        } finally {
          setLoadingProvider(null);
        }
      })();
    } else if (googleResponse?.type === 'cancel' || googleResponse?.type === 'dismiss') {
      setLoadingProvider(null);
    }
  }, [googleResponse, onSuccess, t]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      (async () => {
        try {
          setLoadingProvider('facebook');
          onSuccess(await completeFacebookAuth(fbResponse.authentication));
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : '';
          if (!/cancel/i.test(message)) {
            Alert.alert(t('error'), t('facebookSignInFailed'));
          }
        } finally {
          setLoadingProvider(null);
        }
      })();
    } else if (fbResponse?.type === 'cancel' || fbResponse?.type === 'dismiss') {
      setLoadingProvider(null);
    }
  }, [fbResponse, onSuccess, t]);

  const handleApplePress = async () => {
    try {
      setLoadingProvider('apple');
      onSuccess(await signInWithApple());
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      if (!/cancel/i.test(message)) {
        Alert.alert(t('error'), t('appleSignInFailed'));
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handlePress = async (provider: SocialProvider) => {
    if (!isSocialLoginConfigured(provider)) {
      Alert.alert(t('error'), t('socialLoginNotConfigured'));
      return;
    }
    try {
      setLoadingProvider(provider);
      if (provider === 'google') {
        const result = await promptGoogle();
        if (!result || result.type !== 'success') {
          setLoadingProvider(null);
        }
        return;
      }
      if (provider === 'facebook') {
        const result = await promptFacebook();
        if (!result || result.type !== 'success') {
          setLoadingProvider(null);
        }
        return;
      }
      if (provider === 'instagram') {
        onSuccess(await signInWithInstagram());
        setLoadingProvider(null);
        return;
      }
      if (provider === 'tiktok') {
        onSuccess(await signInWithTikTok());
        setLoadingProvider(null);
      }
    } catch (e: unknown) {
      setLoadingProvider(null);
      const message = e instanceof Error ? e.message : '';
      if (/cancel/i.test(message)) return;
      Alert.alert(t('error'), t(providerErrorKey(provider)));
    }
  };

  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-center text-gray-500 mb-3`}>{t('orContinueWith')}</Text>
      {appleAvailable ? (
        loadingProvider === 'apple' ? (
          <View style={tw`items-center py-3 mb-2`}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={22}
            style={{ width: '100%', height: 44, marginBottom: 8 }}
            onPress={() => void handleApplePress()}
          />
        )
      ) : null}
      {PROVIDERS.map((p) => {
        const configured = isSocialLoginConfigured(p.id);
        const busy = loadingProvider === p.id || disabled;
        const ready =
          p.id === 'google' ? !!googleRequest : p.id === 'facebook' ? !!fbRequest : configured;
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => void handlePress(p.id)}
            disabled={busy || !ready || !configured}
            style={tw`flex-row items-center justify-center border border-gray-200 rounded-full py-3 mb-2 ${
              configured ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <View style={tw`mr-2`}>{p.icon}</View>
                <Text style={tw`font-semibold text-gray-800`}>{t(p.labelKey)}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
