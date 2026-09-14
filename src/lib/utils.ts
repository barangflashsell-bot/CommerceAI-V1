import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString("id-ID");
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPercent(num: number): string {
  return (num * 100).toFixed(1) + "%";
}

export function calculateCTR(clicks: number, views: number): number {
  if (views === 0) return 0;
  return clicks / views;
}

export function calculateCVR(orders: number, clicks: number): number {
  if (clicks === 0) return 0;
  return orders / clicks;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 60) return "bg-blue-500/20 border-blue-500/30";
  if (score >= 40) return "bg-amber-500/20 border-amber-500/30";
  return "bg-red-500/20 border-red-500/30";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Sangat Potensial";
  if (score >= 60) return "Potensial";
  if (score >= 40) return "Cukup";
  return "Rendah";
}
