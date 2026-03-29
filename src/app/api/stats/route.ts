import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Get User Count
        const userCount = await db.user.count();

        // 2. Get Table Count
        const tables: any = await db.$queryRawUnsafe(`
            SELECT count(*) 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public'
        `);
        const tableCount = Number(tables[0].count);

        // 3. Get Storage Stats (Mocked for now but looking at DB)
        const fileCount = await db.file.count();
        const fileSizeSum = await db.file.aggregate({
            _sum: { size: true }
        });

        const stats = [
            { name: "Database Tables", value: tableCount, icon: "database" },
            { name: "Registered Users", value: userCount, icon: "users" },
            { name: "Stored Objects", value: fileCount, icon: "hard-drive" },
            { name: "Storage Used", value: formatSize(fileSizeSum._sum.size || 0), icon: "zap" },
        ];

        return NextResponse.json(stats);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

function formatSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}
