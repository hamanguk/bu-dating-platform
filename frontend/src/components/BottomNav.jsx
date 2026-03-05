import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTotalUnreadCount } from '../services/api';
import { getSocket } from '../services/socket';

const navItems = [
  { path: '/chat',    icon: 'chat_bubble', label: '채팅' },
  { path: '/',        icon: 'home',        label: '홈' },
  { path: '/profile', icon: 'person',      label: '프로필' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getTotalUnreadCount()
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => {});

    const socket = getSocket();
    if (socket) {
      const handleRoomUpdated = () => {
        getTotalUnreadCount()
          .then(({ data }) => setUnreadCount(data.unreadCount))
          .catch(() => {});
      };
      socket.on('room_updated', handleRoomUpdated);
      return () => { socket.off('room_updated', handleRoomUpdated); };
    }
  }, []);

  // 채팅 페이지 진입 시 뱃지 리셋
  useEffect(() => {
    if (pathname.startsWith('/chat')) {
      getTotalUnreadCount()
        .then(({ data }) => setUnreadCount(data.unreadCount))
        .catch(() => {});
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex h-20 w-full max-w-[480px] items-center justify-around bg-white/90 dark:bg-[#1a0b0d]/90 ios-blur border-t border-gray-100 dark:border-white/5 pb-5">
      {navItems.map(({ path, icon, label }) => {
        const active =
          path === '/'
            ? pathname === '/'
            : pathname === path || pathname.startsWith(path);

        return (
          <Link
            key={path}
            to={path}
            className={`relative flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-gray-400'}`}
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            {/* 채팅 unread 뱃지 */}
            {path === '/chat' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
