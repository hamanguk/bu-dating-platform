// src/screens/main/ExploreScreen.tsx
// 추후 react-native-deck-swiper 또는 직접 구현한 스와이프 카드 컴포넌트로 교체
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcf8f8" />

      <View style={styles.header}>
        <Text style={styles.title}>탐색</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color="#ff6b81" />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <View style={styles.cardPlaceholder}>
          <Text style={styles.cardEmoji}>💝</Text>
          <Text style={styles.cardName}>스와이프 매칭</Text>
          <Text style={styles.cardDesc}>마음에 드는 프로필을 오른쪽으로</Text>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Ionicons name="close" size={28} color="#a14553" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnPrimary}>
            <Ionicons name="heart" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          스와이프 카드 UI는 다음 단계에서 구현됩니다
        </Text>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = '#ff6b81';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcf8f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title:     { fontSize: 22, fontWeight: '800', color: '#1d0c0f' },
  filterBtn: { padding: 8 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingBottom: 40,
  },

  cardPlaceholder: {
    width: 300,
    height: 400,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#eacdd1',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  cardEmoji: { fontSize: 64 },
  cardName:  { fontSize: 22, fontWeight: '800', color: '#1d0c0f' },
  cardDesc:  { fontSize: 14, color: '#a14553' },

  actionRow: { flexDirection: 'row', gap: 24 },
  actionBtnSecondary: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#eacdd1',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  actionBtnPrimary: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  hint: { fontSize: 12, color: '#c9a0ac', textAlign: 'center', paddingHorizontal: 40 },
});
