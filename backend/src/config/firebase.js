/**
 * Firebase Admin SDK 초기화
 *
 * 인증 흐름:
 * 1. 클라이언트: Firebase Auth로 Google OAuth 로그인 → ID 토큰 발급
 * 2. 클라이언트: ID 토큰을 서버 /api/auth/google 로 전송
 * 3. 서버: Firebase Admin SDK로 ID 토큰 검증
 * 4. 서버: @bu.ac.kr 도메인 확인
 * 5. 서버: MongoDB에 사용자 저장/조회
 * 6. 서버: 자체 JWT 발급 (이후 모든 API 호출에 사용)
 */
const admin = require('firebase-admin');

let adminApp;

const getFirebaseAdmin = () => {
  if (!adminApp) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
  }
  return adminApp;
};

/**
 * Firebase ID 토큰 검증
 * @param {string} idToken - 클라이언트에서 전달된 Firebase ID 토큰
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseToken = async (idToken) => {
  const app = getFirebaseAdmin();
  const decodedToken = await admin.auth(app).verifyIdToken(idToken);
  return decodedToken;
};

module.exports = { getFirebaseAdmin, verifyFirebaseToken };
