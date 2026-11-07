const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const mapsStub = path.resolve(__dirname, 'stubs/react-native-maps.web.tsx');
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === 'react-native-maps') {
      return { filePath: mapsStub, type: 'sourceFile' };
    }
    // Prefer Metro's live context so newly added screens (e.g. grocery) resolve
    // even if Expo's captured resolver still holds a stale module map.
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch (error) {
      if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
      }
      throw error;
    }
  },
};

module.exports = config;
