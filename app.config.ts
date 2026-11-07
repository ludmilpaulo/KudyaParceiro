import { ExpoConfig, ConfigContext } from 'expo/config'

function googleIosUrlScheme(iosClientId: string | undefined): string | null {
  if (!iosClientId) return null
  const prefix = '.apps.googleusercontent.com'
  if (!iosClientId.endsWith(prefix)) return null
  const id = iosClientId.slice(0, -prefix.length)
  return `com.googleusercontent.apps.${id}`
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID
  const googleIosScheme = googleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)

  const urlSchemes: string[] = ['kudyaparceiro']
  if (facebookAppId) urlSchemes.push(`fb${facebookAppId}`)
  if (googleIosScheme) urlSchemes.push(googleIosScheme)

  const existingUrlTypes = config.ios?.infoPlist?.CFBundleURLTypes ?? []
  const existingDomains = (config.ios?.associatedDomains as string[] | undefined) ?? []
  const associatedDomains =
    process.env.EAS_ENABLE_ASSOCIATED_DOMAINS === 'true'
      ? [...existingDomains, 'applinks:sd-kudya.vercel.app']
      : existingDomains
  const mergedUrlTypes = [
    ...(Array.isArray(existingUrlTypes) ? existingUrlTypes : []),
    {
      CFBundleURLSchemes: urlSchemes,
    },
  ]

  return {
    ...config,
    name: config.name ?? 'Kudya Parceiro',
    slug: config.slug ?? 'kudya-parceiro',
    scheme: 'kudyaparceiro',
    plugins: [
      ...(config.plugins ?? []),
      'expo-web-browser',
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: '36.0.0',
            usesCleartextTraffic: process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true',
          },
        },
      ],
    ],
    ios: {
      ...config.ios,
      // Associated Domains stay off unless EAS_ENABLE_ASSOCIATED_DOMAINS=true.
      // Sign in with Apple is on the App ID (APPLE_ID_AUTH); keep it enabled for store iOS builds.
      usesAppleSignIn: process.env.EAS_ENABLE_APPLE_SIGNIN !== 'false',
      ...(associatedDomains.length ? { associatedDomains } : {}),
      infoPlist: {
        ...config.ios?.infoPlist,
        ...(facebookAppId
          ? {
              FacebookAppID: facebookAppId,
              FacebookDisplayName: config.name ?? 'Kudya Parceiro',
            }
          : {}),
        CFBundleURLTypes: mergedUrlTypes,
        LSApplicationQueriesSchemes: [
          'fbapi',
          'fb-messenger-share-api',
          'fbauth2',
          'fbshareextension',
        ],
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
            config.android?.config?.googleMaps?.apiKey ||
            '',
        },
      },
      intentFilters: [
        ...(config.android?.intentFilters ?? []),
        {
          action: 'VIEW',
          autoVerify: false,
          data: [{ scheme: 'kudyaparceiro', pathPrefix: '/oauth' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      ...config.extra,
      googleMapsApiKey:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
        config.extra?.googleMapsApiKey,
    },
  }
}
