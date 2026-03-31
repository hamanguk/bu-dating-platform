// src/screens/main/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function HomeScreen() {
  const { userProfile } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── 헤더 ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={24} color="#ff6b81" />
          <Text style={styles.headerTitle}>캠퍼스 데이트</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={24} color="#1d0c0f" />
            {/* 알림 배지 (추후 실제 카운트로 교체) */}
            <View style={styles.notiBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="options-outline" size={24} color="#1d0c0f" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── 환영 배너 ─────────────────────────────────────────────────── */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              안녕하세요{userProfile?.nickname ? `, ${userProfile.nickname}` : ''}님 👋
            </Text>
            <Text style={styles.bannerSub}>
              학교 인증 기반{'\n'}안전한 소개팅 플랫폼
            </Text>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>인증 상태 확인</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bannerBgIcon}>🛡️</Text>
        </View>

        {/* ── 탭 전환 (1:1 소개팅 / 과팅) ───────────────────────────────── */}
        <View style={styles.modeTabRow}>
          <TouchableOpacity style={[styles.modeTab, styles.modeTabActive]}>
            <Text style={[styles.modeTabText, styles.modeTabTextActive]}>1:1 소개팅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeTab}>
            <Text style={styles.modeTabText}>과팅</Text>
          </TouchableOpacity>
        </View>

        {/* ── 피드 카드 플레이스홀더 ────────────────────────────────────── */}
        <View style={styles.placeholder}>
          <Ionicons name="heart-outline" size={56} color="#eacdd1" />
          <Text style={styles.placeholderText}>추천 프로필 피드</Text>
          <Text style={styles.placeholderSub}>
            Explore 탭에서 스와이프 매칭을 시작하세요
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#ff6b81';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcf8f8' },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6e8',
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1d0c0f' },
  headerRight: { flexDirection: 'row', gap: 4 },
  headerBtn:   { padding: 8, position: 'relative' },
  notiBadge: {
    position: 'absolute',
    top: 8, right: 8,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },

  // 배너
  banner: {
    margin: 16,
    padding: 20,
    backgroundColor: `${PRIMARY}12`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${PRIMARY}20`,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerContent: { flex: 1 },
  bannerTitle:   { fontSize: 16, fontWeight: '700', color: '#1d0c0f', marginBottom: 4 },
  bannerSub:     { fontSize: 13, color: '#a14553', lineHeight: 18, marginBottom: 12 },
  bannerBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: PRIMARY,
    borderRadius: 20,
  },
  bannerBtnText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  bannerBgIcon:  { fontSize: 60, opacity: 0.15, marginLeft: -10 },

  // 모드 탭
  modeTabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f0e6e8',
    borderRadius: 24,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeTabActive:     { backgroundColor: '#ffffff' },
  modeTabText:       { fontSize: 14, fontWeight: '600', color: '#a14553' },
  modeTabTextActive: { color: PRIMARY },

  // 플레이스홀더
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  placeholderText: { fontSize: 16, color: '#a14553', fontWeight: '600' },
  placeholderSub:  { fontSize: 13, color: '#c9a0ac', textAlign: 'center', paddingHorizontal: 40 },
});
