# Social login setup (Kudya Parceiro)

Same providers as the customer app. Redirect scheme for this app:

```
kudyaparceiro://oauth
```

Use `.env.example` keys (`EXPO_PUBLIC_*`). Register **kudyaparceiro://oauth** in Google, Meta, TikTok consoles (in addition to `kudya://oauth` for the customer app).

Backend: `POST {EXPO_PUBLIC_BASE_API}/api/auth/social/` — see `www_kudya_shop` and `kudya-client/SOCIAL_LOGIN_SETUP.md` for server env and migrations.

EAS: add secrets for all `EXPO_PUBLIC_*` variables before store builds.
