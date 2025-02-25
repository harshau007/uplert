"use client";

import { cn } from "@/lib/utils";
import { Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-background border-r border-border flex flex-col">
      <div className="p-4">
        <h1 className="flex items-center justify-center text-4xl font-bold">
          Uplert
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-accent",
            pathname === "/" && "bg-accent"
          )}
        >
          <Home size={16} />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-accent",
            pathname === "/settings" && "bg-accent"
          )}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
