"use client";

import { use, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash, Settings2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function TablePage({ params }: { params: Promise<{ table: string }> }) {
  const { table } = use(params);
  const [rows, setRows] = useState<any[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<{ rowIdx: number, colName: string, value: string } | null>(null);

  useEffect(() => {
    fetch(`/api/db/${table}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.columns)) {
           setRows(data.data || []);
           setCols(data.columns);
        } else if (Array.isArray(data) && data.length > 0) {
           setRows(data);
           setCols(Object.keys(data[0]));
        } else {
           setRows([]);
           setCols([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [table]);

  const saveCellEdit = async (id: any, col: string, value: any, rowIdx: number) => {
      setEditingCell(null);
      // Optimistic update
      const oldRows = [...rows];
      setRows(rows.map((r, i) => i === rowIdx ? { ...r, [col]: value } : r));

      try {
          const req = await fetch(`/api/db/${table}`, {
              method: "PUT",
              body: JSON.stringify({ id, updates: { [col]: value } }),
              headers: { "Content-Type": "application/json"}
          });
          const data = await req.json();
          if (data.error) throw new Error(data.error);
      } catch (err: any) {
          alert("Failed to save: " + err.message);
          setRows(oldRows); // Revert on failure
      }
  };

  const handleDelete = async (id: any) => {
      if(!confirm("Are you sure you want to delete this row?")) return;
      await fetch(`/api/db/${table}`, {
          method: "DELETE",
          body: JSON.stringify({ id }),
          headers: { "Content-Type": "application/json"}
      });
      setRows(rows.filter(r => r.id !== id));
  };

  const handleEdit = (row: any, rowIdx: number) => {
      const firstCol = cols.find(c => c !== "id" && c !== "created_at");
      if(firstCol) setEditingCell({ rowIdx, colName: firstCol, value: String(row[firstCol] || "") });
  };

  const handleAddSubmit = async () => {
       const body = Object.fromEntries(Object.entries(newRowData).filter(([_, v]) => v !== ""));
       await fetch(`/api/db/${table}`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json"}
      });
      setIsAddOpen(false);
      window.location.reload();
  };

  if(loading) return <div className="p-8 text-muted-foreground">Loading {table}...</div>;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b bg-background shrink-0">
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0"><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="text-xs text-muted-foreground flex-1 truncate">Total {rows.length} rows found in <span className="text-foreground font-semibold uppercase">{table}</span></div>
        <div className="flex gap-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input placeholder="Quick search..." className="h-8 w-48 lg:w-64 bg-muted text-xs text-foreground hover:bg-muted/80" />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Settings2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Actual Data Table */}
      <div className="flex-1 overflow-auto bg-background relative border-b min-h-0">
        <Table className="border-collapse w-full relative">
          <TableHeader className="bg-muted sticky top-0 z-10 shadow-sm shadow-black/5">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="w-12 h-10 px-4 text-center text-xs font-semibold text-muted-foreground">#</TableHead>
              {cols.map((col) => (
                <TableHead key={col} className="h-10 px-4 text-left text-xs font-semibold text-foreground cursor-pointer transition-colors hover:text-muted-foreground min-w-40 tracking-widest">{col}</TableHead>
              ))}
              <TableHead className="sticky right-0 bg-muted text-xs text-center font-semibold text-muted-foreground w-12 border-l tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {rows.map((row, idx) => (
              <TableRow key={row.id || idx} className="group hover:bg-muted/50 transition-colors border-b">
                <TableCell className="h-10 px-4 text-center text-xs font-medium text-muted-foreground border-r">{idx + 1}</TableCell>
                {cols.map((col, i) => {
                  const isEditing = editingCell?.rowIdx === idx && editingCell?.colName === col;
                  return (
                    <TableCell 
                      key={i} 
                      className={cn(
                        "h-10 px-4 text-sm text-foreground font-mono truncate max-w-sm cursor-text transition-colors",
                        isEditing ? "p-0" : "hover:bg-accent/40"
                      )}
                      onDoubleClick={() => setEditingCell({ rowIdx: idx, colName: col, value: String(row[col] || "") })}
                    >
                      {isEditing ? (
                        <Input
                          autoFocus
                          className="h-full w-full rounded-none border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm px-4 bg-background"
                          value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onKeyDown={(e) => {
                             if(e.key === "Enter") saveCellEdit(row.id, col, editingCell.value, idx);
                             if(e.key === "Escape") setEditingCell(null);
                          }}
                          onBlur={() => saveCellEdit(row.id, col, editingCell.value, idx)}
                        />
                      ) : (
                        <span title={String(row[col])}>{String(row[col])}</span>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="sticky right-0 bg-background group-hover:bg-muted/50 transition-colors p-0 border-l">
                   <div className="flex justify-center items-center h-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <DropdownMenu>
                       <DropdownMenuTrigger render={
                         <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors outline-none focus:outline-none focus:bg-accent">
                           <MoreVertical className="h-4 w-4" />
                         </button>
                       } />
                       <DropdownMenuContent align="end" className="w-48 bg-card border shadow-md">
                         <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Row Actions</DropdownMenuLabel>
                         <DropdownMenuSeparator className="bg-border" />
                         <DropdownMenuItem className="gap-3 text-sm focus:bg-accent cursor-pointer" onClick={() => handleEdit(row, idx)}><Edit className="h-3.5 w-3.5 text-blue-500" /> Edit Record</DropdownMenuItem>
                         <DropdownMenuItem className="gap-3 text-sm text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer" onClick={() => handleDelete(row.id)}><Trash className="h-3.5 w-3.5" /> Delete Row</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data found in {table}.</div>
        )}
      </div>

      {/* Pagination Container */}
      <div className="h-12 shrink-0 flex items-center justify-between px-6 bg-background text-xs text-muted-foreground">
        <div>Page 1 of 1</div>
        <div className="flex items-center gap-1">
             <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-accent disabled:opacity-30" disabled>Previous</Button>
             <div className="flex gap-1 h-6 items-center px-1">
                <span className="w-6 h-6 flex items-center justify-center rounded bg-primary text-primary-foreground font-semibold">1</span>
             </div>
             <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-accent" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
