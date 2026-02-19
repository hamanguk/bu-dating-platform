import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';

export default function MainFeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 flex items-center bg-white/80 dark:bg-[#1a0b0d]/80 ios-blur px-6 py-4 justify-between border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">shield_person</span>
          <h1 className="text-xl font-bold tracking-tight dark:text-white">캠퍼스 데이트</h1>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full"
            >
              관리자
            </button>
          )}
        </div>
      </div>

      {/* 배너 */}
      <div className="px-4 py-3">
        <div className="relative h-[130px] w-full overflow-hidden rounded-xl bg-primary/10 flex items-center px-6">
          <div className="z-10 max-w-[70%]">
            <h2 className="text-lg font-bold leading-tight text-primary">학교 인증 기반<br />안전한 소개팅 플랫폼</h2>
            <p className="text-xs mt-1 text-primary/80">학생 메일 인증 완료 대학생만 이용 가능합니다.</p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <span className="material-symbols-outlined text-[160px] text-primary">verified_user</span>
          </div>
        </div>
      </div>

      {/* 타입 필터 */}
      <div className="flex px-4 pb-2">
        <div className="flex h-12 w-full items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 p-1.5">
          {[
            { value: '', label: '전체' },
            { value: 'one', label: '1:1 소개팅' },
            { value: 'group', label: '과팅' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex-1 h-full rounded-full text-sm font-semibold transition-all ${
                type === value
                  ? 'bg-white dark:bg-[#2d161a] shadow-sm text-primary'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className="flex flex-col gap-6 px-4 pb-8">
        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <span className="material-symbols-outlined text-gray-300 text-6xl">inbox</span>
            <p className="text-gray-400 text-sm">아직 게시물이 없습니다.</p>
            <button
              onClick={() => navigate('/create-post')}
              className="px-6 py-2 coral-gradient text-white text-sm font-bold rounded-full mt-2"
            >
              첫 게시물 작성하기
            </button>
          </div>
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
  );
}
