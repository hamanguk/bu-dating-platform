// src/navigation/RootNavigator.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import LoginScreen       from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import MainTabNavigator  from './MainTabNavigator';
import ChatRoomScreen    from '../screens/main/ChatRoomScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 루트 네비게이터
 *
 * Zustand 상태(isLoading, currentUser, userProfile)에 따라
 * 보여줄 스택을 조건부로 렌더링합니다.
 *
 * ┌─ isLoading ──────────────────────────────┐
 * │  SplashLoading (전체화면 스피너)            │
 * ├─ !currentUser ───────────────────────────┤
 * │  LoginScreen                              │
 * ├─ currentUser + !isProfileComplete ────────┤
 * │  ProfileSetupScreen                       │
 * └─ currentUser + isProfileComplete ─────────┘
 *    MainTabNavigator
 *
 * 상태가 변경될 때마다 이 컴포넌트가 재렌더링되어
 * 별도 navigate() 호출 없이 자동으로 화면이 전환됩니다.
 */
export default function RootNavigator() {
  const { currentUser, userProfile, isLoading } = useAuthStore();

  // ── 초기 로딩 (Firebase onAuthStateChanged 응답 대기) ──────────────────
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🛡️</Text>
        <Text style={styles.splashTitle}>캠퍼스 데이트</Text>
        <ActivityIndicator
          size="large"
          color="#ff6b81"
          style={styles.splashSpinner}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
      }}
    >
      {!currentUser ? (
        // ── 미로그인 ────────────────────────────────────────────────────
        <Stack.Screen name="Login" component={LoginScreen} />

      ) : !userProfile?.isProfileComplete ? (
        // ── 로그인 완료, 프로필 미완성 ──────────────────────────────────
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{ gestureEnabled: false }}
        />

      ) : (
        // ── 프로필 완성 → 메인 탭 + 채팅방 ──────────────────────────────
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#fff0f3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  splashLogo: {
    fontSize: 56,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1d0c0f',
    letterSpacing: -0.5,
  },
  splashSpinner: {
    marginTop: 16,
  },
});
