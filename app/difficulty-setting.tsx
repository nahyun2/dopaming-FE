import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProblemDifficulty, settingsService } from '@/services/settings';

const PRIMARY_GREEN = '#3D772D';
const CUSTOM_FREQUENCY = '시간 직접선택하기';

const difficultyOptions: ProblemDifficulty[] = ['쉬움', '보통', '어려움', '끄기'];
const frequencyOptions = ['1분', '5분', '10분', CUSTOM_FREQUENCY];

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

export default function DifficultySettingScreen() {
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('보통');
  const [frequency, setFrequency] = useState('5분');
  const [customMinutes, setCustomMinutes] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadSettings = async () => {
      const settings = await settingsService.getSettings();

      if (!isActive) return;

      const { difficultySettings } = settings;
      setDifficulty(difficultySettings.difficulty);
      setCustomMinutes(String(difficultySettings.frequencyMinutes));
      setFrequency(
        difficultySettings.isCustomFrequency
          ? CUSTOM_FREQUENCY
          : `${difficultySettings.frequencyMinutes}분`
      );
    };

    loadSettings();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async () => {
    if (isSaving) return;

    const minutes =
      frequency === CUSTOM_FREQUENCY
        ? Number(customMinutes)
        : Number(frequency.replace(/[^0-9]/g, ''));

    if (!Number.isFinite(minutes) || minutes < 1) {
      Alert.alert('저장 실패', '시간은 1분 이상으로 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      await settingsService.updateDifficultySettings({
        difficulty,
        frequencyMinutes: Math.floor(minutes),
        isCustomFrequency: frequency === CUSTOM_FREQUENCY,
      });
      Alert.alert('저장되었습니다', '문제 난이도 설정이 저장되었습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>뒤로가기</Text>
        </Pressable>
        <Pressable hitSlop={10} style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={20} color="#BDBDBD" />
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>난이도 선택</Text>
      <View style={styles.list}>
        {difficultyOptions.map((option) => (
          <RadioRow
            key={option}
            label={option}
            selected={difficulty === option}
            onPress={() => setDifficulty(option)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>빈도</Text>
      <View style={styles.list}>
        {frequencyOptions.map((option) => (
          <RadioRow
            key={option}
            label={option}
            selected={frequency === option}
            onPress={() => setFrequency(option)}
          />
        ))}
        {frequency === CUSTOM_FREQUENCY ? (
          <View style={styles.customTimeRow}>
            <TextInput
              value={customMinutes}
              onChangeText={(value) => setCustomMinutes(value.replace(/[^0-9]/g, '').slice(0, 3))}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="분"
              placeholderTextColor="#BDBDBD"
              selectTextOnFocus
              style={styles.customTimeInput}
            />
            <Text style={styles.customTimeUnit}>분</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <Pressable disabled={isSaving} onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>{isSaving ? '저장 중...' : '저장하기'}</Text>
        </Pressable>
        <View style={styles.divider} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  backButton: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  backText: {
    color: PRIMARY_GREEN,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  helpButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginTop: 42,
    marginBottom: 14,
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 8,
  },
  row: {
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8D8D8',
  },
  rowText: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
  customTimeRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8D8D8',
    columnGap: 8,
  },
  customTimeInput: {
    width: 76,
    height: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 6,
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  customTimeUnit: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  radioOuter: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 7,
  },
  radioOuterSelected: {
    borderColor: PRIMARY_GREEN,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_GREEN,
  },
  footer: {
    marginTop: 50,
    paddingHorizontal: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D8D8D8',
  },
  saveButton: {
    height: 40,
    justifyContent: 'center',
  },
  saveText: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
});
