import './global.css';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { type Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@/components/primitives/portal';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { DARK_THEME, LIGHT_THEME } from '@/lib/constants';
import { useColorScheme } from '@/lib/useColorScheme';
import { getItem, setItem } from '@/lib/storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/stores/authStore';
import { View, ActivityIndicator } from 'react-native';
import { NetworkStatusBar } from '@/components/common/NetworkStatusBar';
import { ErrorBoundary as AppErrorBoundary } from '@/components/common/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState<
    boolean | null
  >(null);

  useEffect(() => {
    initialize();
    // Check if onboarding has been completed
    AsyncStorage.getItem('onboarding_completed').then((value) => {
      setHasCompletedOnboarding(value === 'true');
    });
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized || hasCompletedOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Check if user needs onboarding
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && !hasCompletedOnboarding && !inOnboarding) {
      // Redirect to onboarding if not completed
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isInitialized, segments, hasCompletedOnboarding]);

  if (!isInitialized || hasCompletedOnboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useFrameworkReady();

  useEffect(() => {
    const theme = getItem('theme');
    if (!theme) {
      setAndroidNavigationBar(colorScheme);
      setItem('theme', colorScheme);
      return;
    }
    const colorTheme = theme === 'dark' ? 'dark' : 'light';
    setAndroidNavigationBar(colorTheme);
    if (colorTheme !== colorScheme) {
      setColorScheme(colorTheme);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NetworkStatusBar />
          <BottomSheetModalProvider>
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="room/[id]" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="profile/edit" />
                <Stack.Screen name="onboarding" />
              </Stack>
            </AuthGuard>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
        <PortalHost />
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
