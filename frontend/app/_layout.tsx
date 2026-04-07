import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from hiding until fonts load
SplashScreen.preventAutoHideAsync();

import React, { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeToken } from '@/services/api';

export const unstable_settings = {
  anchor: 'index',
};

import { Colors, Branding } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/hooks/use-theme';
import { View, Platform } from 'react-native';

// Global error handler for "keep awake" on web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('keep awake')) {
      console.warn('Caught and suppressed unhandled keep-awake rejection:', event.reason.message);
      event.preventDefault();
    }
  });
}

function AppContent() {
  const { colorScheme } = useTheme();
  // FORCE DARK MODE
  const themeColors = Colors['dark'];

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1, backgroundColor: Branding.black }}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <SafeAreaView style={{ flex: 1, backgroundColor: Branding.black }} edges={['top']}>
          <View style={{ flex: 1, backgroundColor: Branding.black }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: Branding.black }
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="mypath" />
              <Stack.Screen name="future" />
              <Stack.Screen name="marriage" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
            </Stack>
          </View>
        </SafeAreaView>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [loaded, error] = useFonts({
    'MuktaMalar-Regular': require('../assets/fonts/MuktaMalar-Regular.ttf'),
    'MuktaMalar-Bold': require('../assets/fonts/MuktaMalar-Bold.ttf'),
    'TamilFont': require('../assets/fonts/tamilfont.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      console.log('RootLayout: Starting preparation (Auth check)...');
      try {
        await initializeToken();
        console.log('RootLayout: Auth initialization completed.');
      } catch (e) {
        console.warn('RootLayout: Preparation failed:', e);
      } finally {
        setAppIsReady(true);
        console.log('RootLayout: Set appIsReady = true');
      }
    }
    prepare();

    const timeout = setTimeout(() => {
      console.log('SplashScreen: Failsafe hiding triggered after 5s');
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log(`RootLayout: Font state -> loaded: ${loaded}, error: ${error}`);
    if (loaded || error) {
      console.log('SplashScreen: Hiding as fonts are processed');
      SplashScreen.hideAsync().catch(err => {
        console.warn('SplashScreen.hideAsync failed:', err);
      });
    }
  }, [loaded, error]);

  if (!loaded && !error && !appIsReady) {
    console.log('RootLayout: Not ready yet, returning null...');
    return null;
  }

  console.log('RootLayout: Rendering main app content...');

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
