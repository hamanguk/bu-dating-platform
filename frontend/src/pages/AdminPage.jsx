import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats,
  getAdminReports,
  updateReportStatus,
  suspendUser,
  unsuspendUser,
  adminDeletePost,
} from '../services/api';

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats().then(({ data }) => setStats(data)),
      getAdminReports({ status }).then(({ data }) => setReports(data.reports)),
    ]).finally(() => setLoading(false));
  }, [status]);

  const handleSuspend = async (userId, days = 7) => {
    if (!confirm(`${days}일 정지 처리하시겠습니까?`)) return;
    await suspendUser(userId, days);
    alert('정지 처리되었습니다.');
  };

  const handleUnsuspend = async (userId) => {
    await unsuspendUser(userId);
    alert('정지가 해제되었습니다.');
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('게시물을 삭제하시겠습니까?')) return;
    await adminDeletePost(postId);
    alert('삭제되었습니다.');
  };

  const handleResolve = async (reportId) => {
    await updateReportStatus(reportId, 'resolved');
    setReports((prev) => prev.filter((r) => r._id !== reportId));
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 border-b border-gray-100 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center pr-10">관리자 패널</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          {/* 통계 */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '전체 회원', value: stats.totalUsers, icon: 'group' },
                { label: '게시물', value: stats.totalPosts, icon: 'article' },
                { label: '미처리 신고', value: stats.pendingReports, icon: 'report', alert: stats.pendingReports > 0 },
                { label: '정지 회원', value: stats.suspendedUsers, icon: 'block' },
              ].map(({ label, value, icon, alert }) => (
                <div key={label} className={`bg-white dark:bg-[#2d161a] rounded-xl p-4 shadow-sm ${alert ? 'border border-red-200 dark:border-red-800' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-sm ${alert ? 'text-red-500' : 'text-primary'}`}>{icon}</span>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                  <p className={`text-2xl font-extrabold ${alert ? 'text-red-500' : 'dark:text-white'}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* 신고 목록 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base dark:text-white">신고 목록</h3>
              <div className="flex gap-2">
                {['pending', 'reviewed', 'resolved'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold ${status === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300'}`}
                  >
                    {s === 'pending' ? '미처리' : s === 'reviewed' ? '검토중' : '처리완료'}
                  </button>
                ))}
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <span className="material-symbols-outlined text-gray-300 text-4xl">check_circle</span>
                <p className="text-gray-400 text-sm">신고가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report._id} className="bg-white dark:bg-[#2d161a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold dark:text-white">
                          신고 대상: {report.reportedUser?.name} ({report.reportedUser?.email})
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          신고자: {report.reporter?.name} | 사유: {report.reason}
                        </p>
                        {report.detail && <p className="text-xs text-gray-500 mt-1 italic">"{report.detail}"</p>}
                        {report.reportedPost && (
                          <p className="text-xs text-gray-400 mt-0.5">게시물: {report.reportedPost.title}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => handleSuspend(report.reportedUser?._id, 7)}
                        className="px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full"
                      >
                        7일 정지
                      </button>
                      <button
                        onClick={() => handleSuspend(report.reportedUser?._id, 30)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full"
                      >
                        30일 정지
                      </button>
                      {report.reportedPost && (
                        <button
                          onClick={() => handleDeletePost(report.reportedPost._id)}
                          className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full"
                        >
                          게시물 삭제
                        </button>
                      )}
                      <button
                        onClick={() => handleUnsuspend(report.reportedUser?._id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full"
                      >
                        정지 해제
                      </button>
                      {status !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(report._id)}
                          className="px-3 py-1.5 bg-green-100 text-green-600 text-xs font-bold rounded-full"
                        >
                          처리 완료
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
