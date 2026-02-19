import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

export default function ChatPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // 소켓 이벤트 등록
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_room', roomId);

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_typing', ({ name, isTyping }) => {
      if (isTyping) {
        setTypingUser(name);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.emit('leave_room', roomId);
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [roomId]);

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

  const imgUrl = (src) =>
    src?.startsWith('/uploads') ? `http://localhost:5000${src}` : src;

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 ios-blur border-b border-black/5 dark:border-white/5 pt-4 pb-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <span className="material-symbols-outlined text-2xl dark:text-white">chevron_left</span>
          </button>
          <p className="font-bold text-base dark:text-white">채팅</p>
        </div>
      </header>

      {/* 메시지 목록 */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'items-start gap-2'} max-w-[85%] ${isMe ? 'ml-auto' : ''}`}>
              {!isMe && (
                <div
                  className="size-8 rounded-full bg-primary/10 bg-cover bg-center flex-shrink-0 mt-1"
                  style={
                    msg.sender?.profileImage
                      ? { backgroundImage: `url(${imgUrl(msg.sender.profileImage)})` }
                      : {}
                  }
                />
              )}
              <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                {!isMe && (
                  <span className="text-[11px] font-semibold text-[#a14553] ml-1 mb-1">
                    {msg.sender?.name || ''}
                  </span>
                )}
                <div className="flex items-end gap-1.5">
                  {isMe && (
                    <span className="text-[9px] text-[#a14553]/50 mb-1 font-medium">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-white rounded-2xl rounded-tr-none shadow-md'
                        : 'bg-white dark:bg-[#2d1a1d] text-[#1d0c0f] dark:text-white rounded-2xl rounded-tl-none shadow-sm border border-black/5 dark:border-white/5'
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
      <footer className="bg-white dark:bg-[#1a0b0d] border-t border-black/5 dark:border-white/5 p-4 pb-8">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="w-full h-11 bg-background-light dark:bg-white/5 border-none rounded-full px-5 pr-12 text-sm focus:ring-2 focus:ring-primary/50 dark:text-white placeholder-[#a14553]/40 dark:placeholder-white/30"
            />
            <button
              onClick={handleSend}
              className="absolute right-1 top-1 size-9 flex items-center justify-center rounded-full bg-primary text-white shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
