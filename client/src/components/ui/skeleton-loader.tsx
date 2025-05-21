import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-5 w-full rounded-md bg-slate-100 animate-pulse",
        className
      )}
    />
  );
}

export function PageSkeletonLoader() {
  return (
    <div className="w-full p-6">
      {/* Header skeleton */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 py-4 px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between shadow-sm mb-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex flex-wrap gap-3 mt-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-32" />
        </div>
      </header>

      {/* AI conclusion skeleton */}
      <div className="mb-6 p-4 border border-blue-100 rounded-lg bg-blue-50">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Card layout skeleton - adapts to different pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <Skeleton className="h-5 w-1/2 mb-4" />
          <Skeleton className="h-32 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <Skeleton className="h-5 w-1/2 mb-4" />
          <Skeleton className="h-32 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <Skeleton className="h-5 w-1/2 mb-4" />
          <Skeleton className="h-32 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Table or list view skeleton */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex justify-between border-b pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex justify-between border-b pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex justify-between border-b pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        </div>
      </div>
    </div>
  );
}