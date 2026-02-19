import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, deletePost, createOrGetRoom, createReport } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    getPost(id)
      .then(({ data }) => setPost(data))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChat = async () => {
    setChatLoading(true);
    try {
      const payload =
        post.type === 'group'
          ? { type: 'group', postId: post._id }
          : { type: 'direct', targetUserId: post.author._id };
      const { data } = await createOrGetRoom(payload);
      navigate(`/chat/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || '채팅방 생성 중 오류가 발생했습니다.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('게시물을 삭제하시겠습니까?')) return;
    await deletePost(post._id);
    navigate(-1);
  };

  const handleReport = async () => {
    if (!reportReason) return alert('신고 사유를 선택해주세요.');
    await createReport({ reportedUser: post.author._id, reportedPost: post._id, reason: reportReason });
    alert('신고가 접수되었습니다.');
    setReportOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!post) return null;

  const isOwner = post.isOwner || post.author?._id === user?._id;
  const imageUrl = (src) =>
    src?.startsWith('/uploads') ? `http://localhost:5000${src}` : src;

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-32">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 pb-2 justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold dark:text-white flex-1 text-center">게시물 상세</h2>
        <div className="flex gap-1">
          {isOwner ? (
            <button onClick={handleDelete} className="text-red-500 text-xs px-3 py-1 rounded-full border border-red-200">
              삭제
            </button>
          ) : (
            <button onClick={() => setReportOpen(true)} className="text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-200">
              신고
            </button>
          )}
        </div>
      </div>

      {/* 이미지 슬라이더 */}
      {post.images?.length > 0 && (
        <div className="relative aspect-[4/5] w-full bg-gray-100">
          <img
            src={imageUrl(post.images[imgIdx])}
            className="w-full h-full object-cover"
            alt="게시물 이미지"
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {post.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white">
              {post.type === 'group' ? `${post.participantsCount}:${post.participantsCount} 과팅` : '1:1 소개팅'}
            </span>
          </div>
        </div>
      )}

      {/* 내용 */}
      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{post.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {post.isAnonymous ? '익명' : post.author?.name} • {post.author?.department || ''}
          </p>
        </div>

        {post.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{post.description}</p>
        )}

        {/* 작성자 정보 */}
        {!post.isAnonymous && post.author && (
          <div className="bg-white dark:bg-[#2d161a] rounded-xl p-4 flex items-center gap-3 border border-gray-100 dark:border-white/5">
            <div
              className="w-12 h-12 rounded-full bg-primary/10 bg-cover bg-center"
              style={post.author.profileImage ? { backgroundImage: `url(${imageUrl(post.author.profileImage)})` } : {}}
            >
              {!post.author.profileImage && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm dark:text-white">{post.author.name}</p>
              <p className="text-xs text-gray-400">{post.author.department}</p>
              {post.author.mbti && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  {post.author.mbti}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 신고 모달 */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setReportOpen(false)}>
          <div className="w-full max-w-[480px] mx-auto bg-white dark:bg-[#2d161a] rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold dark:text-white mb-4">신고 사유 선택</h3>
            {[
              { value: 'spam', label: '스팸/광고' },
              { value: 'inappropriate', label: '부적절한 콘텐츠' },
              { value: 'harassment', label: '괴롭힘/욕설' },
              { value: 'fake_profile', label: '허위 프로필' },
              { value: 'underage', label: '미성년자 의심' },
              { value: 'other', label: '기타' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={value}
                  checked={reportReason === value}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="accent-primary"
                />
                <span className="text-sm dark:text-white">{label}</span>
              </label>
            ))}
            <button
              onClick={handleReport}
              className="w-full mt-4 h-12 coral-gradient text-white font-bold rounded-full"
            >
              신고 접수
            </button>
          </div>
        </div>
      )}

      {/* 채팅하기 버튼 */}
      {!isOwner && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-30">
          <button
            onClick={handleChat}
            disabled={chatLoading}
            className="coral-gradient w-full h-14 rounded-full flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            {chatLoading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>채팅하기</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
