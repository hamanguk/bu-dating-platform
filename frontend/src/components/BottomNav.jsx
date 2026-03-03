import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/chat',    icon: 'chat_bubble', label: '채팅' },
  { path: '/',        icon: 'home',        label: '홈' },
  { path: '/profile', icon: 'person',      label: '프로필' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

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
            className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-gray-400'}`}
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
