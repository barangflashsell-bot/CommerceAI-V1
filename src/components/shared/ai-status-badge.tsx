"use client";

import { cn } from "@/lib/utils";
import { Bot, Cpu } from "lucide-react";

interface AIStatusBadgeProps {
  isMock?: boolean;
  className?: string;
}

export function AIStatusBadge({ isMock = true, className }: AIStatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isMock
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        className
      )}
    >
      {isMock ? <Cpu className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
      {isMock ? "AI Estimated" : "Live AI"}
    </div>
  );
}
