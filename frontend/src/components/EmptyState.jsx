export default function EmptyState({ icon = 'inbox', title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center py-20 gap-3">
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-2">
        <span className="material-symbols-outlined text-primary/30 text-5xl">{icon}</span>
      </div>
      {title && <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>}
      {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 coral-gradient text-white text-sm font-bold rounded-full mt-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
