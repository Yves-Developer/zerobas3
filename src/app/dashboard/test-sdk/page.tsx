"use client";

import { useEffect, useState } from "react";
import { createClient } from "zerobase-sdk-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  ShieldCheck, 
  Loader2, 
  LogIn, 
  LogOut, 
  CircleCheck,
  ExternalLink,
  Database,
  Table as TableIcon,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SDKTestPage() {
    const [zb, setZb] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>("");
    const [tableData, setTableData] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [newItem, setNewItem] = useState<string>("");
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        // Initialize the LIVE SDK
        const client = createClient(
            window.location.origin, 
            "zb_sk_live_928374928374928374"
        );
        setZb(client);

        // Check for current user
        client.auth.getUser().then((res: any) => {
            if (res?.data) setUser(res.data.user);
            setLoading(false);
        });

        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch("/api/db/tables");
            const data = await res.json();
            if (Array.isArray(data)) {
                setTables(data);
                if (data.length > 0 && !selectedTable) setSelectedTable(data[0]);
            }
        } catch (e) {
            console.error("Failed to fetch tables", e);
        }
    };

    const fetchTableData = async (tableName: string) => {
        if (!zb || !tableName) return;
        setDataLoading(true);
        setStatus(null);
        try {
            console.log(tableName)
            const { data, error } = await zb.from(tableName).select("*");
            if (error) throw error;
            setTableData(data || []);
        } catch (e: any) {
            setStatus({ type: 'error', message: e.message });
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable);
        }
    }, [selectedTable, zb]);

    const handleInsert = async () => {
        if (!zb || !selectedTable || !newItem) return;
        setDataLoading(true);
        try {
            // We assume table has a 'name' field for this basic test
            // If not, we could add more complex logic, but for a test SDK this is good
            const { data, error } = await zb.from(selectedTable).insert({ name: newItem });
            if (error) throw error;
            setStatus({ type: 'success', message: "Record inserted successfully!" });
            setNewItem("");
            fetchTableData(selectedTable);
        } catch (e: any) {
            setStatus({ type: 'error', message: e.message });
        } finally {
            setDataLoading(false);
        }
    };

    const handleDelete = async (id: any) => {
        if (!zb || !selectedTable) return;
        setDataLoading(true);
        try {
            const { error } = await zb.from(selectedTable).delete(id);
            if (error) throw error;
            setStatus({ type: 'success', message: "Record deleted!" });
            fetchTableData(selectedTable);
        } catch (e: any) {
            setStatus({ type: 'error', message: e.message });
        } finally {
            setDataLoading(false);
        }
    };

    const handleSignIn = async () => {
        if (!zb) return;
        setLoading(true);
        await zb.auth.signInWithGoogle(window.location.origin + "/dashboard/test-sdk");
    };

    const handleSignOut = async () => {
        if (!zb) return;
        setLoading(true);
        await zb.auth.signOut();
        setUser(null);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-accent/5 p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                        <Zap className="h-8 w-8 text-primary-foreground fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">SDK Lab</h1>
                        <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Professional Integration Suite</p>
                    </div>
                </div>

                {user ? (
                    <div className="flex items-center gap-4 bg-background/50 border p-2 pl-4 rounded-2xl shadow-sm backdrop-blur-md">
                        <div className="text-right">
                            <p className="text-sm font-bold">{user.name || user.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{user.email}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive group" onClick={handleSignOut}>
                            <LogOut className="h-5 w-5 group-active:scale-90 transition-transform" />
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleSignIn} className="rounded-xl gap-2 h-12 px-6 font-bold shadow-xl shadow-primary/10">
                        <LogIn className="h-4 w-4" /> Start OAuth Flow
                    </Button>
                )}
            </header>

            <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 shadow-xl bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TableIcon className="h-5 w-5 text-primary" />
                                Database Context
                            </CardTitle>
                            <CardDescription>Select a table to begin CRUD testing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                {tables.map(table => (
                                    <button
                                        key={table}
                                        onClick={() => setSelectedTable(table)}
                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                            selectedTable === table 
                                            ? "border-primary bg-primary/5 shadow-md shadow-primary/5" 
                                            : "border-transparent bg-muted/30 hover:bg-muted/50"
                                        }`}
                                    >
                                        <span className={`font-bold ${selectedTable === table ? "text-primary" : "text-muted-foreground"}`}>{table}</span>
                                        {selectedTable === table && <CircleCheck className="h-4 w-4 text-primary fill-primary/10" />}
                                    </button>
                                ))}
                                {tables.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground italic text-sm">No tables found...</div>
                                )}
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest opacity-60">Insert Record</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Name value..." 
                                        value={newItem} 
                                        onChange={(e) => setNewItem(e.target.value)}
                                        className="h-10 rounded-xl bg-muted/20"
                                    />
                                    <Button size="icon" onClick={handleInsert} disabled={dataLoading || !newItem} className="rounded-xl shrink-0">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 bg-primary/5 border-primary/20 shadow-lg overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <RefreshCw className={`h-5 w-5 text-primary ${dataLoading ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-tighter text-primary">Live Connection</p>
                                <p className="text-[10px] text-primary/60 font-mono uppercase">Status: {dataLoading ? 'Pending...' : 'Ready'}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Data Display */}
                <div className="lg:col-span-8 space-y-6">
                    {status && (
                        <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                            status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-destructive/10 border-destructive/20 text-destructive'
                        }`}>
                            {status.type === 'success' ? <CircleCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                            <p className="text-sm font-bold">{status.message}</p>
                        </div>
                    )}

                    <Card className="border-2 shadow-2xl relative min-h-[400px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
                            <div>
                                <Badge variant="secondary" className="mb-2 uppercase tracking-widest font-black text-[10px]">
                                    Table: {selectedTable || 'None'}
                                </Badge>
                                <CardTitle className="text-2xl font-black uppercase italic tracking-tight">Active Dataset</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => fetchTableData(selectedTable)} disabled={dataLoading} className="rounded-full">
                                <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {dataLoading && tableData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Synchronizing Data...</p>
                                </div>
                            ) : tableData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                                    <div className="bg-muted p-6 rounded-3xl animate-bounce duration-[2000ms]">
                                        <Database className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">No Records Found</h3>
                                        <p className="text-sm text-muted-foreground max-w-[240px]">The selected table appears to be empty. Use the insert tool on the left to add your first record.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Identifier</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Metadata / Content</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {tableData.map((row, idx) => (
                                                <tr key={row.id || idx} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-xs text-muted-foreground px-2 py-1 bg-muted rounded-lg border">
                                                            {row.id?.substring(0, 8) || idx}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(row).map(([key, value]: [string, any]) => (
                                                                key !== 'id' && (
                                                                    <div key={key} className="flex flex-col">
                                                                        <span className="text-[10px] uppercase font-black opacity-30">{key}</span>
                                                                        <span className="text-sm font-bold">{String(value)}</span>
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => handleDelete(row.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`block mb-1.5 ${className}`}>{children}</span>;
}

