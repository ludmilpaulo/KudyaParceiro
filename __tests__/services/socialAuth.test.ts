jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('../../services/types', () => ({ baseAPI: 'http://api.test' }));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => {
  class AuthRequest {
    state: string;
    constructor(config: { state?: string }) {
      this.state = config.state ?? 'nonce123';
    }
    async makeAuthUrlAsync(discovery: { authorizationEndpoint: string }) {
      return `${discovery.authorizationEndpoint}?state=${encodeURIComponent(this.state)}`;
    }
    parseReturnUrl(url: string) {
      const params = Object.fromEntries(new URL(url).searchParams);
      const type = params.state === this.state && !params.error ? 'success' : 'error';
      return { type, params };
    }
  }
  return {
    makeRedirectUri: jest.fn(() => 'kudyaparceiro://oauth'),
    ResponseType: { Code: 'code', Token: 'token' },
    AuthRequest,
  };
});

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock('expo-auth-session/providers/facebook', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(async () => false),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  signInAsync: jest.fn(),
}));

function loadSocialAuth() {
  jest.resetModules();
   
  return require('../../services/socialAuth') as typeof import('../../services/socialAuth');
}

function setPlatform(os: string) {
   
  const { Platform } = require('react-native') as { Platform: { OS: string } };
  Platform.OS = os;
}

describe('Parceiro social redirects', () => {
  it('requests a lowercase package redirect for Google on Android', () => {
    setPlatform('android');
    const { useGoogleAuth } = loadSocialAuth();
     
    const google = require('expo-auth-session/providers/google') as { useAuthRequest: jest.Mock };
    useGoogleAuth();
    const config = google.useAuthRequest.mock.calls.at(-1)?.[0] as { redirectUri?: string };
    expect(config.redirectUri).toBe('com.ludmil.kudyaparceiro:/oauthredirect');
  });

  it('keeps the Facebook provider-default redirect on native', () => {
    setPlatform('android');
    const { useFacebookAuth } = loadSocialAuth();
     
    const facebook = require('expo-auth-session/providers/facebook') as {
      useAuthRequest: jest.Mock;
    };
    useFacebookAuth();
    expect(facebook.useAuthRequest.mock.calls.at(-1)?.[0]).not.toHaveProperty('redirectUri');
  });
});

describe('signInWithInstagram (Parceiro)', () => {
  it('routes the Instagram bounce back to kudyaparceiro://oauth', async () => {
    setPlatform('android');
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          instagram_app_id: 'ig-app',
          instagram_redirect_uri: 'https://api.example/api/auth/social/instagram/callback/',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'jwt', token: 'jwt', user_id: 1, username: 'ada' }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { signInWithInstagram } = loadSocialAuth();
     
    const browser = require('expo-web-browser') as { openAuthSessionAsync: jest.Mock };
    browser.openAuthSessionAsync.mockImplementation(async (url: string, returnUrl: string) => {
      const state = new URL(url).searchParams.get('state') ?? '';
      expect(state.startsWith('kudyaparceiro.')).toBe(true);
      expect(returnUrl).toBe('kudyaparceiro://oauth');
      return { type: 'success', url: `kudyaparceiro://oauth?code=ig-code&state=${state}` };
    });

    await signInWithInstagram();

    const [, init] = fetchMock.mock.calls[1] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body.provider).toBe('instagram');
    expect(body.code).toBe('ig-code');
  });
});

describe('signInWithTikTok (Parceiro)', () => {
  it('routes the TikTok bounce back to kudyaparceiro://oauth', async () => {
    setPlatform('android');
    const bounce = 'https://api.example/api/auth/social/tiktok/callback/';
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tiktok_client_key: 'tt-key', tiktok_redirect_uri: bounce }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'jwt', token: 'jwt', user_id: 1, username: 'ada' }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { signInWithTikTok } = loadSocialAuth();
     
    const browser = require('expo-web-browser') as { openAuthSessionAsync: jest.Mock };
    browser.openAuthSessionAsync.mockImplementation(async (url: string, returnUrl: string) => {
      const state = new URL(url).searchParams.get('state') ?? '';
      expect(state.startsWith('kudyaparceiro.')).toBe(true);
      expect(returnUrl).toBe('kudyaparceiro://oauth');
      return { type: 'success', url: `kudyaparceiro://oauth?code=tt-code&state=${state}` };
    });

    await signInWithTikTok();

    const [, init] = fetchMock.mock.calls[1] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body.provider).toBe('tiktok');
    expect(body.redirect_uri).toBe(bounce);
  });
});
