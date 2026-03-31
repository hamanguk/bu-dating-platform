// src/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps }   from '@react-navigation/bottom-tabs';

// ─── 루트 스택 파라미터 타입 ──────────────────────────────────────────────
export type RootStackParamList = {
  Login:        undefined;
  ProfileSetup: undefined;
  Main:         undefined;
  ChatRoom:     { matchId: string; otherUserName: string };
};

// ─── 메인 탭 파라미터 타입 ────────────────────────────────────────────────
export type MainTabParamList = {
  Home:    undefined;
  Explore: undefined;
  Chat:    undefined;
  Profile: undefined;
};

// ─── 각 스크린 Props 타입 헬퍼 ───────────────────────────────────────────
// 사용 예: function LoginScreen({ navigation, route }: LoginScreenProps)

export type LoginScreenProps      = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type ProfileSetupProps     = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

export type HomeScreenProps       = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type ExploreScreenProps    = BottomTabScreenProps<MainTabParamList, 'Explore'>;
export type ChatListScreenProps   = BottomTabScreenProps<MainTabParamList, 'Chat'>;
export type MyProfileScreenProps  = BottomTabScreenProps<MainTabParamList, 'Profile'>;
export type ChatRoomScreenProps   = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;
