import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shortformService } from '@/services/shortform';

function formatLocalDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function SettingRow({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      {children}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [isRecordingUsage, setIsRecordingUsage] = useState(false);

  const handleRecordUsage = async () => {
    if (isRecordingUsage) return;

    const endedAt = new Date();
    const durationSeconds = 60;
    const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000);

    try {
      setIsRecordingUsage(true);
      const result = await shortformService.recordUsage({
        platform: 'YOUTUBE_SHORTS',
        startedAt: formatLocalDateTime(startedAt),
        endedAt: formatLocalDateTime(endedAt),
        durationSeconds,
      });

      Alert.alert(
        '숏폼 사용 시간이 기록되었습니다.',
        `오늘 사용 시간: ${result.todayUsageSeconds}초\n남은 시간: ${result.remainingSeconds}초\n상태: ${result.status}`
      );
    } catch (error) {
      Alert.alert(
        '기록 실패',
        error instanceof Error ? error.message : '숏폼 사용 시간 기록에 실패했습니다.'
      );
    } finally {
      setIsRecordingUsage(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>뒤로가기</Text>
        </Pressable>
        <Text style={styles.title}>설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.list}>
        <SettingRow label="프로필" onPress={() => router.push('/profile')} />
        <SettingRow label="제한 Shorts 이용 시간 변경" onPress={() => router.push('/shorts-time-setting')} />
        <SettingRow
          label={isRecordingUsage ? '숏폼 사용 시간 기록 중...' : '숏폼 사용 시간 기록'}
          onPress={handleRecordUsage}
        />
        <SettingRow label="문제 난이도 변경" onPress={() => router.push('/difficulty-setting')} />
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
  list: {
    paddingHorizontal: 16,
  },
  row: {
    height: 40,
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
});
