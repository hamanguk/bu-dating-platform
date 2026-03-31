// src/screens/main/MyProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

const GENDER_LABEL: Record<string, string> = {
  male:   '남성',
  female: '여성',
  other:  '기타',
};

export default function MyProfileScreen() {
  const { userProfile, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcf8f8" />

      {/* ── 헤더 ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 프로필</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color="#1d0c0f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ff6b81" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 프로필 카드 ────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            {userProfile?.profileImages?.[0] ? (
              <Text style={styles.avatarEmoji}>🖼️</Text>
            ) : (
              <Text style={styles.avatarEmoji}>👤</Text>
            )}
            {/* 인증 배지 */}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.nickname}>
            {userProfile?.nickname || '닉네임 없음'}
            {userProfile?.age ? `, ${userProfile.age}` : ''}
          </Text>
          <Text style={styles.email}>{userProfile?.email}</Text>

          {/* 태그 행 */}
          <View style={styles.tagRow}>
            {userProfile?.gender && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {GENDER_LABEL[userProfile.gender] ?? userProfile.gender}
                </Text>
              </View>
            )}
            <View style={styles.tag}>
              <Text style={styles.tagText}>인증됨 ✓</Text>
            </View>
          </View>
        </View>

        {/* ── 자기소개 ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자기소개</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>
              {userProfile?.bio || '자기소개가 없습니다.'}
            </Text>
          </View>
        </View>

        {/* ── 프로필 수정 버튼 ────────────────────────────────────────── */}
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={18} color="#ffffff" />
          <Text style={styles.editBtnText}>프로필 수정</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#ff6b81';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcf8f8' },
  scroll:   { padding: 20, paddingBottom: 100 },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#1d0c0f' },
  headerRight:  { flexDirection: 'row', gap: 4 },
  headerBtn:    { padding: 8 },

  // 프로필 카드
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eacdd1',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${PRIMARY}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: `${PRIMARY}30`,
    position: 'relative',
  },
  avatarEmoji:  { fontSize: 40 },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nickname:   { fontSize: 22, fontWeight: '800', color: '#1d0c0f', marginBottom: 4 },
  email:      { fontSize: 13, color: '#a14553', marginBottom: 14 },
  tagRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: `${PRIMARY}12`,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${PRIMARY}30`,
  },
  tagText: { fontSize: 12, color: PRIMARY, fontWeight: '700' },

  // 섹션
  section:       { marginBottom: 16 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#1d0c0f', marginBottom: 10 },
  bioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eacdd1',
  },
  bioText: { fontSize: 15, color: '#1d0c0f', lineHeight: 22 },

  // 수정 버튼
  editBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 8,
  },
  editBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});
