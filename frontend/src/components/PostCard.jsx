import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike } from '../services/api';

const MENU_ICONS = {
  korean: '🍚', chinese: '🥟', japanese: '🍣', western: '🍝',
  cafe: '☕', chicken: '🍗', pizza: '🍕', snack: '🍜',
  beer: '🍺', soju: '🍶', other: '🍽️',
};

const DRINK_CATEGORIES = ['beer', 'soju'];

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

  return (
    <Link to={`/posts/${post._id}`}>
      <div className={`overflow-hidden rounded-2xl bg-white dark:bg-[#2d1e14] shadow-sm border active:scale-[0.97] transition-all duration-150 ${
        showNeon
          ? 'border-purple-300 dark:border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
          : 'border-gray-100 dark:border-white/5'
      }`}>
        {/* 이미지 / 메뉴 아이콘 폴백 */}
        {coverImage ? (
          <div
            className="relative aspect-square w-full bg-center bg-cover"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%), url(${coverImage})`,
            }}
          >
            {/* 타입 뱃지 */}
            <div className="absolute top-2 left-2">
              <span className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                {menuIcon}
              </span>
            </div>
            {/* 하트 */}
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
            {/* 인원 뱃지 */}
            {post.participantsCount > 2 && (
              <div className="absolute bottom-2 right-2">
                <span className="bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white">
                  {post.participantsCount}명
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className={`relative aspect-square w-full bg-gradient-to-br ${bgGradient} dark:from-white/5 dark:to-white/10 flex items-center justify-center`}>
            <span className="text-5xl">{menuIcon}</span>
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${showNeon ? 'bg-purple-500/20 text-purple-600' : 'bg-primary/20 text-primary'}`}>
                {MEAL_TIME_LABEL[post.mealTime] || '밥약속'}
              </span>
            </div>
            <button
              onClick={handleLike}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/60 dark:bg-black/30"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>
            {post.participantsCount > 2 && (
              <div className="absolute bottom-2 right-2">
                <span className="bg-primary/20 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-primary">
                  {post.participantsCount}명
                </span>
              </div>
            )}
          </div>
        )}

        {/* 텍스트 */}
        <div className="p-2.5">
          <h3 className="text-sm font-bold dark:text-white truncate leading-tight">{post.title}</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {post.isAnonymous ? '익명' : post.author?.name} · {post.author?.department || ''}
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
      </div>
    </Link>
  );
}
