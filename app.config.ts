import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Monitus',
  slug: 'monitus-mobile',
  newArchEnabled: true,
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'monitus',
  userInterfaceStyle: 'automatic',
  runtimeVersion: {
    policy: 'appVersion',
  },
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#6366F1',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    newArchEnabled: true,
    supportsTablet: true,
    bundleIdentifier: 'io.monitus.app',
  },
  android: {
    newArchEnabled: true,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#6366F1',
    },
    package: 'io.monitus.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-font',
    'expo-web-browser',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#6366F1',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
  owner: 'monitus',
});
