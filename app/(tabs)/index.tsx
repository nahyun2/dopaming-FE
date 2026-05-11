import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function TimeBox({
  label,
  hours,
  minutes,
  seconds,
}: {
  label: string;
  hours: string;
  minutes: string;
  seconds: string;
}) {
  return (
    <View style={styles.timeSection}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timerCard}>
        <Text style={styles.timeNumber}>{hours}</Text>
        <Text style={styles.timeUnit}>시간</Text>
        <Text style={styles.timeNumber}>{minutes}</Text>
        <Text style={styles.timeUnit}>분</Text>
        <Text style={styles.timeNumber}>{seconds}</Text>
        <Text style={styles.timeUnit}>초</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
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
              <Ionicons name="settings-outline" size={27} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={10}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar} />
        <Text style={styles.nickname}>닉네임</Text>
        <View style={styles.divider} />

        <TimeBox label="제한 Shorts 이용 시간" hours="03" minutes="00" seconds="00" />
        <TimeBox label="오늘의 Shorts 이용 시간" hours="23" minutes="59" seconds="59" />

        <Text style={styles.algorithmLabel}>현재 내 Shorts 알고리즘</Text>
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
    height: 257,
    backgroundColor: '#3D772D',
  },
  safeHeader: {
    flex: 1,
  },
  topBar: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 23,
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 57,
  },
  avatar: {
    position: 'absolute',
    top: -124,
    width: 165,
    height: 165,
    borderRadius: 82.5,
    backgroundColor: '#B7B7B7',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  nickname: {
    marginTop: 1,
    color: '#050505',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 39,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: 17,
    marginBottom: 12,
    backgroundColor: '#9D9D9D',
  },
  timeSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  label: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 15,
  },
  timerCard: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 7,
    backgroundColor: '#FAFAFA',
  },
  timeNumber: {
    color: '#BA4449',
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
  },
  timeUnit: {
    color: '#000000',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 37,
  },
  algorithmLabel: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 1,
  },
});
