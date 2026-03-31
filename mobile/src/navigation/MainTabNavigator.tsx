// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen      from '../screens/main/HomeScreen';
import ExploreScreen   from '../screens/main/ExploreScreen';
import ChatListScreen  from '../screens/main/ChatListScreen';
import MyProfileScreen from '../screens/main/MyProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const PRIMARY  = '#ff6b81';
const INACTIVE = '#a14553';

// 탭 이름 → (활성 아이콘, 비활성 아이콘, 한국어 레이블) 매핑
const TAB_CONFIG: Record<
  keyof MainTabParamList,
  { active: string; outline: string; label: string }
> = {
  Home:    { active: 'home',         outline: 'home-outline',         label: '홈'    },
  Explore: { active: 'heart',        outline: 'heart-outline',        label: '탐색'  },
  Chat:    { active: 'chatbubbles',  outline: 'chatbubbles-outline',  label: '채팅'  },
  Profile: { active: 'person',       outline: 'person-outline',       label: '프로필' },
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name as keyof MainTabParamList];
        return {
          headerShown:          false,
          tabBarActiveTintColor:   PRIMARY,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle:          styles.tabBar,
          tabBarLabelStyle:     styles.tabLabel,
          tabBarLabel:          cfg.label,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={(focused ? cfg.active : cfg.outline) as any}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          // 읽지 않은 채팅 수 → 나중에 실제 카운트로 교체
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  'rgba(255, 255, 255, 0.96)',
    borderTopColor:   '#eacdd1',
    borderTopWidth:   1,
    height:           Platform.OS === 'ios' ? 84 : 64,
    paddingBottom:    Platform.OS === 'ios' ? 28 : 8,
    paddingTop:       8,
  },
  tabLabel: {
    fontSize:   10,
    fontWeight: '700',
  },
});
