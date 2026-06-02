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
    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
