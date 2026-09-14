"use client";

import { Menu, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Product Lab",
  "/content": "Content Lab",
  "/performance": "Performance",
  "/insights": "AI Insights",
  "/settings": "Settings",
};

function getPageName(pathname: string): string {
  if (pageNames[pathname]) return pageNames[pathname];
  if (pathname.startsWith("/products/")) return "Detail Produk";
  return "CommerceAI";
}

export function Header() {
  const { toggleSidebar, sidebarOpen } = useAppStore();
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">{pageName}</h2>
      </div>

      <button
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground hover:bg-secondary transition-colors"
        onClick={() => useAppStore.getState().setSearchOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Cari...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
