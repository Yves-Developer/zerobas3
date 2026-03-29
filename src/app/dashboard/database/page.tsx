"use client";

import { Database } from "lucide-react";

export default function DatabaseHome() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full bg-background border-l">
            <Database className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Table Editor</h3>
            <p className="text-muted-foreground max-w-sm">Select a table from the sidebar to view and edit its contents, or create a new table.</p>
        </div>
    );
}
