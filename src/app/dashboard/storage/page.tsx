"use client";

import { 
  Plus, 
  Folder, 
  File as FileIcon, 
  HardDrive, 
  MoreHorizontal, 
  Search, 
  Upload,
  Download,
  Trash2,
  Share2,
  ChevronRight,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

type Bucket = {
    id: string;
    name: string;
    isPublic: boolean;
    _count?: { files: number };
    files?: FileEntry[];
};

type FileEntry = {
    id: string;
    name: string;
    path: string;
    size: number;
    mimeType: string;
    createdAt: string;
};

export default function StoragePage() {
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [isNewBucketOpen, setIsNewBucketOpen] = useState(false);
    const [newBucketName, setNewBucketName] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBuckets();
    }, []);

    useEffect(() => {
        if (selectedBucket) {
            fetchFiles(selectedBucket);
        }
    }, [selectedBucket]);

    const fetchBuckets = async () => {
        const res = await fetch("/api/storage/v1/buckets");
        const data = await res.json();
        if (Array.isArray(data)) {
            setBuckets(data);
            if (data.length > 0 && !selectedBucket) setSelectedBucket(data[0].name);
        }
        setLoading(false);
    };

    const fetchFiles = async (bucketName: string) => {
        const res = await fetch(`/api/storage/v1/buckets/${bucketName}`);
        const data = await res.json();
        if (Array.isArray(data)) setFiles(data);
    };

    const handleCreateBucket = async () => {
        if (!newBucketName) return;
        const res = await fetch("/api/storage/v1/buckets", {
            method: "POST",
            body: JSON.stringify({ name: newBucketName, isPublic }),
        });
        if (res.ok) {
            setIsNewBucketOpen(false);
            setNewBucketName("");
            fetchBuckets();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedBucket) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/storage/v1/object/${selectedBucket}/${file.name}`, {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            fetchFiles(selectedBucket);
            fetchBuckets();
        }
        setUploading(false);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] -m-10 bg-background border rounded-xl overflow-hidden shadow-2xl">
            <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleUpload}
            />

            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-card/10 backdrop-blur-md z-30 sticky top-0">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        Storage Explorer
                    </h2>
                    <div className="h-4 w-px bg-border px-0" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground group cursor-pointer hover:text-primary transition-all">
                        <span className="font-medium">Buckets</span>
                        <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                        <span className="text-foreground/80 font-semibold underline decoration-primary/30 underline-offset-4 uppercase">{selectedBucket || "None"}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-muted-foreground/10" onClick={() => setIsNewBucketOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> New Bucket
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-9 gap-2 shadow-lg shadow-primary/20"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || !selectedBucket}
                    >
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Upload File
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 border-r flex flex-col bg-card/5">
                    <div className="p-4 bg-muted/5 border-b">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 px-1">Active Buckets</p>
                         <div className="space-y-1.5 overflow-y-auto max-h-[500px]">
                            {buckets.map(b => (
                                <div 
                                    key={b.id} 
                                    onClick={() => setSelectedBucket(b.name)}
                                    className={cn(
                                        "group p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ring-1 ring-border shadow-sm",
                                        selectedBucket === b.name ? "bg-accent/60 border-primary/40" : "bg-background/50 hover:bg-accent/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-1.5 rounded-md", selectedBucket === b.name ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                                            <Folder className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate uppercase">{b.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{b._count?.files || 0} files</p>
                                        </div>
                                    </div>
                                    {b.isPublic && <Badge variant="outline" className="h-4 text-[8px] bg-emerald-500/10 text-emerald-500 border-none px-1.5 font-bold uppercase tracking-widest">Public</Badge>}
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                {/* File Explorer */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                     <div className="flex-1 overflow-auto relative custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-muted/10 sticky top-0 z-20 backdrop-blur-md shadow-sm border-b">
                                <TableRow>
                                    <TableHead className="w-12 h-12 px-6"></TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Name</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Size</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Type</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Created</TableHead>
                                    <TableHead className="h-12 pr-6 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 w-20 border-l">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.id} className="group hover:bg-accent/30 border-b border-muted-foreground/5 transition-all">
                                        <TableCell className="h-14 px-6 text-center">
                                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors inline-block shadow-sm">
                                                <FileIcon className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="h-14 px-6 font-semibold text-sm group-hover:text-primary transition-colors">{file.name}</TableCell>
                                        <TableCell className="h-14 px-6 text-xs text-muted-foreground/60 font-mono">{formatSize(file.size)}</TableCell>
                                        <TableCell className="h-14 px-6 uppercase tracking-tighter">
                                            <Badge variant="secondary" className="text-[10px] opacity-60 font-medium px-2 py-0 h-5 border-none italic">{file.mimeType}</Badge>
                                        </TableCell>
                                        <TableCell className="h-14 px-6 text-xs text-muted-foreground/60">{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="h-14 pr-6 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                     <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                     </button>
                                                } />
                                                <DropdownMenuContent align="end" className="w-48 bg-card border-muted-foreground/20 shadow-2xl">
                                                    <DropdownMenuItem className="gap-3 text-sm" onClick={() => window.open(`/api/storage/v1/object/${selectedBucket}/${file.path}`, "_blank")}>
                                                        <Download className="h-3.5 w-3.5 text-emerald-500" /> Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-3 text-sm" onClick={() => window.open(`/api/storage/v1/object/${selectedBucket}/${file.path}`, "_blank")}>
                                                        <ExternalLink className="h-3.5 w-3.5" /> Preview
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {files.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center text-muted-foreground italic">No files found in this bucket.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                     </div>
                </div>
            </div>

            {/* New Bucket Sheet */}
            <Sheet open={isNewBucketOpen} onOpenChange={setIsNewBucketOpen}>
                <SheetContent side="right" className="bg-card w-full sm:max-w-md border-l shadow-2xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>Create New Bucket</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bucket Name</Label>
                            <Input placeholder="avatars" value={newBucketName} onChange={e => setNewBucketName(e.target.value)} />
                        </div>
                        <div className="flex items-center space-x-2">
                             <input type="checkbox" id="public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                             <Label htmlFor="public" className="text-sm">Make bucket public</Label>
                        </div>
                    </div>
                    <SheetFooter className="p-4 px-6 border-t bg-muted/20 flex flex-row gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setIsNewBucketOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleCreateBucket}>Create Bucket</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
