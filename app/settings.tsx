import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <SettingRow label="제한 Shorts 이용 시간 변경" />
        <SettingRow label="문제 난이도 변경" />
        <SettingRow label="Radio option here...">
          <View style={styles.radioOuter} />
        </SettingRow>
        <SettingRow label="Radio option here...">
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
        </SettingRow>
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
  radioOuter: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 7,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3D772D',
  },
});
