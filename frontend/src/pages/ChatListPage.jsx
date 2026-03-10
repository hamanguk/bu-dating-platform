import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRooms } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ChatRoomSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import PageTransition from '../components/PageTransition';

export default function ChatListPage() {
  const { user } = useAuth();
  const myId = user?.id || user?._id;
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRooms()
      .then(({ data }) => setRooms(data))
      .finally(() => setLoading(false));
  }, []);

  const getRoomName = (room) => {
    if (room.name) return room.name;
    if (room.type === 'direct') {
      const other = room.participants?.find((p) => p._id !== myId);
      return other?.name || '상대방';
    }
    return '그룹 채팅';
  };

  const getRoomImage = (room) => {
    if (room.type === 'direct') {
      const other = room.participants?.find((p) => p._id !== myId);
      return other?.profileImage;
    }
    return null;
  };

  const imgUrl = (src) =>
    src?.startsWith('/uploads') ? `http://localhost:5000${src}` : src;

  return (
    <PageTransition>
      <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
        {/* 헤더 */}
        <div className="sticky top-0 z-40 flex items-center glass-light dark:glass-dark px-6 py-5 border-b border-white/30 dark:border-white/5">
          <h1 className="text-xl font-bold dark:text-white">채팅</h1>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {[...Array(5)].map((_, i) => <ChatRoomSkeleton key={i} />)}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon="chat_bubble"
            title="아직 채팅방이 없습니다."
            subtitle="게시물에서 채팅하기를 눌러 시작해보세요."
            actionLabel="게시물 둘러보기"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {rooms.map((room) => {
              const roomImg = getRoomImage(room);
              const lastMsg = room.lastMessage;
              const unread = room.unreadCount || 0;
              return (
                <button
                  key={room._id}
                  onClick={() => navigate(`/chat/${room._id}`)}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-14 h-14 rounded-2xl bg-primary/10 bg-cover bg-center flex-shrink-0 flex items-center justify-center"
                    style={roomImg ? { backgroundImage: `url(${imgUrl(roomImg)})` } : {}}
                  >
                    {!roomImg && (
                      <span className="material-symbols-outlined text-primary">
                        {room.type === 'group' ? 'group' : 'person'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-bold text-sm truncate ${unread > 0 ? 'dark:text-white text-gray-900' : 'dark:text-white'}`}>
                        {getRoomName(room)}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {lastMsg?.timestamp && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(lastMsg.timestamp).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      {lastMsg?.content ? (
                        <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500'}`}>
                          {lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">메시지가 없습니다.</p>
                      )}
                      {unread > 0 && (
                        <span className="min-w-[20px] h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 flex-shrink-0 ml-2">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
