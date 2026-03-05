export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = '확인', confirmColor = 'bg-red-500', loading = false, icon = 'warning' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="w-full max-w-[360px] bg-white dark:bg-[#2d161a] rounded-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <span className="material-symbols-outlined text-4xl mb-2" style={{ color: confirmColor === 'bg-red-500' ? '#ef4444' : '#ff6b81' }}>
          {icon}
        </span>
        <h3 className="text-lg font-bold dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-gray-200 dark:border-white/10 text-sm font-bold dark:text-white"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-11 rounded-full ${confirmColor} text-white text-sm font-bold flex items-center justify-center`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
