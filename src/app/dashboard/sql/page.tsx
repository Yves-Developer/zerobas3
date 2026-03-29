"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Trash2, 
  Save, 
  History, 
  Copy,
  Terminal as TerminalIcon,
  ChevronDown,
  RotateCcw,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function SQLEditorPage() {
    const [sql, setSql] = useState("SELECT * FROM \"User\" LIMIT 10;");
    const [results, setResults] = useState<any[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleRun = async () => {
        setIsExecuting(true);
        try {
            const res = await fetch("/api/sql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: sql })
            });
            const data = await res.json();
            if (data.error) {
                setResults([{ error: data.error }]);
            } else {
                setResults(data.data || []);
            }
        } catch (e: any) {
            setResults([{ error: e.message }]);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] -m-10 border rounded-xl shadow-2xl overflow-hidden bg-background">
            {/* Editor Toolbar */}
            <div className="h-14 border-b flex items-center justify-between px-6 bg-card/10 backdrop-blur-sm z-20 sticky top-0">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <TerminalIcon className="h-5 w-5 text-primary" />
                        SQL Query
                        <span className="text-xs font-normal text-muted-foreground italic px-2 bg-muted/30 rounded">read-write</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-muted-foreground/10 hover:text-primary transition-all"><RotateCcw className="h-3.5 w-3.5" /> Format</Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-muted-foreground/10 hover:text-primary transition-all"><Save className="h-3.5 w-3.5" /> Save Snippet</Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button 
                        size="sm" 
                        className="h-9 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold"
                        onClick={handleRun}
                        disabled={isExecuting}
                    >
                        <Play className={cn("h-3.5 w-3.5", isExecuting && "animate-pulse")} />
                        {isExecuting ? "Executing..." : "Run Query"}
                    </Button>
                </div>
            </div>

            {/* Main Window Partition */}
            <div className="flex-1 flex flex-col overflow-hidden divide-y divide-border">
                {/* Monaco Editor Section */}
                <div className="flex-1 min-h-[40%] relative group">
                    <Editor
                        height="100%"
                        defaultLanguage="sql"
                        theme="vs-dark"
                        value={sql}
                        onChange={(v) => setSql(v || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20 },
                            fontFamily: "var(--font-mono)",
                            lineNumbers: "on",
                            glyphMargin: false,
                            folding: true,
                            lineDecorationsWidth: 10,
                            lineNumbersMinChars: 3,
                            renderLineHighlight: "all",
                            overviewRulerBorder: false,
                            hideCursorInOverviewRuler: true,
                            cursorStyle: "line",
                            contextmenu: true
                        }}
                    />
                    <div className="absolute right-6 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-lg border text-[10px] font-mono text-muted-foreground shadow-xl flex gap-3 pointer-events-none uppercase tracking-tighter ring-1 ring-border">
                            <span>Ctrl + Enter to run</span>
                            <span>Tab to indent</span>
                         </div>
                    </div>
                </div>

                {/* Results Preview Section */}
                <div className="h-[45%] flex flex-col bg-card/5">
                    <Tabs defaultValue="results" className="flex-1 flex flex-col">
                        <div className="px-6 h-12 border-b flex items-center justify-between">
                            <TabsList className="bg-transparent gap-6 p-0 h-full border-none rounded-none shadow-none">
                                <TabsTrigger value="results" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent h-full px-1 rounded-none text-xs font-semibold uppercase tracking-widest text-muted-foreground">Results</TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent h-full px-1 rounded-none text-xs font-semibold uppercase tracking-widest text-muted-foreground">History</TabsTrigger>
                                <TabsTrigger value="console" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent h-full px-1 rounded-none text-xs font-semibold uppercase tracking-widest text-muted-foreground">Console</TabsTrigger>
                            </TabsList>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-primary"><Copy className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <TabsContent value="results" className="flex-1 overflow-auto m-0 outline-none relative bg-background/30 backdrop-blur-sm">
                            {results.length > 0 ? (
                                <Table>
                                    <TableHeader className="bg-muted/10 sticky top-0 z-10 shadow border-b backdrop-blur-md">
                                        <TableRow>
                                            {Object.keys(results[0]).map(k => (
                                                <TableHead key={k} className="h-10 px-6 text-xs font-semibold text-muted-foreground/80 lowercase min-w-[150px]">{k}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((r, i) => (
                                            <TableRow key={i} className="hover:bg-accent/40 border-b transition-colors group">
                                                {Object.values(r).map((v, j) => (
                                                    <TableCell key={j} className="h-10 px-6 py-2 text-sm font-mono text-muted-foreground italic group-hover:text-primary transition-colors">{String(v)}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-10 select-none">
                                    <History className="h-12 w-12 opacity-10 animate-pulse text-primary fill-primary/5" />
                                    <div className="text-center group">
                                        <p className="font-semibold text-lg text-muted-foreground/60 group-hover:text-primary transition-colors">No query results yet</p>
                                        <p className="text-sm italic text-muted-foreground/40 mt-1">Write some SQL above and hit "Run Query" to see data here.</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="history" className="flex-1 p-6 text-sm italic text-muted-foreground/60 min-h-[100px] outline-none select-none">
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-3 border rounded bg-muted/10 hover:border-primary/30 transition-all cursor-pointer group flex justify-between items-center ring-1 ring-border">
                                        <code className="text-xs group-hover:text-primary transition-colors truncate pr-10 italic">SELECT * FROM "Account" WHERE "id" = '9482...'</code>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold group-hover:text-primary/70 transition-all">2m ago</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="h-8 border-t flex items-center justify-between px-4 bg-muted/10 text-[10px] font-semibold text-muted-foreground select-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="uppercase tracking-[0.2em]">Connected</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                        <Database className="h-3 w-3" />
                        <span className="tracking-tighter">postgres-primary-prod</span>
                    </div>
                </div>
                <div className="flex gap-4 uppercase tracking-[0.15em] opacity-40 italic">
                    <span>UTF-8</span>
                    <span>PostgreSQL 16.2</span>
                </div>
            </div>
        </div>
    );
}
