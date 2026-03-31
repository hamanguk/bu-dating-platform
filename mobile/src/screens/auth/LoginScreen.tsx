// src/screens/auth/LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google      from 'expo-auth-session/providers/google';
import * as WebBrowser  from 'expo-web-browser';
import * as Linking     from 'expo-linking';
import { ResponseType } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { useAuthStore } from '../../store/authStore';
import { SCHOOL_EMAIL_DOMAIN } from '../../utils/domainCheck';

// Expo OAuth 완료 후 앱으로 복귀 처리 (반드시 최상단에서 호출)
WebBrowser.maybeCompleteAuthSession();

// ── 상수 ────────────────────────────────────────────────────────────────────

// Expo Go(StoreClient) 환경 여부
const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// auth.expo.io 프록시 URL:
//   https://auth.expo.io/@{Expo-username}/{app-slug}
//   ⚠ Google Cloud Console "승인된 리디렉션 URI"에 이 URL을 등록해야 합니다
const PROXY_REDIRECT_URI = 'https://auth.expo.io/@altld/campus-date';


// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { handleGoogleAuthSuccess, error, clearError } = useAuthStore();

  // ── Google OAuth 훅 ───────────────────────────────────────────────────────
  // Expo Go:  webClientId + PROXY_REDIRECT_URI (auth.expo.io 프록시)
  // 프로덕션: iosClientId / androidClientId + 네이티브 스킴
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    // Expo Go: clientId=web, implicit flow(Token), PKCE 불필요
    // 프로덕션: 플랫폼별 클라이언트 ID, 기본 code flow
    clientId:        IS_EXPO_GO ? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID : undefined,
    iosClientId:     IS_EXPO_GO ? undefined : process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: IS_EXPO_GO ? undefined : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri:     IS_EXPO_GO ? PROXY_REDIRECT_URI : undefined,
    responseType:    IS_EXPO_GO ? ResponseType.IdToken : undefined,
    usePKCE:         IS_EXPO_GO ? false : undefined,
  });

  // ── 프로덕션 빌드 응답 처리 (Expo Go에서는 사용 안 함) ────────────────────
  useEffect(() => {
    if (IS_EXPO_GO || !response) return;

    if (response.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        setIsSigningIn(true);
        handleGoogleAuthSuccess(idToken).finally(() => setIsSigningIn(false));
      }
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      console.log('[LoginScreen] OAuth cancelled by user');
    } else if (response.type === 'error') {
      console.error('[LoginScreen] OAuth error:', response.error);
      Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  }, [response]);

  // ── 스토어 에러 표시 (도메인 차단, Firebase 오류 등) ──────────────────────
  useEffect(() => {
    if (error) {
      Alert.alert('로그인 불가', error, [
        { text: '확인', onPress: clearError },
      ]);
    }
  }, [error]);

  // ── Expo Go 프록시 플로우 ─────────────────────────────────────────────────
  // Implicit Flow(Token): client_secret 불필요, 토큰이 URL에 직접 반환됨
  //   1. auth.expo.io/start → Google OAuth (response_type=token)
  //   2. Google → auth.expo.io → exp:// 딥링크에 access_token 포함
  //   3. WebBrowser가 exp:// 감지 → URL에서 access_token 파싱
  const handleProxyLogin = async () => {
    if (!request?.url) return;
    setIsSigningIn(true);
    try {
      const returnUrl = Linking.createURL('expo-auth-session');
      const proxyStartUrl =
        `${PROXY_REDIRECT_URI}/start` +
        `?authUrl=${encodeURIComponent(request.url)}` +
        `&returnUrl=${encodeURIComponent(returnUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(proxyStartUrl, returnUrl);

      if (result.type === 'success') {
        // query string과 fragment(#) 모두 파싱 (implicit flow는 fragment로 올 수 있음)
        const params: Record<string, string> = {};
        const parse = (str: string) =>
          str.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
          });
        parse(result.url.split('?')[1] ?? '');
        parse(result.url.split('#')[1] ?? '');

        const idToken = params.id_token;
        if (idToken) {
          await handleGoogleAuthSuccess(idToken);
        } else {
          console.error('[LoginScreen] no id_token in:', result.url);
          Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
      } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
        Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (e) {
      console.error('[LoginScreen] proxy OAuth error:', e);
      Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // ── 로그인 버튼 핸들러 ────────────────────────────────────────────────────
  const handleLoginPress = async () => {
    if (!request) return;
    clearError();

    if (IS_EXPO_GO) {
      await handleProxyLogin();
    } else {
      // 프로덕션 빌드: 표준 플로우 (iosClientId/androidClientId + 네이티브 스킴)
      await promptAsync();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff0f3" />

      <LinearGradient colors={['#fff0f3', '#ffffff']} style={styles.container}>

        {/* ── 로고 섹션 ────────────────────────────────────────────────── */}
        <View style={styles.logoSection}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconEmoji}>🛡️</Text>
          </View>
          <Text style={styles.appTitle}>캠퍼스 데이트</Text>
          <Text style={styles.appSubtitle}>백석대학교 학생 전용 소개팅 플랫폼</Text>
        </View>

        {/* ── 인증 안내 카드 ───────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          {[
            '재학생 이메일(@bu.ac.kr) 인증',
            '학교 인증으로 안전한 만남',
            '개인정보 보호 정책 준수',
          ].map((text, i) => (
            <View key={i} style={styles.infoRow}>
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.infoText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* ── Google 로그인 버튼 ────────────────────────────────────────── */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.googleButton,
              (isSigningIn || !request) && styles.googleButtonDisabled,
            ]}
            onPress={handleLoginPress}
            disabled={isSigningIn || !request}
            activeOpacity={0.85}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <View style={styles.googleIconBox}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>학교 이메일로 로그인</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            {SCHOOL_EMAIL_DOMAIN} 이메일 계정으로만 로그인할 수 있습니다
          </Text>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────

const PRIMARY   = '#ff6b81';
const TEXT_MAIN = '#1d0c0f';
const TEXT_SUB  = '#a14553';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff0f3' },
  container: { flex: 1, paddingHorizontal: 28 },

  // 로고 섹션
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${PRIMARY}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji:    { fontSize: 38 },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_MAIN,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: TEXT_SUB,
    fontWeight: '500',
    textAlign: 'center',
  },

  // 안내 카드
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#eacdd1',
    gap: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${PRIMARY}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 12, color: PRIMARY, fontWeight: '700' },
  infoText:  { fontSize: 14, color: TEXT_MAIN, fontWeight: '500' },

  // 버튼 섹션
  buttonSection: { paddingBottom: 40, gap: 16 },
  googleButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  googleButtonDisabled: { opacity: 0.6 },
  googleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText:   { fontSize: 15, fontWeight: '800', color: PRIMARY },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: TEXT_SUB,
    lineHeight: 18,
  },
});
