// src/screens/main/ChatRoomScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuthStore } from '../../store/authStore';
import { useImagePicker } from '../../hooks/useImagePicker';
import {
  sendTextMessage,
  sendImageMessage,
  subscribeMessages,
  markMessageRead,
} from '../../services/chat';
import type { Message } from '../../types/models';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY = '#ff6b81';

export default function ChatRoomScreen({ navigation, route }: Props) {
  const { matchId, otherUserName } = route.params;
  const { currentUser } = useAuthStore();
  const myUid = currentUser?.uid ?? '';

  // ── 상태 ──────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const { pickImage, isPicking } = useImagePicker();

  // ── 실시간 메시지 구독 ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeMessages(matchId, (msgs) => {
      setMessages(msgs);

      // 수신 메시지 중 아직 내가 안 읽은 것들 → 읽음 처리
      msgs.forEach((msg) => {
        if (msg.id && msg.senderId !== myUid && !msg.readBy?.includes(myUid)) {
          markMessageRead(matchId, msg.id, myUid).catch(console.error);
        }
      });
    });

    return () => unsubscribe();
  }, [matchId, myUid]);

  // ── 새 메시지 도착 시 하단 스크롤 ─────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // ── 텍스트 메시지 전송 ────────────────────────────────────────────
  const handleSendText = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !myUid) return;

    setInputText('');
    try {
      await sendTextMessage(matchId, myUid, trimmed);
    } catch (e) {
      console.error('[ChatRoom] sendText error:', e);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
      setInputText(trimmed); // 롤백
    }
  }, [inputText, matchId, myUid]);

  // ── 이미지 메시지 전송 ────────────────────────────────────────────
  const handleSendImage = useCallback(async () => {
    if (isUploading || !myUid) return;

    const uri = await pickImage();
    if (!uri) return;

    setIsUploading(true);
    try {
      await sendImageMessage(matchId, myUid, uri);
    } catch (e) {
      console.error('[ChatRoom] sendImage error:', e);
      Alert.alert('오류', '이미지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, matchId, myUid, pickImage]);

  // ── 메시지 버블 렌더링 ────────────────────────────────────────────
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isMe = item.senderId === myUid;
      const isRead = item.readBy && item.readBy.length >= 2;

      return (
        <View
          style={[
            styles.bubbleRow,
            isMe ? styles.bubbleRowRight : styles.bubbleRowLeft,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isMe ? styles.bubbleMine : styles.bubbleTheirs,
            ]}
          >
            {item.type === 'image' && item.imageUrl ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPreviewImage(item.imageUrl)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.bubbleImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <Text
                style={[
                  styles.bubbleText,
                  isMe ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                ]}
              >
                {item.text}
              </Text>
            )}
          </View>

          {/* 읽음 표시 (내 메시지만) */}
          {isMe && (
            <Text style={styles.readIndicator}>
              {isRead ? '읽음' : ''}
            </Text>
          )}
        </View>
      );
    },
    [myUid],
  );

  // ── 전체 화면 이미지 프리뷰 모달 ─────────────────────────────────
  const renderImageModal = () => (
    <Modal
      visible={!!previewImage}
      transparent
      animationType="fade"
      onRequestClose={() => setPreviewImage(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setPreviewImage(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );

  const isBusy = isUploading || isPicking;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── 헤더 ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1d0c0f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {otherUserName}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* ── 메시지 리스트 ───────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* ── 업로드 중 인디케이터 ──────────────────────────────────── */}
        {isUploading && (
          <View style={styles.uploadingBar}>
            <ActivityIndicator size="small" color={PRIMARY} />
            <Text style={styles.uploadingText}>이미지 업로드 중…</Text>
          </View>
        )}

        {/* ── 입력 바 ──────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.imageBtn}
            onPress={handleSendImage}
            disabled={isBusy}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={isBusy ? '#c9a0ac' : PRIMARY}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요…"
            placeholderTextColor="#c9a0ac"
            multiline
            maxLength={500}
            editable={!isUploading}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isBusy) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendText}
            disabled={!inputText.trim() || isBusy}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderImageModal()}
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fcf8f8' },
  flex1: { flex: 1 },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6e8',
  },
  backBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1d0c0f',
    textAlign: 'center',
  },
  headerPlaceholder: { width: 40 },

  // 메시지 리스트
  messageList: { paddingHorizontal: 12, paddingVertical: 16 },

  // 버블 공통
  bubbleRow: { marginBottom: 8 },
  bubbleRowRight: { alignItems: 'flex-end' },
  bubbleRowLeft: { alignItems: 'flex-start' },

  bubble: {
    maxWidth: SCREEN_WIDTH * 0.72,
    borderRadius: 18,
    overflow: 'hidden',
  },
  bubbleMine: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#eacdd1',
  },

  // 텍스트 버블
  bubbleText: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: { color: '#ffffff' },
  bubbleTextTheirs: { color: '#1d0c0f' },

  // 이미지 버블
  bubbleImage: {
    width: 200,
    height: 200,
    borderRadius: 14,
  },

  // 읽음 표시
  readIndicator: {
    fontSize: 11,
    color: '#a14553',
    marginTop: 2,
    marginHorizontal: 4,
  },

  // 업로드 중 바
  uploadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff0f3',
  },
  uploadingText: { fontSize: 13, color: '#a14553' },

  // 입력 바
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0e6e8',
    gap: 8,
  },
  imageBtn: { padding: 8 },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eacdd1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1d0c0f',
    backgroundColor: '#fcf8f8',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },

  // 전체화면 이미지 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});
