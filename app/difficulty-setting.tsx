import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#3D772D';

const difficultyOptions = ['쉬움', '보통', '어려움', '끄기'];
const frequencyOptions = ['1분', '5분', '10분', '직접 설정 -      분'];

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
  const [difficulty, setDifficulty] = useState('보통');
  const [frequency, setFrequency] = useState('5분');

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
      </View>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveText}>저장하기</Text>
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
