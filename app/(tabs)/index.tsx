import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authService } from '@/services/auth';
import { settingsService } from '@/services/settings';
import { shortformService } from '@/services/shortform';

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function TimeBox({
  label,
  hours,
  minutes,
  seconds,
  footer,
}: {
  label: string;
  hours: string;
  minutes: string;
  seconds: string;
  footer?: string;
}) {
  return (
    <View style={styles.timeSection}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.timerCard, footer && styles.timerCardWithFooter]}>
        <View style={styles.timerRow}>
          <Text style={styles.timeNumber}>{hours}</Text>
          <Text style={styles.timeUnit}>시간</Text>
          <Text style={styles.timeNumber}>{minutes}</Text>
          <Text style={styles.timeUnit}>분</Text>
          <Text style={styles.timeNumber}>{seconds}</Text>
          <Text style={styles.timeUnit}>초</Text>
        </View>
        {footer && <Text style={styles.cardFooter}>{footer}</Text>}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [todayUsageSeconds, setTodayUsageSeconds] = useState(0);
  const [dailyLimitSeconds, setDailyLimitSeconds] = useState(0);
  const [nickname, setNickname] = useState('닉네임');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadShortformSummary = async () => {
        try {
          const settings = await settingsService.getSettings();
          if (isActive) {
            setNickname(settings.nickname);
            if (settings.hasSavedShortformLimit) {
              setDailyLimitSeconds(settings.shortformLimitSeconds);
            }
          }

          const [usage, limit] = await Promise.all([
            shortformService.getTodayUsage(),
            shortformService.getLimit(),
          ]);

          if (isActive) {
            setTodayUsageSeconds(usage.todayUsageSeconds);
            setDailyLimitSeconds(usage.dailyLimitSeconds ?? limit.dailyLimitSeconds);
          }
        } catch (error) {
          if (isActive) {
            console.warn('Failed to load shortform summary:', error);
          }
        }
      };

      loadShortformSummary();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/login');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '로그아웃에 실패했습니다.';
      Alert.alert('로그아웃 실패', msg);
    }
  };

  const remainingSeconds = Math.max(0, dailyLimitSeconds - todayUsageSeconds);
  const isExceeded = todayUsageSeconds > dailyLimitSeconds;

  const dailyLimit = formatDuration(dailyLimitSeconds);
  const todayUsage = formatDuration(todayUsageSeconds);
  const remaining = formatDuration(remainingSeconds);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={styles.header.backgroundColor} />

      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          <View style={styles.topBar}>
            <Pressable
              hitSlop={10}
              onPress={() => router.push('/settings')}
              style={styles.iconButton}>
              <Ionicons name="settings-outline" size={26} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={10} onPress={handleLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarFrame}>
          <Image
            source={require('@/assets/images/default-profile-avatar.png')}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.nickname}>{nickname}</Text>
        <View style={styles.divider} />

        <TimeBox
          label="제한 Shorts 이용 시간"
          hours={dailyLimit.hours}
          minutes={dailyLimit.minutes}
          seconds={dailyLimit.seconds}
        />
        <TimeBox
          label="오늘의 Shorts 이용 시간"
          hours={todayUsage.hours}
          minutes={todayUsage.minutes}
          seconds={todayUsage.seconds}
        />
        <TimeBox
          label="남은 제한 Shorts 이용 시간"
          hours={remaining.hours}
          minutes={remaining.minutes}
          seconds={remaining.seconds}
          footer={isExceeded ? '초과되었습니다!' : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 240,
    backgroundColor: '#3F792E',
  },
  safeHeader: {
    flex: 1,
  },
  topBar: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingTop: 55,
  },
  avatarFrame: {
    position: 'absolute',
    top: -116,
    width: 156,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 78,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  avatar: {
    width: 146,
    height: 146,
    borderRadius: 73,
    resizeMode: 'cover',
  },
  nickname: {
    color: '#050505',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 39,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: 17,
    marginBottom: 12,
    backgroundColor: '#A7A7A7',
  },
  timeSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#707070',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 10,
  },
  timerCard: {
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E7E7',
    borderRadius: 7,
    backgroundColor: '#FAFAFA',
  },
  timerCardWithFooter: {
    minHeight: 70,
    paddingTop: 7,
    paddingBottom: 6,
  },
  timerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
  timeNumber: {
    color: '#BA4449',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 37,
  },
  timeUnit: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 37,
  },
  cardFooter: {
    color: '#707070',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: -1,
  },
});
