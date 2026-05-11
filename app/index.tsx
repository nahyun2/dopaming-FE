import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#3D6836';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/mascot_loding.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>
          나의 뇌 지킴이,{' '}
          <Text style={styles.brandName}>도파밍</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  mascot: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  tagline: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  brandName: {
    color: PRIMARY_GREEN,
    fontWeight: '700',
  },
});
