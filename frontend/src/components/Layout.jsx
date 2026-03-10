import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-[480px] mx-auto flex-col bg-white dark:bg-[#1a0b0d] shadow-2xl overflow-x-hidden">
      {/* 학교 인증 플랫폼 상단 배너 */}
      <div className="sticky top-0 z-50 glass-light dark:glass-dark border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">verified</span>
        <p className="text-[11px] text-primary font-bold">백석대 인증 소개팅 플랫폼</p>
      </div>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
