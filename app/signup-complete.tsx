import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#3D6836';

export default function SignupCompleteScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>환영합니다!</Text>
          <Text style={styles.welcomeDesc}>
            회원가입이 완료되었습니다!{'\n'}
            가입하신 정보로 로그인을 완료 주세요!
          </Text>
          <Image
            source={require('@/assets/images/mascot_great.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.replace('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>로그인화면으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_GREEN,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 28,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  mascot: {
    width: 160,
    height: 160,
    marginBottom: 28,
  },
  loginBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
