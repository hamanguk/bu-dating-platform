// src/screens/main/ChatListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { COLLECTIONS, type Match, type User } from '../../types/models';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface ChatItem {
  matchId: string;
  otherUser: Pick<User, 'uid' | 'nickname' | 'profileImages'>;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: number;
}

export default function ChatListScreen() {
  const navigation = useNavigation<NavProp>();
  const { currentUser } = useAuthStore();
  const myUid = currentUser?.uid ?? '';

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── matches 실시간 구독 ─────────────────────────────────────────
  useEffect(() => {
    if (!myUid) return;

    const q = query(
      collection(db, COLLECTIONS.MATCHES),
      where('users', 'array-contains', myUid),
      orderBy('lastMessageAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: ChatItem[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as Match;
        const otherUid = data.users.find((u) => u !== myUid) ?? '';

        // 상대 유저 프로필 조회
        let otherUser: ChatItem['otherUser'] = {
          uid: otherUid,
          nickname: '알 수 없음',
          profileImages: [],
        };
        try {
          const userSnap = await getDoc(
            doc(db, COLLECTIONS.USERS, otherUid),
          );
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            otherUser = {
              uid: userData.uid,
              nickname: userData.nickname || '알 수 없음',
              profileImages: userData.profileImages,
            };
          }
        } catch (e) {
          console.error('[ChatList] user fetch error:', e);
        }

        items.push({
          matchId: docSnap.id,
          otherUser,
          lastMessage: data.lastMessage ?? '',
          lastMessageAt: data.lastMessageAt,
          unreadCount: 0, // 추후 unread count 로직 추가 가능
        });
      }

      setChats(items);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [myUid]);

  const handleOpenChat = (item: ChatItem) => {
    navigation.navigate('ChatRoom', {
      matchId: item.matchId,
      otherUserName: item.otherUser.nickname,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fcf8f8" />
        <View style={styles.header}>
          <Text style={styles.title}>채팅</Text>
        </View>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcf8f8" />

      <View style={styles.header}>
        <Text style={styles.title}>채팅</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={56} color="#eacdd1" />
          <Text style={styles.emptyText}>아직 매칭된 상대가 없습니다</Text>
          <Text style={styles.emptySub}>
            탐색 탭에서 마음에 드는 상대를 찾아보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.matchId}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatRow}
              activeOpacity={0.7}
              onPress={() => handleOpenChat(item)}
            >
              {/* 아바타 */}
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>😊</Text>
              </View>

              {/* 내용 */}
              <View style={styles.chatContent}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>
                    {item.otherUser.nickname}
                  </Text>
                </View>
                <View style={styles.chatBottomRow}>
                  <Text style={styles.chatLastMsg} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const PRIMARY = '#ff6b81';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcf8f8' },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#1d0c0f' },

  // 빈 상태
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: { fontSize: 16, color: '#a14553', fontWeight: '600' },
  emptySub: {
    fontSize: 13,
    color: '#c9a0ac',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // 채팅 목록
  separator: { height: 1, backgroundColor: '#f0e6e8', marginLeft: 76 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${PRIMARY}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 26 },
  chatContent: { flex: 1 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: { fontSize: 15, fontWeight: '700', color: '#1d0c0f' },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatLastMsg: { fontSize: 13, color: '#a14553', flex: 1 },
});
