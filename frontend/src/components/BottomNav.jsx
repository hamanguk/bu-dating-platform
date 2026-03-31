import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTotalUnreadCount } from '../services/api';
import { getSocket } from '../services/socket';

const navItems = [
  { path: '/match',     icon: 'handshake',    label: '매칭' },
  { path: '/benefits',  icon: 'local_offer',  label: '혜택' },
  { path: '/',          icon: 'home',         label: '홈', center: true },
  { path: '/chat',      icon: 'chat_bubble',  label: '채팅' },
  { path: '/profile',   icon: 'person',       label: '내정보' },
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

  useEffect(() => {
    if (pathname.startsWith('/chat')) {
      getTotalUnreadCount()
        .then(({ data }) => setUnreadCount(data.unreadCount))
        .catch(() => {});
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex h-22 w-full max-w-[480px] items-center justify-between px-6 glass-light dark:glass-dark border-t border-white/20 dark:border-white/5 pb-6 pt-2 rounded-t-3xl shadow-nav">
      {navItems.map(({ path, icon, label, center }) => {
        const active =
          path === '/'
            ? pathname === '/'
            : pathname === path || pathname.startsWith(path);

        if (center) {
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-0.5 -mt-5"
            >
              <span
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-br from-primary to-accent text-white scale-105'
                    : 'bg-white dark:bg-[#2d1e14] text-primary border-2 border-primary/20'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {icon}
                </span>
              </span>
              <span className={`text-[10px] font-bold ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={path}
            to={path}
            className={`relative flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-gray-400'}`}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-all duration-200 ${active ? 'scale-110' : ''}`}
              style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
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
