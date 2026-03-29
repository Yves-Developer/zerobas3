"use client";

import { 
  Settings, 
  Shield, 
  Key, 
  Database, 
  Globe, 
  Mail, 
  Bell, 
  Trash2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Save,
  Info,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [googleClientId, setGoogleClientId] = useState("");
    const [googleClientSecret, setGoogleClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [activeTab, setActiveTab] = useState("General");

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            const { getAuthSettings } = await import("@/actions/auth-settings");
            const res = await getAuthSettings();
            if (res.success && res.data) {
                const clientId = res.data.find((c: { key: string; value: string }) => c.key === "GOOGLE_CLIENT_ID")?.value || "";
                const clientSecret = res.data.find((c: { key: string; value: string }) => c.key === "GOOGLE_CLIENT_SECRET")?.value || "";
                setGoogleClientId(clientId);
                setGoogleClientSecret(clientSecret);
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { saveAuthSettings } = await import("@/actions/auth-settings");
        const res = await saveAuthSettings([
            { key: "GOOGLE_CLIENT_ID", value: googleClientId },
            { key: "GOOGLE_CLIENT_SECRET", value: googleClientSecret }
        ]);
        setIsSaving(false);
        if (res.success) {
            alert("Settings saved successfully!");
        } else {
            alert("Error saving settings: " + res.error);
        }
    };
    
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] -m-10 bg-background border rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-card/10 backdrop-blur-md z-40 relative">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Project Settings
                    </h2>
                    <div className="h-4 w-px bg-border px-0" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground group cursor-pointer hover:text-primary transition-all">
                        <span className="font-medium">Infrastructure</span>
                        <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                        <span className="text-foreground/80 font-semibold underline decoration-primary/30 underline-offset-4 italic">{activeTab}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        size="sm" 
                        className="h-9 gap-2 shadow-lg shadow-primary/20"
                        disabled={isSaving}
                        onClick={handleSave}
                    >
                        <Save className="h-3.5 w-3.5" /> 
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Internal Sidebar */}
                <div className="w-64 border-r flex flex-col bg-card/5 select-none pt-4">
                    <div className="px-3 space-y-1">
                        {[
                            { name: "General", icon: Settings },
                            { name: "API Keys", icon: Key },
                            { name: "Database", icon: Database },
                            { name: "Authentication", icon: Shield },
                            { name: "Storage", icon: Globe },
                            { name: "Email", icon: Mail },
                            { name: "Notifications", icon: Bell },
                        ].map(item => (
                            <div 
                                key={item.name} 
                                onClick={() => setActiveTab(item.name)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                                    activeTab === item.name ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-accent/5">
                    <div className="max-w-3xl space-y-8">
                        {activeTab === "General" && (
                            <section className="space-y-8">
                                {/* Project Info */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Info className="h-5 w-5 text-blue-500" />
                                            General Information
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">Manage your project's identity and basic configuration.</p>
                                    </div>
                                    <div className="grid gap-6 p-6 rounded-2xl bg-card border shadow-sm">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Name</Label>
                                            <Input defaultValue="ZeroBase Production" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Reference ID</Label>
                                            <div className="flex gap-2">
                                                <Input defaultValue="zb-prod-8x92" readOnly className="font-mono text-xs bg-muted/40" />
                                                <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Infrastructure Status */}
                                <div className="space-y-4 pt-4 border-t border-muted-foreground/10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <Globe className="h-5 w-5 text-emerald-500" />
                                                Infrastructure Status
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">Resource allocation and region availability.</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 uppercase italic">Stable</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="bg-card">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deployment Region</p>
                                                    <p className="text-sm font-semibold">US-East-1 (AWS)</p>
                                                </div>
                                                <Globe className="h-5 w-5 opacity-20" />
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-card">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Center Availability</p>
                                                    <p className="text-sm font-semibold text-emerald-500">99.98% Operational</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 opacity-20" />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="pt-8 border-t border-destructive/20">
                                    <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4">
                                        <div className="flex items-center gap-3 text-destructive">
                                            <Trash2 className="h-5 w-5" />
                                            <h4 className="text-base font-bold uppercase tracking-widest leading-none">Danger Zone</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">Permanently delete this project and all of its data. This action cannot be undone.</p>
                                        <Button variant="destructive" size="sm" className="font-bold tracking-widest uppercase text-[10px] h-9">Delete Project</Button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === "API Keys" && (
                            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-amber-500" />
                                        API Management
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">Credentials for interacting with your project via the ZeroBase SDK.</p>
                                </div>
                                <div className="grid gap-6 p-6 rounded-2xl bg-card border shadow-sm">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">API Secret Key (Service Role)</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input 
                                                    type={showKey ? "text" : "password"} 
                                                    defaultValue="zb_sk_live_928374928374928374" 
                                                    readOnly 
                                                    className="font-mono text-xs pr-10" 
                                                />
                                                <button 
                                                    onClick={() => setShowKey(!showKey)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <Button variant="outline" className="gap-2 text-xs font-bold uppercase tracking-widest"><Copy className="h-3.5 w-3.5" /> Copy</Button>
                                        </div>
                                        <p className="text-[10px] text-destructive/80 italic mt-1 font-medium select-none flex items-center gap-1.5">
                                            <Shield className="h-3 w-3" />
                                            Warning: This key has full root access. Never expose it in browser applications.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === "Authentication" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Authenticaton Method
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">Configure your authentication providers and security policies.</p>
                                    </div>

                                    <div className="grid gap-6 p-6 rounded-2xl bg-card border shadow-sm">
                                        <div className="flex justify-between items-center bg-accent/20 p-4 rounded-xl mb-2">
                                            <div className="flex gap-4 items-center">
                                                <div className="bg-primary/20 p-3 rounded-lg">
                                                    <Globe className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold flex items-center gap-2">Google Auth <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[9px] h-4">Official Provider</Badge></div>
                                                    <p className="text-[10px] text-muted-foreground italic mt-0.5 font-medium select-none">Configured via the client-side Google OAuth platform</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                                                   <ExternalLink className="h-3 w-3" /> Console
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Google Client ID</Label>
                                                <Input 
                                                    placeholder="Enter Client ID" 
                                                    value={googleClientId}
                                                    onChange={(e) => setGoogleClientId(e.target.value)}
                                                    className="font-mono text-xs border-primary/10 bg-primary/5 focus:bg-background transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Google Client Secret</Label>
                                                <div className="relative">
                                                    <Input 
                                                        type={showKey ? "text" : "password"}
                                                        placeholder="Enter Client Secret" 
                                                        value={googleClientSecret}
                                                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                                                        className="font-mono text-xs border-primary/10 bg-primary/5 focus:bg-background transition-all pr-10"
                                                    />
                                                    <button 
                                                        onClick={() => setShowKey(!showKey)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab !== "General" && activeTab !== "API Keys" && activeTab !== "Authentication" && (
                            <div className="h-96 flex flex-col items-center justify-center text-muted-foreground italic gap-4 animate-pulse">
                                <Settings className="h-12 w-12 opacity-10" />
                                <span>{activeTab} configuration is managed via the main dashboard.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
