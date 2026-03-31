// src/hooks/useImagePicker.ts
import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface UseImagePickerResult {
  pickImage: () => Promise<string | null>;
  isPicking: boolean;
}

/**
 * 갤러리에서 이미지를 선택하는 훅
 * - Media Library 권한 요청 → 거부 시 설정으로 안내
 * - 단일 이미지 선택, JPEG 포맷
 */
export function useImagePicker(): UseImagePickerResult {
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = async (): Promise<string | null> => {
    setIsPicking(true);
    try {
      // ── 권한 요청 ──────────────────────────────────────────────────
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '이미지를 전송하려면 사진 접근 권한이 필요합니다.\n설정에서 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정 열기', onPress: () => Linking.openSettings() },
          ],
        );
        return null;
      }

      // ── 이미지 선택 ────────────────────────────────────────────────
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1, // 원본 품질로 가져온 뒤 별도 압축
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return null;
      }

      return result.assets[0].uri;
    } catch (e) {
      console.error('[useImagePicker] error:', e);
      Alert.alert('오류', '이미지를 불러오는 중 문제가 발생했습니다.');
      return null;
    } finally {
      setIsPicking(false);
    }
  };

  return { pickImage, isPicking };
}
