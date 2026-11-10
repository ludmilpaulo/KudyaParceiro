# Social login setup (Kudya Parceiro)

Same providers as the customer app (see `kudya-client/SOCIAL_LOGIN_SETUP.md`). Native redirects for this app:

| Provider | Native redirect |
|----------|-----------------|
| Google | `com.ludmil.kudyaparceiro:/oauthredirect` (Android package `com.ludmil.KudyaParceiro`, requested lowercase) |
| Facebook | `fb<APP_ID>://authorize` (needs `EXPO_PUBLIC_FACEBOOK_APP_ID` at build time) |
| TikTok | `https://www.appkudya.online/api/auth/social/tiktok/callback/`, bounced to `kudyaparceiro://oauth` |
| Instagram | `https://www.appkudya.online/api/auth/social/instagram/callback/`, bounced to `kudyaparceiro://oauth` |

Use `.env.example` keys (`EXPO_PUBLIC_*`). Social login needs a dev/production build, not Expo Go.

Backend: `POST {EXPO_PUBLIC_BASE_API}/api/auth/social/` — see `www_kudya_shop` and `kudya-client/SOCIAL_LOGIN_SETUP.md` for server env and migrations.

EAS: add secrets for all `EXPO_PUBLIC_*` variables before store builds.
