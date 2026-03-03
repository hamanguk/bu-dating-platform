import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats,
  getAdminReports,
  getAdminUsers,
  getAdminChatLogs,
  updateReportStatus,
  suspendUser,
  unsuspendUser,
  adminDeletePost,
} from '../services/api';

const TABS = [
  { key: 'stats',   label: '통계',     icon: 'bar_chart' },
  { key: 'users',   label: '사용자',   icon: 'group' },
  { key: 'chat',    label: '채팅로그', icon: 'chat' },
  { key: 'reports', label: '신고',     icon: 'report' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [reportStatus, setReportStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        if (tab === 'stats') {
          const { data } = await getAdminStats();
          setStats(data);
        } else if (tab === 'users') {
          const { data } = await getAdminUsers();
          setUsers(data.users);
        } else if (tab === 'chat') {
          const { data } = await getAdminChatLogs();
          setChatLogs(data.messages);
        } else if (tab === 'reports') {
          const { data } = await getAdminReports({ status: reportStatus });
          setReports(data.reports);
        }
      } catch (err) {
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab, reportStatus]);

  const handleSuspend = async (userId, days = 7) => {
    if (!confirm(`${days}일 정지 처리하시겠습니까?`)) return;
    await suspendUser(userId, days);
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isSuspended: true } : u)));
  };

  const handleUnsuspend = async (userId) => {
    await unsuspendUser(userId);
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isSuspended: false } : u)));
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('게시물을 삭제하시겠습니까?')) return;
    await adminDeletePost(postId);
  };

  const handleResolve = async (reportId) => {
    await updateReportStatus(reportId, 'resolved');
    setReports((prev) => prev.filter((r) => r._id !== reportId));
  };

  const formatDate = (d) => new Date(d).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 border-b border-gray-100 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center pr-10">관리자 패널</h2>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              tab === key ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">

          {/* ===== 통계 탭 ===== */}
          {tab === 'stats' && stats && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '전체 회원', value: stats.totalUsers, icon: 'group' },
                { label: '게시물', value: stats.totalPosts, icon: 'article' },
                { label: '활성 채팅방', value: stats.activeChatRooms ?? '-', icon: 'chat' },
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

          {/* ===== 사용자 탭 ===== */}
          {tab === 'users' && (
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="text-center text-gray-400 py-12">사용자가 없습니다.</p>
              ) : (
                users.map((u) => (
                  <div key={u._id} className="bg-white dark:bg-[#2d161a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold dark:text-white truncate">
                          {u.name}
                          {u.role === 'admin' && (
                            <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">관리자</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">
                          {u.department || '학과 미입력'} · {formatDate(u.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0 ml-2">
                        {u.isSuspended ? (
                          <button onClick={() => handleUnsuspend(u._id)} className="px-3 py-1.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">
                            해제
                          </button>
                        ) : u.role !== 'admin' ? (
                          <>
                            <button onClick={() => handleSuspend(u._id, 7)} className="px-2.5 py-1.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full">
                              7일
                            </button>
                            <button onClick={() => handleSuspend(u._id, 30)} className="px-2.5 py-1.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                              30일
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    {u.isSuspended && (
                      <p className="text-[10px] text-red-400 mt-1">정지 중 · ~{u.suspendedUntil ? formatDate(u.suspendedUntil) : '무기한'}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== 채팅로그 탭 ===== */}
          {tab === 'chat' && (
            <div className="space-y-2">
              {chatLogs.length === 0 ? (
                <p className="text-center text-gray-400 py-12">채팅 기록이 없습니다.</p>
              ) : (
                chatLogs.map((msg) => (
                  <div key={msg._id} className="bg-white dark:bg-[#2d161a] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary">{msg.sender?.name ?? '알 수 없음'}</p>
                        <p className="text-sm dark:text-white mt-0.5 break-words">{msg.content}</p>
                        {msg.roomId?.participants && (
                          <p className="text-[10px] text-gray-300 mt-1">
                            참여자: {msg.roomId.participants.map((p) => p.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== 신고 탭 ===== */}
          {tab === 'reports' && (
            <>
              <div className="flex gap-2">
                {['pending', 'reviewed', 'resolved'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReportStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold ${reportStatus === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300'}`}
                  >
                    {s === 'pending' ? '미처리' : s === 'reviewed' ? '검토중' : '처리완료'}
                  </button>
                ))}
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
                            {report.reportedUser?.name} ({report.reportedUser?.email})
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            신고자: {report.reporter?.name} | {report.reason}
                          </p>
                          {report.detail && <p className="text-xs text-gray-500 mt-1 italic">"{report.detail}"</p>}
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button onClick={() => handleSuspend(report.reportedUser?._id, 7)} className="px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">7일 정지</button>
                        <button onClick={() => handleSuspend(report.reportedUser?._id, 30)} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">30일 정지</button>
                        {report.reportedPost && (
                          <button onClick={() => handleDeletePost(report.reportedPost._id)} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">게시물 삭제</button>
                        )}
                        {reportStatus !== 'resolved' && (
                          <button onClick={() => handleResolve(report._id)} className="px-3 py-1.5 bg-green-100 text-green-600 text-xs font-bold rounded-full">처리 완료</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
