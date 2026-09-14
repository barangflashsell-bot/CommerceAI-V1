"use client";

import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function ScoreGauge({ score, size = "md", label, className }: ScoreGaugeProps) {
  const sizes = {
    sm: { outer: 64, inner: 52, stroke: 6, text: "text-lg", labelText: "text-[9px]" },
    md: { outer: 100, inner: 84, stroke: 8, text: "text-3xl", labelText: "text-xs" },
    lg: { outer: 140, inner: 118, stroke: 11, text: "text-4xl", labelText: "text-sm" },
  };
  const s = sizes[size];
  const radius = (s.inner - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "oklch(0.72 0.19 155)", bg: "oklch(0.72 0.19 155 / 0.15)" };
    if (score >= 60) return { stroke: "oklch(0.70 0.15 240)", bg: "oklch(0.70 0.15 240 / 0.15)" };
    if (score >= 40) return { stroke: "oklch(0.80 0.16 80)", bg: "oklch(0.80 0.16 80 / 0.15)" };
    return { stroke: "oklch(0.60 0.20 25)", bg: "oklch(0.60 0.20 25 / 0.15)" };
  };

  const colors = getColor(score);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: s.outer, height: s.outer }}>
        <svg width={s.outer} height={s.outer} className="-rotate-90">
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke={colors.bg}
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(s.text, "font-bold")} style={{ color: colors.stroke }}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className={cn(s.labelText, "text-muted-foreground font-medium")}>{label}</span>
      )}
    </div>
  );
}
