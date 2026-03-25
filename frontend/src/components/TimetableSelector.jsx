const DAYS = ['월', '화', '수', '목', '금'];
const PERIODS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

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
        {/* 헤더 */}
        <div className="grid grid-cols-[40px_repeat(5,1fr)] gap-1 mb-1">
          <div />
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(i)}
              className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 py-1 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {day}
            </button>
          ))}
        </div>

        {/* 그리드 */}
        {PERIODS.map((period, pIdx) => (
          <div key={pIdx} className="grid grid-cols-[40px_repeat(5,1fr)] gap-1 mb-1">
            <div className="flex items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500">
              {period}교시
            </div>
            {DAYS.map((_, dIdx) => {
              const isFree = timetable[dIdx]?.[pIdx];
              return (
                <button
                  key={dIdx}
                  type="button"
                  onClick={() => toggle(dIdx, pIdx)}
                  className={`h-9 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 ${
                    isFree
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600'
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
