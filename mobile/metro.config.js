// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ── 핵심 수정 ──────────────────────────────────────────────────────────────
// Expo SDK 54는 unstable_enablePackageExports: true 가 기본값이라
// package.json 의 "exports" 필드를 사용하면서 조건(conditions)으로
// ['require', 'default'] 만 체크한다.
// Firebase는 "exports" 에서 "react-native" 조건을 보고 RN 전용 빌드를 반환하는데
// 해당 조건이 없으면 "default"(브라우저 ESM2017)가 선택된다.
// 브라우저 빌드에는 registerAuth("ReactNative") 호출이 없어서
// "Component auth has not been registered yet" 에러가 발생한다.
//
// 해결: unstable_conditionNames 에 'react-native' 추가
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

// 상위 디렉토리(C:\Users\altld\node_modules)의 @firebase/auth(v1.12.0)가
// 프로젝트 내부 버전(v1.7.9)과 충돌하는 것도 명시적으로 차단
config.resolver.extraNodeModules = {
  '@firebase/auth': path.resolve(
    __dirname,
    'node_modules/firebase/node_modules/@firebase/auth'
  ),
};

module.exports = config;
