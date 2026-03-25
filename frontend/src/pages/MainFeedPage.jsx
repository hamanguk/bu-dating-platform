import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts, getMatches } from '../services/api';
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

  // 공강 매칭 유저
  const [matchUsers, setMatchUsers] = useState([]);
  const [matchContext, setMatchContext] = useState(null);
  const [matchLoading, setMatchLoading] = useState(true);

  useEffect(() => {
    getMatches()
      .then(({ data }) => {
        setMatchUsers(data.users);
        setMatchContext(data.context);
      })
      .catch(() => {})
      .finally(() => setMatchLoading(false));
  }, []);

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
      Promise.all([
        fetchPosts(1, type),
        getMatches().then(({ data }) => { setMatchUsers(data.users); setMatchContext(data.context); }).catch(() => {}),
      ]).finally(() => setRefreshing(false));
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
            <span className="material-symbols-outlined text-primary text-[28px]">restaurant</span>
            <h1 className="text-xl font-bold tracking-tight dark:text-white">혼밥친구</h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-2xl shadow-sm"
              >
                관리자
              </button>
            )}
          </div>
        </div>

        {/* Pull-to-refresh */}
        {refreshing && (
          <div className="flex justify-center py-3">
            <span className="material-symbols-outlined text-primary text-xl animate-spin">progress_activity</span>
          </div>
        )}

        {/* 배너 */}
        <div className="px-5 py-4">
          <div className="relative h-[140px] w-full overflow-hidden rounded-3xl bg-primary/10 flex items-center px-7">
            <div className="z-10 max-w-[70%]">
              <h2 className="text-lg font-bold leading-tight text-primary">
                백석대 공강 시간에<br />같이 밥 먹을 친구 찾기
              </h2>
              <p className="text-xs mt-1 text-primary/80">학교 메일 인증 완료 사용자만 이용 가능</p>
            </div>
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <span className="material-symbols-outlined text-[160px] text-primary">restaurant</span>
            </div>
          </div>
        </div>

        {/* 지금 공강인 친구 슬라이더 */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold dark:text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
              지금 공강인 친구
              {matchContext?.isDrinkTime && (
                <span className="ml-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-[10px] font-bold rounded-full">
                  🍺 술 한잔?
                </span>
              )}
            </h3>
            {!matchContext?.isWeekday && (
              <span className="text-[10px] text-gray-400">주말에는 모두 공강!</span>
            )}
          </div>
          {matchLoading ? (
            <div className="flex gap-3 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-[140px] h-[160px] rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse flex-shrink-0" />
              ))}
            </div>
          ) : matchUsers.length === 0 ? (
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-400">지금 공강인 친구가 없어요</p>
              <p className="text-[10px] text-gray-300 mt-1">프로필에서 시간표를 설정해보세요!</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {matchUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => navigate(`/users/${u._id}`)}
                  className="flex-shrink-0 w-[140px] bg-white dark:bg-[#2d1e14] rounded-2xl p-3 shadow-card border border-gray-100/60 dark:border-white/5 hover:shadow-card-hover transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-primary/10 bg-cover bg-center mx-auto mb-2"
                    style={u.profileImage ? { backgroundImage: `url(${u.profileImage})` } : {}}
                  >
                    {!u.profileImage && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">person</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold dark:text-white truncate text-center">{u.name}</p>
                  <p className="text-[10px] text-gray-400 truncate text-center">{u.department}</p>
                  {u.mbti && (
                    <span className="block mt-1 mx-auto w-fit px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full">
                      {u.mbti}
                    </span>
                  )}
                  {u.foodOverlap > 0 && (
                    <span className="block mt-1 mx-auto w-fit px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 text-[9px] font-bold rounded-full">
                      메뉴 {u.foodOverlap}개 겹침
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 타입 필터 */}
        <div className="flex px-5 pb-4">
          <div className="flex h-14 w-full items-center justify-center rounded-2xl bg-gray-100/80 dark:bg-white/5 p-1.5">
            {[
              { value: '', label: '전체' },
              { value: 'meal', label: '밥 약속' },
              { value: 'drink', label: '술 한잔' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${
                  type === value
                    ? 'bg-white dark:bg-[#2d1e14] shadow-md text-primary'
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
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-accent text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,140,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
            <span>밥 약속 제안하기</span>
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
              icon="restaurant"
              title="아직 게시물이 없습니다."
              subtitle="첫 번째 밥 약속을 제안해보세요!"
              actionLabel="밥 약속 제안하기"
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
