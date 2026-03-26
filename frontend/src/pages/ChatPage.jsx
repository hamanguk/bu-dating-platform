import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages, leaveRoom } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

export default function ChatPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const myId = user?.id || user?._id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // 소켓 이벤트 등록
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_room', roomId);

    // 입장 시 읽음 처리
    socket.emit('read_messages', { roomId });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      // 내가 보낸 메시지가 아니면 읽음 처리
      const senderId = msg.sender?._id || msg.sender;
      if (senderId !== myId) {
        socket.emit('read_messages', { roomId });
      }
    });

    socket.on('user_typing', ({ name, isTyping }) => {
      setTypingUser(isTyping ? name : null);
    });

    // 상대방이 메시지를 읽었을 때 → readBy 업데이트
    socket.on('messages_read', ({ userId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const senderId = msg.sender?._id || msg.sender;
          if (senderId === myId && !msg.readBy?.includes(userId)) {
            return { ...msg, readBy: [...(msg.readBy || []), userId] };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.emit('leave_room', roomId);
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('messages_read');
    };
  }, [roomId, myId]);

  // 초기 메시지 로드
  useEffect(() => {
    getMessages(roomId).then(({ data }) => setMessages(data));
  }, [roomId]);

  // 스크롤 하단 고정
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('send_message', { roomId, content: input.trim() });
    setInput('');
  }, [input, roomId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing', { roomId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { roomId, isTyping: false });
    }, 1500);
  };


  const handleLeaveRoom = async () => {
    setLeaving(true);
    try {
      await leaveRoom(roomId);
      navigate('/chat', { replace: true });
    } catch {
      alert('채팅방 나가기에 실패했습니다.');
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full glass-light dark:glass-dark border-b border-white/30 dark:border-white/5 pt-5 pb-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <span className="material-symbols-outlined text-2xl dark:text-white">chevron_left</span>
          </button>
          <p className="font-bold text-base dark:text-white">채팅</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu((v) => !v)} className="p-1">
            <span className="material-symbols-outlined text-2xl dark:text-white">more_vert</span>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-[#2d1a1d] rounded-xl shadow-xl border border-black/10 dark:border-white/10 min-w-[160px] overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); setShowLeaveModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  채팅방 나가기
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 나가기 확인 모달 */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowLeaveModal(false)}>
          <div className="bg-white dark:bg-[#2d1a1d] rounded-2xl p-6 mx-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold dark:text-white mb-2">채팅방 나가기</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              방을 나가면 대화 내용이 모두 삭제됩니다.<br />정말 나가시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleLeaveRoom}
                disabled={leaving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white disabled:opacity-50"
              >
                {leaving ? '나가는 중...' : '나가기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === myId || msg.sender === myId;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'items-start gap-2'} max-w-[85%] ${isMe ? 'ml-auto' : ''}`}>
              {!isMe && (
                <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[14px]">person</span>
                </div>
              )}
              <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                {!isMe && (
                  <span className="text-[11px] font-semibold text-[#a14553] ml-1 mb-1">
                    {msg.sender?.nickname || '익명'}
                  </span>
                )}
                <div className="flex items-end gap-1.5">
                  {isMe && (
                    <div className="flex flex-col items-end gap-0.5 mb-1">
                      <span className="material-symbols-outlined text-[14px]" style={{ color: (msg.readBy?.length || 0) > 1 ? '#ff6b81' : '#a1455380' }}>
                        {(msg.readBy?.length || 0) > 1 ? 'done_all' : 'done'}
                      </span>
                      <span className="text-[9px] text-[#a14553]/50 font-medium">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-5 py-3 text-sm leading-relaxed ${
                      isMe
                        ? 'coral-gradient text-white rounded-3xl rounded-tr-sm shadow-md'
                        : 'bg-white dark:bg-[#2d1a1d] text-[#1d0c0f] dark:text-white rounded-3xl rounded-tl-sm shadow-sm border border-black/5 dark:border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {!isMe && (
                    <span className="text-[9px] text-[#a14553]/50 mb-1 font-medium">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 타이핑 표시 */}
        {typingUser && (
          <div className="flex items-center gap-2 opacity-70">
            <div className="bg-white dark:bg-[#2d1a1d] px-3 py-2 rounded-full flex gap-1 items-center">
              <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* 입력창 */}
      <footer className="glass-light dark:glass-dark border-t border-white/30 dark:border-white/5 p-4 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="w-full h-12 bg-gray-100/80 dark:bg-white/5 border-none rounded-2xl px-5 pr-14 text-sm focus:ring-2 focus:ring-primary/50 dark:text-white placeholder-[#a14553]/40 dark:placeholder-white/30"
            />
            <button
              onClick={handleSend}
              className="absolute right-1.5 top-1.5 size-9 flex items-center justify-center rounded-xl coral-gradient text-white shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
