"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FlaskConical,
  Sparkles,
  BarChart3,
  BrainCircuit,
  Settings,
  ChevronLeft,
  Zap,
  CalendarClock,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scout", label: "Product Scout", icon: Compass },
  { href: "/products", label: "Product Lab", icon: FlaskConical },
  { href: "/content", label: "Content Lab", icon: Sparkles },
  { href: "/publishing", label: "Publishing", icon: CalendarClock },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/insights", label: "AI Insights", icon: BrainCircuit },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-[72px]",
          "max-lg:translate-x-0",
          !sidebarOpen && "max-lg:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="text-base font-bold text-foreground tracking-tight">CommerceAI</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">AI Commerce Machine</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="ml-auto hidden lg:flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                !sidebarOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="mb-2 px-3">
            {sidebarOpen && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Menu
              </span>
            )}
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0] shadow-primary"
                    : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={item.label}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* AI Status */}
        {sidebarOpen && (
          <div className="border-t border-sidebar-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Mock AI Active</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
