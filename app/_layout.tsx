import "./global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { type Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@/components/primitives/portal";
import { DatabaseProvider } from "@/db/provider";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { getItem, setItem } from "@/lib/storage";
import { Platform } from "react-native";

const NAV_FONT_FAMILY = "Inter-Black";
const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "500",
    },
    bold: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "800",
    },
  },
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "500",
    },
    bold: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "800",
    },
  },
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// // Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = getItem("theme");

      if (!theme) {
        setAndroidNavigationBar(colorScheme);
        setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      setAndroidNavigationBar(colorTheme);
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <>
      <DatabaseProvider>
        <ThemeProvider value={colorScheme === "dark" ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ title: "Habits", headerShown: false }} />
                <Stack.Screen options={{
                  headerShadowVisible: false,
                }} name="habits/archive" />
                <Stack.Screen options={{
                  headerShadowVisible: false,
                }} name="habits/[id]" />
              </Stack>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeProvider>

      </DatabaseProvider>
      <PortalHost />
    </>

  );
}
