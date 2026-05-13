import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';
import { settingsService } from '@/services/settings';

export default function ProfileScreen() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [nickname, setNickname] = useState('닉네임');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      const settings = await settingsService.getSettings();

      if (isActive) {
        setNickname(settings.nickname);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async () => {
    const nextNickname = nickname.trim();

    if (!nextNickname) {
      Alert.alert('저장 실패', '프로필 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const settings = await settingsService.updateNickname(nextNickname);
      setNickname(settings.nickname);
      setSaveModalVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToMain = () => {
    setSaveModalVisible(false);
    router.replace('/(tabs)');
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      await settingsService.clearSettings();
      setDeleteModalVisible(false);
      router.replace('/login');
    } catch (error) {
      Alert.alert(
        '계정삭제 실패',
        error instanceof Error ? error.message : '계정을 삭제하지 못했습니다.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>뒤로가기</Text>
        </Pressable>
        <Text style={styles.title}>프로필</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Pressable style={styles.avatar}>
          <Image
            source={require('@/assets/images/default-profile-avatar.png')}
            style={styles.avatarImage}
          />
          <View style={styles.avatarEditBadge}>
            <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
          </View>
        </Pressable>

        <View style={styles.nicknameRow}>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            maxLength={12}
            placeholder="닉네임"
            placeholderTextColor="#000000"
            style={styles.nicknameInput}
          />
          <Ionicons name="pencil-outline" size={30} color="#B7B7B7" />
        </View>

        <View style={styles.divider} />
        <Pressable disabled={isSaving} onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>{isSaving ? '저장 중...' : '저장하기'}</Text>
        </Pressable>
        <View style={styles.divider} />
      </View>

      <Pressable onPress={() => setDeleteModalVisible(true)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>계정삭제</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={saveModalVisible}>
        <View style={styles.saveModalOverlay}>
          <View style={styles.saveModalCard}>
            <Text style={styles.saveModalTitle}>저장되었습니다!</Text>
            <Text style={styles.saveModalDesc}>
              변경된 설정이 저장되었습니다!{'\n'}
              도파민 중독에서 벗어나는 그날까지 도파밍!
            </Text>
            <Image
              source={require('@/assets/images/mascot_great.png')}
              style={styles.saveModalMascot}
              resizeMode="contain"
            />
            <Pressable onPress={handleGoToMain} style={styles.mainButton}>
              <Text style={styles.mainButtonText}>메인으로</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={deleteModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>되돌릴 수 없습니다!</Text>
            <Text style={styles.modalMessage}>
              계정을 삭제하시면, 이 계정의 데이터는{'\n'}
              더이상 복구하실 수 없습니다!{'\n'}
              계속하시겠습니까?
            </Text>

            <Image
              source={require('@/assets/images/delete-warning-mascot.png')}
              style={styles.warningMascot}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelText}>뒤로가기</Text>
              </Pressable>
              <Pressable
                disabled={isDeleting}
                onPress={handleDeleteAccount}
                style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.confirmText}>{isDeleting ? '삭제 중...' : '삭제하기'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 93,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    minWidth: 78,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    color: '#3D772D',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  title: {
    color: '#000000',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  headerSpacer: {
    width: 78,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  avatar: {
    width: 165,
    height: 165,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 82.5,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 82.5,
    resizeMode: 'cover',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#3D772D',
  },
  nicknameRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },
  nicknameInput: {
    minWidth: 100,
    padding: 0,
    color: '#000000',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 39,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#9D9D9D',
  },
  saveButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  saveText: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  deleteButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 36,
    height: 52,
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8D8D8',
  },
  deleteText: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  saveModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  saveModalCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
  },
  saveModalTitle: {
    color: '#1A1A1A',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  saveModalDesc: {
    color: '#666666',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  saveModalMascot: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  mainButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#3D6836',
    paddingVertical: 18,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.43)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 31,
  },
  modalTitle: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31,
    marginBottom: 13,
  },
  modalMessage: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 15,
  },
  warningMascot: {
    width: 112,
    height: 112,
    marginBottom: 18,
    resizeMode: 'contain',
  },
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalButton: {
    width: 120,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  cancelButton: {
    backgroundColor: '#BDBDBD',
  },
  confirmButton: {
    backgroundColor: '#3D772D',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
});
