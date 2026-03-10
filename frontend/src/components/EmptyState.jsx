export default function EmptyState({ icon = 'inbox', title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center py-24 gap-4">
      <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-2">
        <span className="material-symbols-outlined text-primary/30 text-5xl">{icon}</span>
      </div>
      {title && <p className="text-gray-500 dark:text-gray-400 text-base font-semibold">{title}</p>}
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3.5 coral-gradient text-white text-sm font-bold rounded-2xl mt-3 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
