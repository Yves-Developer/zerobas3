"use client";

import { cn } from "@/lib/utils";
import { Database, Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const activeTable = pathname.split("/").pop();
    const [tables, setTables] = useState<string[]>(["User", "Account", "Session", "VerificationToken", "Project", "Bucket", "File"]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTableName, setNewTableName] = useState("");
    const [newTableCols, setNewTableCols] = useState<{name: string, type: string, isPrimary: boolean}[]>([
        { name: "id", type: "serial", isPrimary: true }
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addRowData, setAddRowData] = useState<Record<string, string>>({});
    const [activeTableCols, setActiveTableCols] = useState<string[]>([]);
    
    useEffect(() => {
        fetch("/api/db/tables").then(r => r.json()).then(data => {
            if (Array.isArray(data)) setTables(data);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (activeTable && isAddOpen) {
            fetch(`/api/db/${activeTable}`)
                .then(res => res.json())
                .then(data => {
                    if (data && Array.isArray(data.columns)) {
                        setActiveTableCols(data.columns);
                    } else if (Array.isArray(data) && data.length > 0) {
                        setActiveTableCols(Object.keys(data[0]));
                    }
                })
                .catch(console.error);
        }
    }, [activeTable, isAddOpen]);

    const handleAddRowSubmit = async () => {
        if (!activeTable) return;
        const body = Object.fromEntries(Object.entries(addRowData).filter(([_, v]) => v !== ""));
        await fetch(`/api/db/${activeTable}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json"}
        });
        setIsAddOpen(false);
        setAddRowData({});
        window.location.reload();
    };

    const addColumn = () => {
        setNewTableCols([...newTableCols, { name: "", type: "text", isPrimary: false }]);
    };

    const removeColumn = (idx: number) => {
        setNewTableCols(newTableCols.filter((_, i) => i !== idx));
    };

    const updateColumn = (idx: number, field: string, value: any) => {
        const updated = [...newTableCols];
        updated[idx] = { ...updated[idx], [field]: value };
        setNewTableCols(updated);
    };
    
    const handleCreateTable = async () => {
        if (!newTableName) return alert("Table name is required");
        if (newTableCols.some(c => !c.name)) return alert("All columns must have names");
        
        const res = await fetch("/api/db/tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                tableName: newTableName, 
                columns: newTableCols
            })
        });
        
        if (res.ok) {
            setIsCreateOpen(false);
            window.location.reload();
        } else {
            const err = await res.json();
            alert("Error: " + err.error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] -mx-10 -my-8 bg-background overflow-hidden border-t">
            {/* Sidebar for Tables */}
            <div className="w-64 border-r flex flex-col bg-background">
                <div className="p-4 border-b space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary" />
                            Tables
                        </h2>
                        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>} />
                            <SheetContent side="left" className="w-[400px] border-r shadow-2xl flex flex-col p-0">
                                <SheetHeader className="p-6 border-b">
                                    <SheetTitle className="flex items-center gap-2">Create a new table</SheetTitle>
                                </SheetHeader>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table Name</Label>
                                        <Input placeholder="Untitled Table" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} className="h-9" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Columns</Label>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addColumn}><Plus className="h-3 w-3" /> Add</Button>
                                        </div>
                                        <div className="space-y-3">
                                            {newTableCols.map((col, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <Input 
                                                        placeholder="Column Name" 
                                                        className="h-8 text-xs flex-1" 
                                                        value={col.name} 
                                                        onChange={(e) => updateColumn(idx, "name", e.target.value)} 
                                                    />
                                                    <Select value={col.type} onValueChange={(v) => updateColumn(idx, "type", v)}>
                                                       <SelectTrigger size="sm" className="w-[100px] text-xs h-8">
                                                          <SelectValue placeholder="Type" />
                                                       </SelectTrigger>
                                                       <SelectContent className="bg-popover border shadow-xl">
                                                          <SelectItem value="serial">Serial</SelectItem>
                                                          <SelectItem value="int">Integer</SelectItem>
                                                          <SelectItem value="text">Text</SelectItem>
                                                          <SelectItem value="varchar">Varchar</SelectItem>
                                                          <SelectItem value="boolean">Boolean</SelectItem>
                                                          <SelectItem value="timestamp">Timestamp</SelectItem>
                                                          <SelectItem value="jsonb">JSONB</SelectItem>
                                                       </SelectContent>
                                                    </Select>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => removeColumn(idx)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <SheetFooter className="p-4 px-6 border-t bg-muted/20 flex flex-row gap-3">
                                    <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button className="flex-1 h-9 text-xs shadow-sm bg-primary hover:bg-primary/90" onClick={handleCreateTable}>Create Table</Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <Input placeholder="Search tables..." className="pl-9 h-8 bg-muted text-xs text-foreground" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                    {tables.map((table) => (
                        <Link 
                            key={table} 
                            href={`/dashboard/database/${table.toLowerCase()}`}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-md text-sm transition-all hover:bg-accent group",
                                activeTable === table.toLowerCase() ? "bg-accent text-foreground font-medium" : "text-muted-foreground"
                            )}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full", activeTable === table.toLowerCase() ? "bg-primary" : "bg-transparent")} />
                            {table}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                <div className="h-14 border-b flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg capitalize">{activeTable || "Selected Table"}</h3>
                        <div className="h-4 w-px bg-border px-0" />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs border-muted-foreground/10"><Filter className="h-3.5 w-3.5" /> Filter</Button>
                            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <SheetTrigger render={
                                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs border-muted-foreground/10 disabled:opacity-50" disabled={!activeTable}>
                                        <Plus className="h-3.5 w-3.5" /> New Row
                                    </Button>
                                } />
                                <SheetContent side="right" className="bg-card w-full sm:max-w-md border-l shadow-2xl flex flex-col p-0">
                                    <SheetHeader className="px-6 py-4 border-b">
                                        <SheetTitle className="text-foreground text-sm flex items-center gap-2">Insert row into <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{activeTable}</span></SheetTitle>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                                        {activeTableCols.map(col => (
                                            <div key={col} className="grid grid-cols-4 gap-4 items-center">
                                                <Label className="text-right text-xs text-muted-foreground font-mono truncate" title={col}>{col}</Label>
                                                <Input
                                                    className="col-span-3 h-8 text-xs bg-background"
                                                    placeholder="NULL"
                                                    value={addRowData[col] || ""}
                                                    onChange={(e) => setAddRowData({...addRowData, [col]: e.target.value})}
                                                />
                                            </div>
                                        ))}
                                        {activeTableCols.length === 0 && (
                                            <div className="text-center text-xs text-muted-foreground py-8">Loading table structure...</div>
                                        )}
                                    </div>
                                    <SheetFooter className="p-4 px-6 border-t bg-muted/20 flex flex-row gap-3 shrink-0">
                                        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                        <Button size="sm" className="flex-1 h-9 text-xs shadow-sm bg-primary hover:bg-primary/90" onClick={handleAddRowSubmit} disabled={activeTableCols.length === 0}>Save Record</Button>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </div>
        </div>
    );
}
