"use client";

import { 
  Plus, 
  Database, 
  Users, 
  HardDrive, 
  Terminal, 
  ExternalLink,
  Search,
  ArrowRight,
  Zap,
  Loader2,
  Copy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStats(data);
        setLoading(false);
      });
  }, []);

  const getIcon = (name: string) => {
    switch(name.toLowerCase()) {
        case "database": return Database;
        case "users": return Users;
        case "hard-drive": return HardDrive;
        default: return Zap;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
          <p className="text-muted-foreground mt-1 text-base">Welcome back! Manage your ZeroBase project settings and data here.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View App
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
             Array(4).fill(0).map((_, i) => (
                <Card key={i} className="bg-card animate-pulse h-32"></Card>
             ))
        ) : (
            stats.map((stat) => {
                const Icon = getIcon(stat.icon);
                return (
                    <Card key={stat.name} className="transition-all hover:border-foreground/20 group bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-500 font-medium">+0%</span> since today
                        </p>
                        </CardContent>
                    </Card>
                );
            })
        )}
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">Common Tasks</CardTitle>
                    <CardDescription>Frequently used management tools</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Browse Tables", desc: "View and edit your data", icon: Database, href: "/dashboard/database", color: "bg-blue-500/10 text-blue-500" },
                  { title: "Manage Auth", desc: "User permissions & identity", icon: Users, href: "/dashboard/auth", color: "bg-purple-500/10 text-purple-500" },
                  { title: "Storage Buckets", desc: "File uploads & CDN", icon: HardDrive, href: "/dashboard/storage", color: "bg-emerald-500/10 text-emerald-500" },
                  { title: "Run SQL", desc: "Direct database execution", icon: Terminal, href: "/dashboard/sql", color: "bg-orange-500/10 text-orange-500" },
                ].map((task) => (
                    <Link key={task.title} href={task.href} className="group p-4 rounded-xl border transition-all hover:border-foreground/20 hover:bg-accent block">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", task.color)}>
                                <task.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-base">{task.title}</h4>
                                <p className="text-muted-foreground text-sm line-clamp-1">{task.desc}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Project API</CardTitle>
                <CardDescription>Your unique access credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Project URL</label>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-muted p-2 rounded-md text-[10px] font-mono truncate text-foreground/80 leading-relaxed ring-1 ring-border">
                            {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
                        </code>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                            if (typeof window !== "undefined") {
                                navigator.clipboard.writeText(window.location.origin);
                                alert("URL copied!");
                            }
                        }}><Copy className="h-3 w-3" /></Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Service Key</label>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-muted p-2 rounded-md text-[10px] font-mono truncate text-foreground/80 leading-relaxed ring-1 ring-border">
                            {process.env.NODE_ENV === "production" ? "zb_sk_live_928374928374928374" : "zb_sk_test_1234567890abcdef"}
                        </code>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                            const key = process.env.NODE_ENV === "production" ? "zb_sk_live_928374928374928374" : "zb_sk_test_1234567890abcdef";
                            navigator.clipboard.writeText(key);
                            alert("Key copied!");
                        }}><Copy className="h-3 w-3" /></Button>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground text-center">Your project is running in <span className="font-bold text-primary italic uppercase">{process.env.NODE_ENV}</span> mode.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
