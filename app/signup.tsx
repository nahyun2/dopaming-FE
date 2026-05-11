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

export default function SignupScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!userId.trim() || !password.trim() || !nickname.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup({ userId, password, nickname });
      router.replace('/signup-complete');
    } catch {
      Alert.alert('회원가입 실패', '이미 사용 중인 아이디이거나 오류가 발생했습니다.');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>회원가입</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor="#BBBBBB"
              value={userId}
              onChangeText={setUserId}
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
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.showBtn}
              >
                <Text style={styles.showBtnText}>Show</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="닉네임"
              placeholderTextColor="#BBBBBB"
              value={nickname}
              onChangeText={setNickname}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
          </View>

          <TouchableOpacity
            style={[styles.signupBtn, isLoading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.signupBtnText}>회원가입</Text>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: 24,
  },
  closeBtnText: {
    fontSize: 20,
    color: '#1A1A1A',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 48,
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
  signupBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
