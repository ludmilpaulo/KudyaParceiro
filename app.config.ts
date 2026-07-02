import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Kudya Parceiro',
  slug: config.slug ?? 'kudya-parceiro',
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
  },
  extra: {
    ...config.extra,
    googleMapsApiKey:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
      config.extra?.googleMapsApiKey,
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          usesCleartextTraffic: process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true',
        },
      },
    ],
  ],
})
