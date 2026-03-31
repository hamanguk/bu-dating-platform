// src/utils/imageCompress.ts
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const MAX_WIDTH = 1080;
const INITIAL_QUALITY = 0.7;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const MIN_QUALITY = 0.3;
const QUALITY_STEP = 0.1;

/**
 * 이미지를 1080px 이하 + 1MB 이하로 압축
 *
 * 1차 압축(quality 0.7) 후에도 1MB를 초과하면
 * quality를 0.1씩 내려가며 재압축 (최소 0.3까지)
 *
 * @returns 압축된 이미지 로컬 URI
 */
export async function compressImage(uri: string): Promise<string> {
  let quality = INITIAL_QUALITY;

  // ── 1차 압축 ───────────────────────────────────────────────────────
  let result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: quality, format: SaveFormat.JPEG },
  );

  // ── 파일 크기 확인 → 초과 시 재압축 ───────────────────────────────
  let info = await FileSystem.getInfoAsync(result.uri);
  while (
    info.exists &&
    'size' in info &&
    info.size > MAX_FILE_SIZE &&
    quality > MIN_QUALITY
  ) {
    quality = Math.max(quality - QUALITY_STEP, MIN_QUALITY);
    console.log(
      `[compressImage] ${(info.size / 1024 / 1024).toFixed(2)}MB > 1MB, retrying quality=${quality.toFixed(1)}`,
    );
    result = await manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: quality, format: SaveFormat.JPEG },
    );
    info = await FileSystem.getInfoAsync(result.uri);
  }

  if (info.exists && 'size' in info) {
    console.log(
      `[compressImage] final: ${(info.size / 1024 / 1024).toFixed(2)}MB, quality=${quality.toFixed(1)}`,
    );
  }

  return result.uri;
}
