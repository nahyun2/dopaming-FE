import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const preloadAssets = async () => {
      await Asset.loadAsync([
        require('@/assets/images/mascot_loding.png'),
        require('@/assets/images/default-profile-avatar.png'),
        require('@/assets/images/delete-warning-mascot.png'),
        require('@/assets/images/mascot_great.png'),
        require('@/assets/images/react-logo.png'),
      ]);
    };

    const prepare = async () => {
      try {
        await preloadAssets();
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void prepare();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="signup-complete" />
        <Stack.Screen name="shorts-time-setting" />
        <Stack.Screen name="difficulty-setting" />
        <Stack.Screen name="quiz" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
