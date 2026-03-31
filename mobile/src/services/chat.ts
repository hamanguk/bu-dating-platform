// src/services/chat.ts
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, type Message } from '../types/models';
import { compressImage } from '../utils/imageCompress';
import { uploadChatImage } from './storage';

// ─── 헬퍼: messages 서브컬렉션 ref ──────────────────────────────────────────
function messagesRef(matchId: string) {
  return collection(db, COLLECTIONS.MATCHES, matchId, COLLECTIONS.MESSAGES);
}

function matchDocRef(matchId: string) {
  return doc(db, COLLECTIONS.MATCHES, matchId);
}

// ─── 텍스트 메시지 전송 ─────────────────────────────────────────────────────

export async function sendTextMessage(
  matchId: string,
  senderId: string,
  text: string,
): Promise<void> {
  const msgData = {
    senderId,
    text,
    imageUrl: null,
    type: 'text' as const,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  };

  await addDoc(messagesRef(matchId), msgData);

  // matches 문서 lastMessage 갱신
  await updateDoc(matchDocRef(matchId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
}

// ─── 이미지 메시지 전송 ─────────────────────────────────────────────────────
// 이미지 선택 URI → 압축 → Storage 업로드 → Firestore 메시지 생성까지 일괄 처리

export async function sendImageMessage(
  matchId: string,
  senderId: string,
  rawImageUri: string,
): Promise<void> {
  // ① 이미지 압축
  const compressedUri = await compressImage(rawImageUri);

  // ② Firebase Storage 업로드
  const downloadUrl = await uploadChatImage(compressedUri, matchId, senderId);

  // ③ Firestore 메시지 생성
  const msgData = {
    senderId,
    text: null,
    imageUrl: downloadUrl,
    type: 'image' as const,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  };

  await addDoc(messagesRef(matchId), msgData);

  // ④ matches 문서 lastMessage 갱신
  await updateDoc(matchDocRef(matchId), {
    lastMessage: '[사진]',
    lastMessageAt: serverTimestamp(),
  });
}

// ─── 실시간 메시지 구독 ─────────────────────────────────────────────────────

export function subscribeMessages(
  matchId: string,
  onMessages: (messages: Message[]) => void,
): Unsubscribe {
  const q = query(messagesRef(matchId), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Message[];
    onMessages(messages);
  });
}

// ─── 읽음 처리 ──────────────────────────────────────────────────────────────

export async function markMessageRead(
  matchId: string,
  messageId: string,
  uid: string,
): Promise<void> {
  const msgDoc = doc(db, COLLECTIONS.MATCHES, matchId, COLLECTIONS.MESSAGES, messageId);
  await updateDoc(msgDoc, { readBy: arrayUnion(uid) });
}
