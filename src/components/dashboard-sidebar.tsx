"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Database, 
  Users, 
  HardDrive, 
  Terminal, 
  Settings, 
  Zap, 
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Database", href: "/dashboard/database", icon: Database },
  { name: "Authentication", href: "/dashboard/auth", icon: Users },
  { name: "Storage", href: "/dashboard/storage", icon: HardDrive },
  { name: "SQL Editor", href: "/dashboard/sql", icon: Terminal },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Zap className="h-6 w-6 text-primary fill-primary/20" />
          <span>ZeroBase</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Project
          </h3>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/60")} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-1">
          <h3 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Settings
          </h3>
          <Link
            href="/dashboard/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
              pathname.startsWith("/dashboard/settings") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Project Settings
          </Link>
        </div>
      </div>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate italic">Pro Plan</p>
            </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
