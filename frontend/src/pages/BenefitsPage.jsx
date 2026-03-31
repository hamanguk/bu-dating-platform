import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, toggleEventLike } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

const EVENT_TYPE_LABEL = {
  discount: { label: '할인', icon: 'percent', color: 'bg-red-100 text-red-600' },
  event: { label: '이벤트', icon: 'celebration', color: 'bg-purple-100 text-purple-600' },
  new_menu: { label: '신메뉴', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' },
  notice: { label: '공지', icon: 'campaign', color: 'bg-blue-100 text-blue-600' },
};

export default function BenefitsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(({ data }) => setEvents(data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (eventId) => {
    try {
      const { data } = await toggleEventLike(eventId);
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId ? { ...ev, likeCount: data.likeCount, isLiked: data.isLiked } : ev
        )
      );
    } catch { /* silent */ }
  };

  const daysLeft = (endDate) => {
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-28">
        {/* 헤더 */}
        <div className="sticky top-0 z-40 flex items-center px-6 py-5 justify-between glass-light dark:glass-dark border-b border-white/30 dark:border-white/5">
          <h1 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_offer</span>
            주변 혜택
          </h1>
          {user?.accountType === 'business' && (
            <button
              onClick={() => navigate('/create-event')}
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-2xl"
            >
              이벤트 등록
            </button>
          )}
        </div>

        {/* 이벤트 목록 */}
        <div className="px-5 pt-5 space-y-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-[140px] rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
            ))
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-gray-300">storefront</span>
              <p className="text-sm text-gray-400 mt-3 font-medium">아직 등록된 혜택이 없습니다</p>
              <p className="text-xs text-gray-300 mt-1">주변 식당/카페의 할인 이벤트가 곧 올라올 거예요!</p>
            </div>
          ) : (
            events.map((ev) => {
              const typeInfo = EVENT_TYPE_LABEL[ev.eventType] || EVENT_TYPE_LABEL.event;
              const remaining = daysLeft(ev.endDate);
              return (
                <div
                  key={ev._id}
                  className="bg-white dark:bg-[#2d1e14] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5"
                >
                  {/* 이미지 */}
                  {ev.images?.[0] && (
                    <div
                      className="h-40 bg-center bg-cover"
                      style={{ backgroundImage: `url(${ev.images[0]})` }}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeInfo.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{typeInfo.icon}</span>
                        {typeInfo.label}
                      </span>
                      {remaining <= 3 && remaining > 0 && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-full">
                          D-{remaining}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold dark:text-white">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ev.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        {ev.author?.businessInfo?.businessName && (
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">storefront</span>
                            {ev.author.businessInfo.businessName}
                          </span>
                        )}
                        <span>
                          ~{new Date(ev.endDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleLike(ev._id)}
                        className="flex items-center gap-1 text-xs text-gray-400"
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] ${ev.isLiked ? 'text-red-500' : ''}`}
                          style={ev.isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </span>
                        {ev.likeCount > 0 && <span>{ev.likeCount}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
