import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
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
  const [loaded, error] = useFonts({
    'MuktaMalar-Regular': require('../assets/fonts/MuktaMalar-Regular.ttf'),
    'MuktaMalar-Bold': require('../assets/fonts/MuktaMalar-Bold.ttf'),
    'TamilFont': require('../assets/fonts/tamilfont.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    initializeToken().catch(err => {
      console.error('RootLayout: Auth initialization failed:', err);
    });
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
