export function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-white/10 skeleton-shimmer ${className}`} />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-[#2d161a] shadow-lg border border-gray-100 dark:border-white/5">
      <SkeletonBox className="aspect-[4/5] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-6 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <SkeletonBox className="h-4 w-full" />
        <div className="flex justify-between pt-1">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

export function ChatRoomSkeleton() {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-3 w-2/3" />
      </div>
      <SkeletonBox className="h-3 w-12" />
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div>
      <SkeletonBox className="aspect-[4/5] w-full rounded-none" />
      <div className="p-5 space-y-4">
        <SkeletonBox className="h-7 w-2/3" />
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-full" />
        <div className="flex items-center gap-3 mt-4">
          <SkeletonBox className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#2d161a] rounded-xl p-4 border border-gray-100 dark:border-white/5">
      <SkeletonBox className="h-3 w-16 mb-2" />
      <SkeletonBox className="h-8 w-12" />
    </div>
  );
}
