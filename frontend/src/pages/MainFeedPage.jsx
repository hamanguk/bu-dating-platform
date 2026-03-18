import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { PostCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import PageTransition from '../components/PageTransition';

export default function MainFeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const fetchPosts = useCallback(async (pageNum = 1, postType = '') => {
    setLoading(true);
    try {
      const { data } = await getPosts({ type: postType, page: pageNum, limit: 10 });
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.pagination.totalPages);
    } catch (err) {
      console.error('fetchPosts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, type);
  }, [type, fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, type);
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 80 && window.scrollY === 0 && !refreshing) {
      setRefreshing(true);
      setPage(1);
      fetchPosts(1, type).finally(() => setRefreshing(false));
    }
  };

  return (
    <PageTransition>
      <div
        className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-40 flex items-center glass-light dark:glass-dark px-6 py-5 justify-between border-b border-white/30 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">shield_person</span>
            <h1 className="text-xl font-bold tracking-tight dark:text-white">캠퍼스 데이트</h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 coral-gradient text-white text-xs font-bold rounded-2xl shadow-sm"
              >
                관리자
              </button>
            )}
          </div>
        </div>

        {/* Pull-to-refresh 인디케이터 */}
        {refreshing && (
          <div className="flex justify-center py-3">
            <span className="material-symbols-outlined text-primary text-xl animate-spin">progress_activity</span>
          </div>
        )}

        {/* 배너 */}
        <div className="px-5 py-4">
          <div className="relative h-[140px] w-full overflow-hidden rounded-3xl bg-primary/10 flex items-center px-7">
            <div className="z-10 max-w-[70%]">
              <h2 className="text-lg font-bold leading-tight text-primary">백석대학교 인증 기반<br />안전한 소개팅 플랫폼</h2>
              <p className="text-xs mt-1 text-primary/80">백석대 메일 인증 완료 사용자만 이용 가능합니다.</p>
            </div>
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <span className="material-symbols-outlined text-[160px] text-primary">verified_user</span>
            </div>
          </div>
        </div>

        {/* 타입 필터 */}
        <div className="flex px-5 pb-4">
          <div className="flex h-14 w-full items-center justify-center rounded-2xl bg-gray-100/80 dark:bg-white/5 p-1.5">
            {[
              { value: '', label: '전체' },
              { value: 'one', label: '1:1 소개팅' },
              { value: 'group', label: '과팅' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${
                  type === value
                    ? 'bg-white dark:bg-[#2d161a] shadow-md text-primary'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 게시물 작성 버튼 */}
        <div className="px-5 pb-4">
          <button
            onClick={() => navigate('/create-post')}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
            <span>새 게시물 작성하기</span>
          </button>
        </div>

        {/* 게시물 목록 */}
        <div className="flex flex-col gap-7 px-5 pb-10">
          {loading && page === 1 ? (
            <div className="flex flex-col gap-6">
              {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon="edit_note"
              title="아직 게시물이 없습니다."
              subtitle="첫 번째 게시물을 작성해보세요!"
              actionLabel="게시물 작성하기"
              onAction={() => navigate('/create-post')}
            />
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="py-3 text-primary text-sm font-semibold text-center"
                >
                  {loading ? '불러오는 중...' : '더보기'}
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
