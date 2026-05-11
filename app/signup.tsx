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

const PASSWORD_REGEX = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [checkIdState, setCheckIdState] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [checkIdMessage, setCheckIdMessage] = useState('');

  const handleCheckId = async () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 먼저 입력해주세요.');
      return;
    }
    setCheckIdState('checking');
    const result = await authService.checkId(email);
    setCheckIdState(result.isAvailable ? 'available' : 'unavailable');
    setCheckIdMessage(result.message);
  };

  const validatePassword = (pw: string) => {
    if (!pw) { setPasswordError(''); return; }
    if (!PASSWORD_REGEX.test(pw)) {
      setPasswordError('특수문자를 포함한 8자 이상이어야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !name.trim() || !nickname.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }
    if (checkIdState !== 'available') {
      Alert.alert('알림', '이메일 중복 확인을 완료해주세요.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      Alert.alert('알림', '비밀번호는 특수문자를 포함한 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup({ loginId: email, password, name, nickname });
      router.replace('/signup-complete');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '오류가 발생했습니다.';
      Alert.alert('회원가입 실패', msg);
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
            <View>
              <View style={styles.checkIdRow}>
                <TextInput
                  style={styles.checkIdInput}
                  placeholder="이메일"
                  placeholderTextColor="#BBBBBB"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setCheckIdState('idle');
                    setCheckIdMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={[styles.checkIdBtn, checkIdState === 'checking' && styles.btnDisabled]}
                  onPress={handleCheckId}
                  disabled={checkIdState === 'checking'}
                  activeOpacity={0.8}
                >
                  <Text style={styles.checkIdBtnText}>
                    {checkIdState === 'checking' ? '확인 중' : '중복 확인'}
                  </Text>
                </TouchableOpacity>
              </View>
              {checkIdMessage ? (
                <Text style={checkIdState === 'available' ? styles.successText : styles.errorText}>
                  {checkIdMessage}
                </Text>
              ) : null}
            </View>

            <View>
              <View style={[styles.passwordRow, passwordError ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="비밀번호 (특수문자 포함 8자 이상)"
                  placeholderTextColor="#BBBBBB"
                  value={password}
                  onChangeText={(v) => { setPassword(v); validatePassword(v); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.showBtn}
                >
                  <Text style={styles.showBtnText}>{showPassword ? '숨기기' : '보기'}</Text>
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <TextInput
              style={styles.input}
              placeholder="이름"
              placeholderTextColor="#BBBBBB"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />

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
            <Text style={styles.signupBtnText}>
              {isLoading ? '처리 중...' : '회원가입'}
            </Text>
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
  inputError: {
    borderWidth: 1,
    borderColor: '#E53935',
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
  checkIdRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkIdInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  checkIdBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIdBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: '#3D6836',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: '#E53935',
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
