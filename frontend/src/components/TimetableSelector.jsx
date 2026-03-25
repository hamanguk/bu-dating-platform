const DAYS = ['월', '화', '수', '목', '금'];
const PERIODS = [
  { label: '1교시', time: '09:00' },
  { label: '2교시', time: '10:00' },
  { label: '3교시', time: '11:00' },
  { label: '4교시', time: '12:00', badge: '🔥 인기' },
  { label: '5교시', time: '13:00', badge: '🔥 인기' },
  { label: '6교시', time: '14:00' },
  { label: '7교시', time: '15:00' },
  { label: '8교시', time: '16:00' },
  { label: '9교시', time: '17:00' },
];

export default function TimetableSelector({ timetable, onChange }) {
  // timetable: boolean[5][9]  — true = 공강
  const toggle = (dayIdx, periodIdx) => {
    const next = timetable.map((row) => [...row]);
    next[dayIdx][periodIdx] = !next[dayIdx][periodIdx];
    onChange(next);
  };

  const toggleDay = (dayIdx) => {
    const allOn = timetable[dayIdx].every(Boolean);
    const next = timetable.map((row) => [...row]);
    next[dayIdx] = next[dayIdx].map(() => !allOn);
    onChange(next);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[340px]">
        {/* 헤더 — 시간 열 + 요일 */}
        <div className="grid grid-cols-[48px_repeat(5,1fr)]">
          <div />
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(i)}
              className="text-center text-[11px] font-bold text-gray-500 dark:text-gray-400 py-2 border-b border-gray-200 dark:border-white/10 hover:bg-primary/10 transition-colors"
            >
              {day}
            </button>
          ))}
        </div>

        {/* 시간표 격자 */}
        {PERIODS.map((period, pIdx) => (
          <div key={pIdx} className="grid grid-cols-[48px_repeat(5,1fr)]">
            {/* 시간 열 */}
            <div className="flex flex-col items-center justify-center border-r border-b border-gray-200 dark:border-white/10 py-1">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-tight">
                {period.label}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-tight">
                {period.time}
              </span>
              {period.badge && (
                <span className="text-[8px] text-orange-500 font-bold leading-tight mt-0.5">
                  {period.badge}
                </span>
              )}
            </div>

            {/* 셀 */}
            {DAYS.map((_, dIdx) => {
              const isFree = timetable[dIdx]?.[pIdx];
              return (
                <button
                  key={dIdx}
                  type="button"
                  onClick={() => toggle(dIdx, pIdx)}
                  className={`h-11 border-b border-r border-gray-200 dark:border-white/10 text-[10px] font-bold transition-all duration-150 active:scale-95 ${
                    isFree
                      ? 'bg-[#FF8C00]/20 text-[#FF8C00] dark:bg-[#FF8C00]/30'
                      : 'bg-white dark:bg-white/[0.02] text-gray-300 dark:text-gray-600'
                  }`}
                >
                  {isFree ? '공강' : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-center">
        공강 시간을 탭하세요 — 요일 이름을 탭하면 전체 선택/해제
      </p>
    </div>
  );
}
