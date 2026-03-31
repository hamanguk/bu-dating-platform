// src/screens/auth/ProfileSetupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db }            from '../../config/firebase';
import { useAuthStore }  from '../../store/authStore';
import { COLLECTIONS }   from '../../types/models';
import type { User }     from '../../types/models';

type Gender = 'male' | 'female' | 'other';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',   label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other',  label: '기타' },
];

export default function ProfileSetupScreen() {
  const { currentUser, userProfile, _setUserProfile } = useAuthStore();

  const [nickname,    setNickname]    = useState('');
  const [ageText,     setAgeText]     = useState('');
  const [gender,      setGender]      = useState<Gender | null>(null);
  const [bio,         setBio]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 유효성 검사 ───────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!nickname.trim()) {
      Alert.alert('입력 오류', '닉네임을 입력해주세요.'); return false;
    }
    if (nickname.trim().length < 2) {
      Alert.alert('입력 오류', '닉네임은 2자 이상 입력해주세요.'); return false;
    }
    const age = Number(ageText);
    if (!ageText || isNaN(age) || age < 18 || age > 40) {
      Alert.alert('입력 오류', '올바른 나이를 입력해주세요. (18~40세)'); return false;
    }
    if (!gender) {
      Alert.alert('입력 오류', '성별을 선택해주세요.'); return false;
    }
    return true;
  };

  // ── 제출: Firestore 업데이트 + 스토어 갱신 ───────────────────────────
  const handleSubmit = async () => {
    if (!validate() || !currentUser) return;
    setIsSubmitting(true);

    try {
      const updates: Partial<Omit<User, 'lastActive'>> & { lastActive: any } = {
        nickname:          nickname.trim(),
        age:               Number(ageText),
        gender,
        bio:               bio.trim(),
        isProfileComplete: true,
        lastActive:        serverTimestamp(),
      };

      await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), updates);

      // 스토어 즉시 갱신 → RootNavigator 가 자동으로 MainTab 으로 이동
      if (userProfile) {
        _setUserProfile({ ...userProfile, ...updates, lastActive: null });
      }
    } catch (e: any) {
      console.error('[ProfileSetup] error:', e);
      Alert.alert('오류', '프로필 저장 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcf8f8" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <Text style={styles.title}>프로필 설정</Text>
          <Text style={styles.subtitle}>
            다른 학생들에게 보여질 프로필을 만들어주세요
          </Text>

          {/* 프로필 사진 (추후 ImagePicker 로 확장) */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>📷</Text>
            </View>
            <Text style={styles.avatarHint}>사진 추가 (선택사항)</Text>
          </View>

          {/* 닉네임 */}
          <View style={styles.field}>
            <Text style={styles.label}>닉네임 *</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="2~10자 닉네임을 입력하세요"
              placeholderTextColor="#c9a0ac"
              maxLength={10}
              returnKeyType="next"
              autoCapitalize="none"
            />
          </View>

          {/* 나이 */}
          <View style={styles.field}>
            <Text style={styles.label}>나이 *</Text>
            <TextInput
              style={[styles.input, styles.inputShort]}
              value={ageText}
              onChangeText={setAgeText}
              placeholder="예: 22"
              placeholderTextColor="#c9a0ac"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          {/* 성별 */}
          <View style={styles.field}>
            <Text style={styles.label}>성별 *</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.genderBtn,
                    gender === value && styles.genderBtnActive,
                  ]}
                  onPress={() => setGender(value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.genderBtnText,
                    gender === value && styles.genderBtnTextActive,
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 자기소개 */}
          <View style={styles.field}>
            <Text style={styles.label}>자기소개</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="간단하게 자신을 소개해주세요..."
              placeholderTextColor="#c9a0ac"
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length} / 200</Text>
          </View>

          {/* 제출 버튼 */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={styles.submitBtnText}>시작하기 →</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────

const PRIMARY = '#ff6b81';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcf8f8' },
  scroll:   { padding: 24, paddingBottom: 48 },

  title:    { fontSize: 26, fontWeight: '800', color: '#1d0c0f', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#a14553', marginBottom: 32, lineHeight: 20 },

  // 프로필 사진 섹션
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${PRIMARY}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: `${PRIMARY}30`,
    borderStyle: 'dashed',
  },
  avatarEmoji: { fontSize: 36 },
  avatarHint:  { fontSize: 12, color: '#a14553' },

  // 폼 필드
  field:  { marginBottom: 24 },
  label:  { fontSize: 14, fontWeight: '700', color: '#1d0c0f', marginBottom: 8 },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eacdd1',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1d0c0f',
    backgroundColor: '#ffffff',
  },
  inputShort: { width: 100 },
  bioInput: {
    height: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: '#a14553',
    marginTop: 4,
  },

  // 성별 선택
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eacdd1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  genderBtnActive:     { borderColor: PRIMARY, backgroundColor: `${PRIMARY}12` },
  genderBtnText:       { fontSize: 14, fontWeight: '600', color: '#a14553' },
  genderBtnTextActive: { color: PRIMARY },

  // 제출 버튼
  submitBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { fontSize: 17, fontWeight: '700', color: '#ffffff' },
});
