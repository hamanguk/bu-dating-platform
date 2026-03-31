// App.tsx — 앱 진입점
// react-native-gesture-handler 는 반드시 최상단 첫 줄에서 import
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { NavigationContainer }      from '@react-navigation/native';
import { GestureHandlerRootView }   from 'react-native-gesture-handler';
import { SafeAreaProvider }         from 'react-native-safe-area-context';
import { StatusBar }                from 'expo-status-bar';

import RootNavigator          from './src/navigation/RootNavigator';
import { initAuthListener }   from './src/store/authStore';

export default function App() {
  useEffect(() => {
    // Firebase onAuthStateChanged 구독 시작
    // 반환된 unsubscribe 함수로 컴포넌트 언마운트 시 리스너 해제
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  return (
    // GestureHandlerRootView: react-native-gesture-handler 필수 래퍼
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
