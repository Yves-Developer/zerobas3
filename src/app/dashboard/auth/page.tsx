"use client";

import { 
  Plus, 
  Users, 
  MoreHorizontal, 
  Search, 
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Fingerprint,
  Mail,
  KeyRound,
  History,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Settings,
  LayoutGrid,
  Globe,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

type UserRecord = {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    accounts?: { provider: string }[];
    _count?: { sessions: number };
};

export default function AuthPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState<"users" | "providers">("users");
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    const [googleConfig, setGoogleConfig] = useState({ clientId: "", clientSecret: "" });
    const [configLoading, setConfigLoading] = useState(false);
    
    // New User Form
    const [newUser, setNewUser] = useState({ email: "", name: "" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await fetch("/api/auth/users");
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
    };

    const fetchConfig = async () => {
        const res = await fetch("/api/auth/config");
        const data = await res.json();
        if (data.GOOGLE_CLIENT_ID) setGoogleConfig(prev => ({ ...prev, clientId: data.GOOGLE_CLIENT_ID }));
        if (data.GOOGLE_CLIENT_SECRET) setGoogleConfig(prev => ({ ...prev, clientSecret: data.GOOGLE_CLIENT_SECRET }));
    };

    useEffect(() => {
        if (currentTab === "providers") fetchConfig();
    }, [currentTab]);


    const handleAddUser = async () => {
        if (!newUser.email) return;
        const res = await fetch("/api/auth/users", {
            method: "POST",
            body: JSON.stringify(newUser),
        });
        if (res.ok) {
            setIsAddOpen(false);
            setNewUser({ email: "", name: "" });
            fetchUsers();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This user won't be able to log in anymore.")) return;
        const res = await fetch(`/api/auth/users/${id}`, { method: "DELETE" });
        if (res.ok) fetchUsers();
    };

    const handleSaveConfig = async (key: string, value: string) => {
        setConfigLoading(true);
        await fetch("/api/auth/config", {
            method: "POST",
            body: JSON.stringify({ key, value }),
        });
        setConfigLoading(false);
    };


    if (loading) return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading identities...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] -m-10 bg-background border rounded-xl overflow-hidden shadow-2xl">
            {/* Auth Top Header Section */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-card/10 backdrop-blur-md z-40 relative">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Authentication
                    </h2>
                    <div className="h-4 w-px bg-border px-0" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground group cursor-pointer hover:text-primary transition-all">
                        <span className="font-medium underline decoration-primary/30 underline-offset-4 italic">Management</span>
                        <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                        <span className="text-foreground/80 font-semibold">{currentTab === "users" ? "User Accounts" : "Auth Providers"}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {currentTab === "users" && (
                        <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => setIsAddOpen(true)}>
                            <UserPlus className="h-3.5 w-3.5" /> New User
                        </Button>
                    )}
                </div>

            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Auth Sidebar Filters */}
                <div className="w-72 border-r flex flex-col bg-card/5 select-none">
                    <div className="p-4 space-y-6">
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Overview</p>
                            <div className="space-y-1.5">
                                {[
                                    { id: "users", name: "User Accounts", icon: Users, count: users.length },
                                    { id: "providers", name: "Auth Providers", icon: Globe, count: 1 },
                                ].map(g => (
                                    <div key={g.id} 
                                        onClick={() => setCurrentTab(g.id as any)}
                                        className={cn(
                                        "flex h-10 items-center justify-between px-3 rounded-lg hover:bg-accent/40 hover:text-primary transition-all cursor-pointer group hover:shadow-sm ring-1 ring-transparent hover:ring-border",
                                        currentTab === g.id && "bg-accent/40 text-primary ring-border"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <g.icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-all" />
                                            <span className="text-sm font-medium">{g.name}</span>
                                        </div>
                                        {g.id === "users" && <span className="text-[10px] font-mono opacity-40 group-hover:opacity-100 group-hover:text-primary/70">{g.count}</span>}
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>

                {/* Main Component Explorer */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                    {currentTab === "users" ? (
                        <>
                             <div className="h-14 border-b bg-muted/5 flex items-center justify-between px-6 z-20">

                         <div className="relative group w-96">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-all" />
                             <Input placeholder="Search user ID, email, or metadata..." className="h-9 pl-10 bg-background/50 border-muted-foreground/10 text-xs italic" />
                         </div>
                     </div>
                     <div className="flex-1 overflow-auto relative custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-muted/10 sticky top-0 z-30 shadow-sm backdrop-blur-md border-b">
                                <TableRow>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">User Identifier</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Source</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 text-center">Status</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Sessions</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Created</TableHead>
                                    <TableHead className="h-12 pr-6 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 w-20 border-l">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id} className="group hover:bg-accent/40 border-b border-muted-foreground/5 transition-all">
                                        <TableCell className="h-14 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold group-hover:text-primary transition-colors cursor-pointer">{u.email}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono italic opacity-50 truncate max-w-[200px]">UID: {u.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="h-14 px-6">
                                            <div className="flex gap-1 flex-wrap lowercase">
                                                {u.accounts?.map(a => (
                                                    <Badge key={a.provider} variant="outline" className="text-[9px] font-bold tracking-widest bg-card px-2 py-0">{a.provider}</Badge>
                                                ))}
                                                {(!u.accounts || u.accounts.length === 0) && <Badge variant="outline" className="text-[9px] font-bold tracking-widest bg-card px-2 py-0 opacity-40">Direct</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="h-14 px-6 text-center">
                                            <Badge className="text-[9px] uppercase font-black tracking-[0.2em] h-5 px-2 rounded-sm bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20" variant="outline">
                                                active
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="h-14 px-6 text-xs text-muted-foreground/60 italic font-medium">{u._count?.sessions || 0}</TableCell>
                                        <TableCell className="h-14 px-6 text-xs text-muted-foreground/60 italic">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="h-14 pr-6 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                     <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors outline-none focus:outline-none focus:bg-accent">
                                                         <MoreHorizontal className="h-4 w-4" />
                                                     </button>
                                                } />
                                                <DropdownMenuContent align="end" className="w-48 bg-card border shadow-2xl">
                                                    <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest opacity-60 px-3">Manage User</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="gap-3 text-sm"><Shield className="h-3.5 w-3.5 text-primary" /> View Details</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-3 text-sm" onClick={() => handleDelete(u.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /> Delete Account</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                             <div className="flex flex-col items-center gap-2 text-muted-foreground italic">
                                                 <AlertCircle className="h-8 w-8 opacity-20" />
                                                 <span>No users found in this project.</span>
                                             </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                      </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-auto p-12 custom-scrollbar space-y-12">
                            <div className="max-w-4xl space-y-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold tracking-tight">Auth Providers</h3>
                                    <p className="text-muted-foreground italic text-sm">Configure third-party social login providers for your application.</p>
                                </div>

                                <div className="grid gap-6">
                                    <Card className="border-muted-foreground/10 shadow-xl bg-card overflow-hidden">
                                        <CardHeader className="border-b bg-muted/5 py-4 px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-muted-foreground/10">
                                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base font-bold tracking-wide">Google OAuth</CardTitle>
                                                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Social Provider</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] h-5 px-3 rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10">
                                                    in-development
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                            <div className="grid gap-6">
                                                <div className="grid gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Google Client ID</Label>
                                                        <span className="text-[8px] opacity-30 font-mono tracking-tighter">Required for OAuth</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="relative flex-1 group">
                                                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-all" />
                                                            <Input 
                                                                placeholder="G-..." 
                                                                className="h-10 pl-10 bg-muted/20 border-muted-foreground/10 italic text-xs tracking-tight" 
                                                                value={googleConfig.clientId}
                                                                onChange={e => setGoogleConfig({ ...googleConfig, clientId: e.target.value })}
                                                            />
                                                        </div>
                                                        <Button 
                                                            variant="secondary" 
                                                            className="h-10 px-6 font-bold uppercase text-[10px] tracking-widest transition-all hover:bg-primary hover:text-white"
                                                            onClick={() => handleSaveConfig("GOOGLE_CLIENT_ID", googleConfig.clientId)}
                                                            disabled={configLoading}
                                                        >
                                                            {configLoading ? "Saving..." : "Save"}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Google Client Secret</Label>
                                                        <span className="text-[8px] opacity-30 font-mono tracking-tighter">Keep this private</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="relative flex-1 group">
                                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-all" />
                                                            <Input 
                                                                type="password" 
                                                                placeholder="••••••••••••••••" 
                                                                className="h-10 pl-10 bg-muted/20 border-muted-foreground/10 italic text-xs" 
                                                                value={googleConfig.clientSecret}
                                                                onChange={e => setGoogleConfig({ ...googleConfig, clientSecret: e.target.value })}
                                                            />
                                                        </div>
                                                        <Button 
                                                            variant="secondary" 
                                                            className="h-10 px-6 font-bold uppercase text-[10px] tracking-widest transition-all hover:bg-primary hover:text-white"
                                                            onClick={() => handleSaveConfig("GOOGLE_CLIENT_SECRET", googleConfig.clientSecret)}
                                                            disabled={configLoading}
                                                        >
                                                            {configLoading ? "Saving..." : "Save"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-muted-foreground/5 space-y-4">
                                                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-primary italic">Redirect URI Configuration</p>
                                                        <p className="text-xs text-muted-foreground opacity-70 italic">Add this URL to your Google Cloud Console Authorized redirect URIs:</p>
                                                        <div className="mt-2 flex items-center gap-2 p-2 bg-background border rounded-md group cursor-pointer hover:border-primary transition-all">
                                                            <code className="text-[10px] font-mono select-all">http://localhost:3000/api/auth/callback/google</code>
                                                            <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-all ml-auto" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-2 gap-6 opacity-40 grayscale group cursor-not-allowed">
                                        {['GitHub', 'Facebook'].map(p => (
                                            <Card key={p} className="border-dashed border-muted-foreground/30 bg-muted/5 transition-all">
                                                <CardContent className="h-32 flex flex-col items-center justify-center gap-2 p-0">
                                                    <ShieldAlert className="h-6 w-6 opacity-30" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{p} coming soon</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New User Sheet */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent side="right" className="bg-card w-full sm:max-w-md border-l shadow-2xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>Add New User</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                            <Input placeholder="user@example.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                            <Input placeholder="John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        </div>
                    </div>
                    <SheetFooter className="p-4 px-6 border-t bg-muted/20 flex flex-row gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button className="flex-1 shadow-lg shadow-primary/20" onClick={handleAddUser}>Create User</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
