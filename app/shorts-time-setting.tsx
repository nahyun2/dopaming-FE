import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shortformService } from '@/services/shortform';

const PRIMARY_GREEN = '#3D6836';
const TIME_RED = '#8B1A1A';

export default function ShortsTimeSettingScreen() {
  const [hours, setHours] = useState('03');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadLimit = async () => {
      try {
        const limit = await shortformService.getLimit();
        const safeSeconds = Math.max(0, limit.dailyLimitSeconds);
        const nextHours = Math.floor(safeSeconds / 3600);
        const nextMinutes = Math.floor((safeSeconds % 3600) / 60);
        const nextSeconds = safeSeconds % 60;

        if (isActive) {
          setHours(String(nextHours).padStart(2, '0'));
          setMinutes(String(nextMinutes).padStart(2, '0'));
          setSeconds(String(nextSeconds).padStart(2, '0'));
        }
      } catch (error) {
        if (isActive) {
          console.warn('Failed to load shortform limit:', error);
        }
      }
    };

    loadLimit();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async () => {
    if (isSaving) return;

    const dailyLimitSeconds =
      Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0);

    try {
      setIsSaving(true);
      await shortformService.updateLimit({ dailyLimitSeconds });
      setShowModal(true);
    } catch (error) {
      Alert.alert(
        '저장 실패',
        error instanceof Error ? error.message : '하루 숏폼 제한 시간 변경에 실패했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToMain = () => {
    setShowModal(false);
    router.replace('/(tabs)');
  };

  const formatValue = (value: string, max: number) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return '00';
    return String(Math.min(num, max)).padStart(2, '0');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>제한 Shorts 이용 시간</Text>

      <View style={styles.timeCard}>
        <TextInput
          style={styles.timeInput}
          value={hours}
          onChangeText={(v) => setHours(v.replace(/[^0-9]/g, '').slice(0, 2))}
          onBlur={() => setHours(formatValue(hours, 23))}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
        <Text style={styles.timeLabel}>시간</Text>
        <TextInput
          style={styles.timeInput}
          value={minutes}
          onChangeText={(v) => setMinutes(v.replace(/[^0-9]/g, '').slice(0, 2))}
          onBlur={() => setMinutes(formatValue(minutes, 59))}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
        <Text style={styles.timeLabel}>분</Text>
        <TextInput
          style={styles.timeInput}
          value={seconds}
          onChangeText={(v) => setSeconds(v.replace(/[^0-9]/g, '').slice(0, 2))}
          onBlur={() => setSeconds(formatValue(seconds, 59))}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
        <Text style={styles.timeLabel}>초</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <TouchableOpacity
          disabled={isSaving}
          onPress={handleSave}
          style={styles.saveBtn}
          activeOpacity={0.7}>
          <Text style={styles.saveBtnText}>{isSaving ? '저장 중...' : '저장하기'}</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>저장되었습니다!</Text>
            <Text style={styles.modalDesc}>
              변경된 설정이 저장되었습니다!{'\n'}
              도파민 중독에서 벗어나는 그날까지 도파밍!
            </Text>
            <Image
              source={require('@/assets/images/mascot_great.png')}
              style={styles.modalMascot}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.mainBtn}
              onPress={handleGoToMain}
              activeOpacity={0.8}
            >
              <Text style={styles.mainBtnText}>메인으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backText: {
    fontSize: 16,
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  timeInput: {
    fontSize: 44,
    fontWeight: '700',
    color: TIME_RED,
    minWidth: 64,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: TIME_RED,
    paddingBottom: 2,
  },
  timeLabel: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  saveBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  saveBtnText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalMascot: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  mainBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
