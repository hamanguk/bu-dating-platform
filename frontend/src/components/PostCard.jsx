import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike } from '../services/api';

export default function PostCard({ post, onLikeToggle }) {
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
      onLikeToggle?.(post._id, data);
    } catch {
      /* silent */
    } finally {
      setLikeLoading(false);
    }
  };

  const coverImage = post.images?.[0];

  return (
    <Link to={`/posts/${post._id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#2d161a] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">
        {/* 커버 이미지 */}
        {coverImage ? (
          <div
            className="relative aspect-[4/5] w-full bg-center bg-cover"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%), url(${coverImage})`,
            }}
          >
            <div className="absolute top-4 left-4 flex gap-2">
              {post.type === 'group' && (
                <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">group</span>
                  {post.participantsCount}:{post.participantsCount} 과팅
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="relative aspect-[4/5] w-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-6xl opacity-30">
              {post.type === 'group' ? 'group' : 'person'}
            </span>
            <div className="absolute top-4 left-4 flex gap-2">
              {post.type === 'group' && (
                <span className="bg-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">group</span>
                  {post.participantsCount}:{post.participantsCount} 과팅
                </span>
              )}
            </div>
          </div>
        )}

        {/* 내용 */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold dark:text-white">{post.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {post.isAnonymous ? '익명' : post.author?.name} • {post.author?.department || ''}
              </p>
            </div>
            <button
              onClick={handleLike}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                isLiked
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined text-[28px]"
                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>
          </div>

          {post.description && (
            <p className="mt-3 text-sm line-clamp-2 text-gray-600 dark:text-gray-300">
              "{post.description}"
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">favorite</span>
              {likeCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
