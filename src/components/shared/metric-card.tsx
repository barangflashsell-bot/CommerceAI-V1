"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  gradient?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  className,
  gradient,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {gradient && (
        <div
          className={cn("absolute top-0 right-0 h-24 w-24 rounded-bl-full opacity-10", gradient)}
        />
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
          {isNegative && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
          {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          <span
            className={cn(
              "text-xs font-medium",
              isPositive && "text-emerald-400",
              isNegative && "text-red-400",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          >
            {isPositive && "+"}
            {change?.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
