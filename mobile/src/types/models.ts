// src/types/models.ts
import type { Timestamp } from 'firebase/firestore';

// ─── users 컬렉션 ─────────────────────────────────────────────────────────
// 문서 ID: Firebase Auth uid 와 동일
export interface User {
  uid: string;
  email: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female' | 'other' | null;
  bio: string;
  profileImages: string[];     // Firebase Storage URL 배열
  createdAt: Timestamp | null; // serverTimestamp() 직후에는 null
  lastActive: Timestamp | null;
  isProfileComplete: boolean;
}

// ─── likes 컬렉션 ─────────────────────────────────────────────────────────
// 문서 ID: 자동 생성
export interface Like {
  id?: string;
  fromUid: string;
  toUid: string;
  createdAt: Timestamp;
}

// ─── matches 컬렉션 ───────────────────────────────────────────────────────
// 문서 ID: 자동 생성
export interface Match {
  id?: string;
  users: [string, string];       // 매칭된 두 사람의 uid
  createdAt: Timestamp;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
}

// ─── messages 서브컬렉션 ──────────────────────────────────────────────────
// 경로: matches/{matchId}/messages/{messageId}
export type MessageType = 'text' | 'image';

export interface Message {
  id?: string;
  senderId: string;
  text: string | null;           // 텍스트 메시지면 내용, 이미지면 null
  imageUrl: string | null;       // 이미지 메시지면 Storage URL, 텍스트면 null
  type: MessageType;             // "text" | "image"
  createdAt: Timestamp;
  readBy: string[];              // 읽은 사용자 uid 배열
}

// ─── Firestore 컬렉션 이름 상수 ───────────────────────────────────────────
// 문자열 오타 방지를 위해 상수로 관리
export const COLLECTIONS = {
  USERS: 'users',
  LIKES: 'likes',
  MATCHES: 'matches',
  MESSAGES: 'messages',
} as const;
