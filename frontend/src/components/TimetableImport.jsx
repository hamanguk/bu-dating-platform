import { useState } from 'react';
import { parseTimetable } from '../services/api';

const DAY_NAMES = ['월', '화', '수', '목', '금'];

/**
 * 에브리타임 시간표 가져오기 컴포넌트
 *
 * Props:
 * - onImport({ timetable, majorCourses }): 시간표 + 과목 데이터를 부모에 전달
 * - onFallback(): 수동 입력 모드로 전환
 */
export default function TimetableImport({ onImport, onFallback }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { subjects, courseNames, timetable }

  const handleParse = async () => {
    if (!url.trim()) {
      setError('에브리타임 시간표 공유 URL을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await parseTimetable(url.trim());
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || '시간표 가져오기에 실패했습니다.';
      const isFallback = err.response?.data?.fallback;
      setError(msg);
      if (isFallback) {
        // 3초 후 자동으로 수동 입력 안내
        setTimeout(() => {}, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      onImport({
        timetable: result.timetable,
        majorCourses: result.courseNames,
      });
    }
  };

  // 결과 확인 화면
  if (result) {
    return (
      <div className="space-y-4">
        {/* 과목 목록 */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
            <p className="text-sm font-bold text-green-700 dark:text-green-300">{result.message}</p>
          </div>

          <div className="space-y-2">
            {result.subjects.map((subj, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white dark:bg-white/5 rounded-xl px-3 py-2"
              >
                <span className="text-sm font-bold dark:text-white">{subj.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {subj.dayName} {subj.startTime}~{subj.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 시간표 미리보기 */}
        <div className="bg-white dark:bg-[#2d1e14] rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">grid_on</span>
            공강 시간표 미리보기
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[300px]">
              <div className="grid grid-cols-[36px_repeat(5,1fr)] text-center">
                <div />
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-[10px] font-bold text-gray-500 py-1">{d}</div>
                ))}
              </div>
              {Array.from({ length: 13 }, (_, pIdx) => (
                <div key={pIdx} className="grid grid-cols-[36px_repeat(5,1fr)]">
                  <div className="text-[9px] text-gray-400 flex items-center justify-center">
                    {pIdx + 1}교시
                  </div>
                  {Array.from({ length: 5 }, (_, dIdx) => {
                    const isFree = result.timetable[dIdx]?.[pIdx];
                    return (
                      <div
                        key={dIdx}
                        className={`h-7 border border-gray-100 dark:border-white/5 text-[9px] font-bold flex items-center justify-center ${
                          isFree
                            ? 'bg-[#FF8C00]/20 text-[#FF8C00]'
                            : 'bg-gray-50 dark:bg-white/[0.02] text-gray-300'
                        }`}
                      >
                        {isFree ? '공강' : '수업'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 확인 / 다시하기 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => { setResult(null); setUrl(''); }}
            className="flex-1 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold"
          >
            다시 입력
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-lg shadow-primary/20"
          >
            이 시간표로 적용
          </button>
        </div>
      </div>
    );
  }

  // URL 입력 화면
  return (
    <div className="space-y-3">
      {/* 안내 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
          에브리타임 앱에서 <strong>시간표 &gt; 공유 &gt; URL 복사</strong>를 눌러 공유 링크를 붙여넣으세요.
        </p>
      </div>

      {/* URL 입력 */}
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="https://everytime.kr/@abc123"
          className="flex-1 bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
        />
        <button
          onClick={handleParse}
          disabled={loading}
          className="px-5 h-13 rounded-2xl bg-primary text-white text-xs font-bold whitespace-nowrap disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              분석 중...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">download</span>
              가져오기
            </>
          )}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* 수동 입력 전환 */}
      <button
        onClick={onFallback}
        className="w-full text-center text-xs text-gray-400 dark:text-gray-500 py-2 hover:text-primary transition-colors"
      >
        에브리타임을 사용하지 않나요? <span className="underline font-bold">직접 입력하기</span>
      </button>
    </div>
  );
}
