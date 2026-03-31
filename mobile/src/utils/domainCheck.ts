// src/utils/domainCheck.ts

/** 허용할 학교 이메일 도메인 */
const ALLOWED_DOMAIN = 'bu.ac.kr';

/**
 * 이메일이 학교 도메인(@bu.ac.kr)인지 검사
 *
 * @param email - Firebase currentUser.email 값
 * @returns 허용 도메인이면 true, 아니면 false
 *
 * @example
 *   isValidSchoolEmail('student@bu.ac.kr')  // → true
 *   isValidSchoolEmail('user@gmail.com')     // → false
 *   isValidSchoolEmail(null)                 // → false
 */
export function isValidSchoolEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

/** UI 표시용 도메인 문자열 */
export const SCHOOL_EMAIL_DOMAIN = `@${ALLOWED_DOMAIN}`;
