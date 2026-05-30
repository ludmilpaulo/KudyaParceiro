import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import {
  useGoogleAuth,
  useFacebookAuth,
  completeGoogleAuth,
  completeFacebookAuth,
  signInWithInstagram,
  signInWithTikTok,
  isSocialLoginConfigured,
  SocialAuthResult,
  SocialProvider,
} from '../services/socialAuth';

type Props = {
  onSuccess: (result: SocialAuthResult) => void;
  disabled?: boolean;
};

const PROVIDERS: {
  id: SocialProvider;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'google', label: 'Continuar com Google', icon: <AntDesign name="google" size={18} color="#DB4437" /> },
  { id: 'facebook', label: 'Continuar com Facebook', icon: <FontAwesome5 name="facebook" size={18} color="#1877F2" /> },
  { id: 'instagram', label: 'Continuar com Instagram', icon: <FontAwesome5 name="instagram" size={18} color="#E4405F" /> },
  { id: 'tiktok', label: 'Continuar com TikTok', icon: <FontAwesome5 name="tiktok" size={18} color="#000" /> },
];

export default function SocialLoginButtons({ onSuccess, disabled }: Props) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [googleRequest, googleResponse, promptGoogle] = useGoogleAuth();
  const [fbRequest, fbResponse, promptFacebook] = useFacebookAuth();

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      (async () => {
        try {
          setLoadingProvider('google');
          onSuccess(await completeGoogleAuth(googleResponse.authentication));
        } catch (e: unknown) {
          Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao entrar.');
        } finally {
          setLoadingProvider(null);
        }
      })();
    }
  }, [googleResponse, onSuccess]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      (async () => {
        try {
          setLoadingProvider('facebook');
          onSuccess(await completeFacebookAuth(fbResponse.authentication));
        } catch (e: unknown) {
          Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao entrar.');
        } finally {
          setLoadingProvider(null);
        }
      })();
    }
  }, [fbResponse, onSuccess]);

  const handlePress = async (provider: SocialProvider) => {
    if (!isSocialLoginConfigured(provider)) {
      Alert.alert(
        'Erro',
        `Login ${provider} ainda não configurado. Adicione as chaves OAuth no .env (veja SOCIAL_LOGIN_SETUP.md).`,
      );
      return;
    }
    try {
      setLoadingProvider(provider);
      if (provider === 'google') {
        await promptGoogle();
        return;
      }
      if (provider === 'facebook') {
        await promptFacebook();
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
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao entrar.');
    }
  };

  const anyConfigured = PROVIDERS.some((p) => isSocialLoginConfigured(p.id));

  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-center text-gray-500 mb-3`}>Ou continue com</Text>
      {!anyConfigured ? (
        <Text style={tw`text-center text-xs text-gray-400 mb-2`}>
          Login social requer chaves OAuth na configuração do app.
        </Text>
      ) : null}
      {PROVIDERS.map((p) => {
        const busy = loadingProvider === p.id || disabled;
        const ready = p.id === 'google' ? !!googleRequest : p.id === 'facebook' ? !!fbRequest : true;
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => handlePress(p.id)}
            disabled={busy || !ready}
            style={tw`flex-row items-center justify-center border border-gray-200 rounded-full py-3 mb-2 bg-white`}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <View style={tw`mr-2`}>{p.icon}</View>
                <Text style={tw`font-semibold text-gray-800`}>{p.label}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
