// src/components/common/LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
}

/**
 * 전체화면 반투명 로딩 오버레이
 * visible=false 일 때는 렌더링하지 않아 성능 영향 없음
 */
export default function LoadingOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#ff6b81" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
