// src/services/storage.ts
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * 채팅 이미지를 Firebase Storage에 업로드하고 다운로드 URL을 반환
 *
 * 저장 경로: chatImages/{matchId}/{timestamp}_{uid}.jpg
 *
 * @param localUri  압축된 이미지의 로컬 file:// URI
 * @param matchId   매칭 문서 ID
 * @param uid       발신자 Firebase Auth UID
 * @returns         Storage 다운로드 URL
 */
export async function uploadChatImage(
  localUri: string,
  matchId: string,
  uid: string,
): Promise<string> {
  // ── blob 변환 ──────────────────────────────────────────────────────
  const response = await fetch(localUri);
  const blob = await response.blob();

  // ── Storage 경로 생성 ──────────────────────────────────────────────
  const timestamp = Date.now();
  const storagePath = `chatImages/${matchId}/${timestamp}_${uid}.jpg`;
  const storageRef = ref(storage, storagePath);

  // ── 업로드 ─────────────────────────────────────────────────────────
  const snapshot = await uploadBytesResumable(storageRef, blob, {
    contentType: 'image/jpeg',
  });

  // ── 다운로드 URL 반환 ──────────────────────────────────────────────
  const downloadUrl = await getDownloadURL(snapshot.ref);
  console.log('[uploadChatImage] uploaded:', storagePath);
  return downloadUrl;
}
