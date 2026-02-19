import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-[480px] mx-auto flex-col bg-white dark:bg-[#1a0b0d] shadow-2xl overflow-x-hidden">
      {/* 학교 인증 플랫폼 상단 배너 */}
      <div className="sticky top-0 z-50 bg-primary/5 border-b border-primary/10 px-4 py-1.5 flex items-center justify-center gap-1.5">
        <span className="material-symbols-outlined text-primary text-sm">shield_person</span>
        <p className="text-[11px] text-primary font-semibold">학교 인증된 소개팅 플랫폼입니다</p>
      </div>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
