import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike } from '../services/api';

const MENU_ICONS = {
  korean: '🍚', chinese: '🥟', japanese: '🍣', western: '🍝',
  cafe: '☕', chicken: '🍗', pizza: '🍕', snack: '🍜',
  beer: '🍺', soju: '🍶', other: '🍽️',
};

const DRINK_CATEGORIES = ['beer', 'soju'];

// purpose별 테마
const PURPOSE_THEME = {
  meal:    { icon: '🍚', label: '식사',   gradient: 'from-orange-50 to-pink-50 dark:from-white/5 dark:to-white/10',    badge: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-500/20' },
  cafe:    { icon: '☕', label: '카페/차', gradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',  border: 'border-amber-200 dark:border-amber-500/20' },
  study:   { icon: '📚', label: '스터디', gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10',     badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',    border: 'border-blue-200 dark:border-blue-500/20' },
  carpool: { icon: '🚗', label: '카풀',   gradient: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10', badge: 'bg-green-100 text-green-600 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-500/20' },
};

const MEAL_TIME_LABEL = {
  breakfast: '아침', lunch: '점심', dinner: '저녁', late_night: '야식',
};

const MENU_BG = {
  korean: 'from-orange-100 to-amber-50',
  chinese: 'from-red-100 to-orange-50',
  japanese: 'from-rose-100 to-pink-50',
  western: 'from-yellow-100 to-amber-50',
  cafe: 'from-amber-100 to-yellow-50',
  chicken: 'from-orange-100 to-red-50',
  pizza: 'from-red-100 to-yellow-50',
  snack: 'from-pink-100 to-orange-50',
  beer: 'from-amber-100 to-yellow-50',
  soju: 'from-emerald-100 to-green-50',
  other: 'from-gray-100 to-gray-50',
};

export default function PostCard({ post }) {
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await toggleLike(post._id);
      setLikeCount(data.likeCount);
      setIsLiked(data.isLiked);
    } catch {
      /* silent */
    } finally {
      setLikeLoading(false);
    }
  };

  const coverImage = post.images?.[0];
  const categories = Array.isArray(post.menuCategory) ? post.menuCategory : [post.menuCategory];
  const menuIcon = categories.map((c) => MENU_ICONS[c] || '🍽️').join(' ');
  const bgGradient = MENU_BG[categories[0]] || MENU_BG.other;
  const isDrink = categories.some((c) => DRINK_CATEGORIES.includes(c));
  const isEvening = post.mealTime === 'dinner' || post.mealTime === 'late_night';
  const showNeon = isDrink && isEvening;
  const theme = PURPOSE_THEME[post.purpose] || PURPOSE_THEME.meal;

  return (
    <Link to={`/posts/${post._id}`}>
      <div className={`overflow-hidden rounded-2xl bg-white dark:bg-[#2d1e14] shadow-sm border active:scale-[0.97] transition-all duration-150 ${
        showNeon
          ? 'border-purple-300 dark:border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
          : 'border-gray-100 dark:border-white/5'
      }`}>
        {/* 이미지 / 메뉴 아이콘 폴백 */}
        {coverImage ? (
          <>
            {/* 사진 있는 카드 */}
            <div
              className="relative aspect-[4/3] w-full bg-center bg-cover"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%), url(${coverImage})`,
              }}
            >
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {post.purpose && post.purpose !== 'meal' && (
                  <span className={`backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${
                    { cafe: 'bg-amber-500/90', study: 'bg-blue-500/90', carpool: 'bg-green-500/90' }[post.purpose] || 'bg-black/40'
                  }`}>
                    {theme.icon} {theme.label}
                  </span>
                )}
                <span className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                  {menuIcon}
                </span>
                {post.timetableMatch && (
                  <span className="bg-green-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-0.5">
                    ⏰ 공강 일치!
                  </span>
                )}
              </div>
              <button
                onClick={handleLike}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${isLiked ? 'text-red-400' : 'text-white/80'}`}
                  style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  favorite
                </span>
              </button>
              {post.participantsCount > 2 && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white">
                    {post.participantsCount}명
                  </span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="text-sm font-bold dark:text-white truncate leading-tight">{post.title}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1">
                <span>{post.author?.nickname || '익명'}</span>
                {post.author?.mbti && <span className="text-[9px] text-primary/60">{post.author.mbti}</span>}
                <span className="inline-flex items-center gap-0.5 px-1.5 py-px bg-blue-100 dark:bg-blue-900/30 text-blue-500 text-[8px] font-bold rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-[9px]">verified</span>
                  인증
                </span>
              </p>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                <span>{MEAL_TIME_LABEL[post.mealTime] || ''} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                {likeCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">favorite</span>
                    {likeCount}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 사진 없는 카드 — 전체 그라데이션 + 제목/설명 중심 */}
            <div className={`relative p-4 min-h-[180px] bg-gradient-to-br ${showNeon ? 'from-purple-100 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20' : theme.gradient} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${showNeon ? 'bg-purple-500/20 text-purple-600' : theme.badge}`}>
                    {theme.icon} {MEAL_TIME_LABEL[post.mealTime] || theme.label} · {post.participantsCount}명
                  </span>
                  {post.timetableMatch && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center gap-0.5">
                      ⏰ 공강 일치!
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLike}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/60 dark:bg-black/20"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                    style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    favorite
                  </span>
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center py-2">
                <p className="text-lg font-extrabold text-gray-800 dark:text-white leading-snug">
                  {menuIcon} {post.title}
                </p>
                {post.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {post.author?.nickname || '익명'}
                </span>
                {post.author?.mbti && <span className="text-[9px] text-primary/60">{post.author.mbti}</span>}
                <span className="inline-flex items-center gap-0.5 px-1.5 py-px bg-blue-100 dark:bg-blue-900/30 text-blue-500 text-[8px] font-bold rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-[9px]">verified</span>
                  인증
                </span>
                <span className="ml-auto text-[10px] text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {likeCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <span className="material-symbols-outlined text-[11px]">favorite</span>
                    {likeCount}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
