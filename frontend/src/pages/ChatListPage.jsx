import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRooms } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ChatListPage() {
  const { user } = useAuth();
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
      const other = room.participants?.find((p) => p._id !== user?._id);
      return other?.name || '상대방';
    }
    return '그룹 채팅';
  };

  const getRoomImage = (room) => {
    if (room.type === 'direct') {
      const other = room.participants?.find((p) => p._id !== user?._id);
      return other?.profileImage;
    }
    return null;
  };

  const imgUrl = (src) =>
    src?.startsWith('/uploads') ? `http://localhost:5000${src}` : src;

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 flex items-center bg-white/80 dark:bg-[#1a0b0d]/80 ios-blur px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <h1 className="text-xl font-bold dark:text-white">채팅</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <span className="material-symbols-outlined text-gray-300 text-6xl">chat_bubble</span>
          <p className="text-gray-400 text-sm">아직 채팅방이 없습니다.</p>
          <p className="text-gray-400 text-xs">게시물에서 채팅하기를 눌러 시작해보세요.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {rooms.map((room) => {
            const roomImg = getRoomImage(room);
            const lastMsg = room.lastMessage;
            return (
              <button
                key={room._id}
                onClick={() => navigate(`/chat/${room._id}`)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full bg-primary/10 bg-cover bg-center flex-shrink-0 flex items-center justify-center"
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
                    <p className="font-bold text-sm dark:text-white truncate">{getRoomName(room)}</p>
                    {lastMsg?.timestamp && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {new Date(lastMsg.timestamp).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  {lastMsg?.content && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.content}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
