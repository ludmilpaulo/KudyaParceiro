import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const googleSuccess = { type: 'success', authentication: { idToken: 'id-token' } };

jest.mock('../../services/socialAuth', () => ({
  useGoogleAuth: () => [{}, googleSuccess, jest.fn()],
  useFacebookAuth: () => [{}, null, jest.fn()],
  completeGoogleAuth: jest.fn(),
  completeFacebookAuth: jest.fn(),
  signInWithInstagram: jest.fn(),
  signInWithTikTok: jest.fn(),
  signInWithApple: jest.fn(),
  isSocialLoginConfigured: () => true,
  loadSocialPublicConfig: () => Promise.resolve(),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: () => Promise.resolve(false),
  AppleAuthenticationButton: () => null,
  AppleAuthenticationButtonType: {},
  AppleAuthenticationButtonStyle: {},
}));

jest.mock('@expo/vector-icons', () => ({ AntDesign: () => null, FontAwesome5: () => null }));

import SocialLoginButtons from '../../components/SocialLoginButtons';
import { completeGoogleAuth } from '../../services/socialAuth';

describe('SocialLoginButtons', () => {
  it('exchanges a Google response once even when the parent re-renders with a new onSuccess', async () => {
    (completeGoogleAuth as jest.Mock).mockResolvedValue({ token: 'jwt', username: 'u' });
    const first = jest.fn();
    const { rerender } = render(<SocialLoginButtons onSuccess={first} />);
    await waitFor(() => expect(first).toHaveBeenCalledTimes(1));

    const second = jest.fn();
    rerender(<SocialLoginButtons onSuccess={second} />);
    rerender(<SocialLoginButtons onSuccess={jest.fn()} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(completeGoogleAuth).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  }, 30000);
});
