import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';

const PRIMARY_GREEN = '#3D6836';

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId || !password.trim()) {
      Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ loginId: trimmedUserId, password });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '오류가 발생했습니다.';
      Alert.alert('로그인 실패', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>로그인</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#BBBBBB"
              value={userId}
              onChangeText={setUserId}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="비밀번호"
                placeholderTextColor="#BBBBBB"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.showBtn}
              >
                <Text style={styles.showBtnText}>{showPassword ? '숨기기' : '보기'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>{isLoading ? '처리 중...' : '로그인'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  signupLink: {
    fontSize: 15,
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  form: {
    gap: 12,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  showBtn: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  showBtnText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  loginBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
