// src/utils/errorMessages.ts

/**
 * 에러 결과 타입
 * - userMessage : Alert/Toast 로 사용자에게 표시할 한국어 메시지
 * - devLog      : console.error 에 출력할 개발자용 메시지
 */
export interface AuthErrorResult {
  userMessage: string;
  devLog: string;
}

const ERROR_MAP: Record<string, AuthErrorResult> = {
  // ── 커스텀 도메인 차단 ─────────────────────────────────────────────────
  'domain-not-allowed': {
    userMessage: '우리 학교 이메일(@bu.ac.kr)만 이용 가능합니다.\n다른 계정으로 다시 시도해주세요.',
    devLog: 'Sign-in blocked: email domain is not bu.ac.kr',
  },

  // ── 사용자가 로그인 창 닫음 ────────────────────────────────────────────
  'auth/cancelled': {
    userMessage: '로그인이 취소되었습니다.',
    devLog: 'Google OAuth: cancelled by user',
  },

  // ── 네트워크 오류 ──────────────────────────────────────────────────────
  'auth/network-request-failed': {
    userMessage: '네트워크 연결을 확인하고 다시 시도해주세요.',
    devLog: 'Firebase Auth: network request failed',
  },

  // ── 이미 다른 방식으로 가입된 계정 ────────────────────────────────────
  'auth/account-exists-with-different-credential': {
    userMessage: '이미 다른 방식으로 가입된 계정입니다.',
    devLog: 'Firebase Auth: account exists with different credential',
  },

  // ── 유효하지 않은 인증 정보 ────────────────────────────────────────────
  'auth/invalid-credential': {
    userMessage: '인증 정보가 유효하지 않습니다. 다시 시도해주세요.',
    devLog: 'Firebase Auth: invalid credential',
  },

  // ── Firestore 서비스 불가 ──────────────────────────────────────────────
  'unavailable': {
    userMessage: '서버에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    devLog: 'Firestore: service unavailable',
  },

  // ── 기본 폴백 ─────────────────────────────────────────────────────────
  'unknown': {
    userMessage: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    devLog: 'Unknown error occurred',
  },
};

/**
 * Firebase 에러 코드로 사용자 메시지와 개발자 로그를 반환
 *
 * @param code - e.code 형태의 Firebase 에러 코드 (예: 'auth/network-request-failed')
 */
export function getAuthError(code?: string): AuthErrorResult {
  if (!code) return ERROR_MAP['unknown'];
  return ERROR_MAP[code] ?? ERROR_MAP['unknown'];
}
