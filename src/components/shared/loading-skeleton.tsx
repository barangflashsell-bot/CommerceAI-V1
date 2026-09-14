"use client";

import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-lg", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="h-8 w-16" />
      <LoadingSkeleton className="h-3 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <LoadingSkeleton className="h-5 w-40" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
          <LoadingSkeleton className="h-4 w-4 rounded" />
          <LoadingSkeleton className="h-4 flex-1" />
          <LoadingSkeleton className="h-4 w-20" />
          <LoadingSkeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
