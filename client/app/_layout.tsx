import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  useFonts as useManropeFonts,
} from '@expo-google-fonts/manrope';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts as useSoraFonts,
} from '@expo-google-fonts/sora';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProvider } from '@/context/AppContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="age-verification" />
      <Stack.Screen name="ai-disclosure" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="chat/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="voice-call"
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="companion/create"
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [soraLoaded, soraError] = useSoraFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });
  const [manropeLoaded, manropeError] = useManropeFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  const fontsLoaded = soraLoaded && manropeLoaded;
  const fontError = soraError || manropeError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
