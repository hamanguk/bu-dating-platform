import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

export default function MatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matchUsers, setMatchUsers] = useState([]);
  const [matchContext, setMatchContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches()
      .then(({ data }) => {
        setMatchUsers(data.users);
        setMatchContext(data.context);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-28">
        {/* 헤더 */}
        <div className="sticky top-0 z-40 flex items-center px-6 py-5 justify-between glass-light dark:glass-dark border-b border-white/30 dark:border-white/5">
          <h1 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">handshake</span>
            공강 매칭
          </h1>
          {matchContext?.isDrinkTime && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-bold rounded-full">
              🍺 술 한잔?
            </span>
          )}
        </div>

        {/* 안내 배너 */}
        <div className="px-5 pt-5">
          <div className="relative h-[120px] w-full overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 flex items-center px-7">
            <div className="z-10">
              <h2 className="text-lg font-bold leading-tight text-primary">
                지금 공강인 친구를<br />찾아보세요
              </h2>
              <p className="text-xs mt-1 text-primary/80">
                {matchContext?.isWeekday ? '시간표 기반 매칭' : '주말에는 모두 공강!'}
              </p>
            </div>
            <div className="absolute right-[-10px] top-[-10px] opacity-10">
              <span className="material-symbols-outlined text-[140px] text-primary">schedule</span>
            </div>
          </div>
        </div>

        {/* 매칭 결과 */}
        <div className="px-5 pt-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[180px] rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : matchUsers.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-gray-300">person_search</span>
              <p className="text-sm text-gray-400 mt-3 font-medium">지금 공강인 친구가 없어요</p>
              <p className="text-xs text-gray-300 mt-1">프로필에서 시간표를 설정해보세요!</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full"
              >
                시간표 설정하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {matchUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => navigate(`/users/${u._id}`)}
                  className="bg-white dark:bg-[#2d1e14] rounded-2xl p-4 shadow-card border border-gray-100/60 dark:border-white/5 hover:shadow-card-hover transition-all text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-3 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">person</span>
                  </div>
                  <p className="text-sm font-bold dark:text-white truncate text-center">{u.nickname || '익명'}</p>
                  <p className="text-[11px] text-gray-400 truncate text-center mt-0.5">
                    {[u.mbti, u.gender === 'male' ? '남' : u.gender === 'female' ? '여' : ''].filter(Boolean).join(' / ') || '프로필 미설정'}
                  </p>
                  {u.foodOverlap > 0 && (
                    <span className="block mt-2 mx-auto w-fit px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold rounded-full">
                      메뉴 {u.foodOverlap}개 겹침
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
