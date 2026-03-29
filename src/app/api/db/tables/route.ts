import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // Fetch all tables from PostgreSQL
        const tables: any = await db.$queryRawUnsafe(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema' 
            ORDER BY tablename ASC
        `);
        
        return NextResponse.json(tables.map((t: any) => t.tablename));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function POST(req: Request) {
    try {
        // Create a new table
        const { tableName, columns } = await req.json();
        
        if (!tableName || !columns || columns.length === 0) {
            return NextResponse.json({ error: "Missing table name or columns" }, { status: 400 });
        }
        
        // Very basic DDL builder for creating a table
        const cols = columns.map((c: any) => `"${c.name}" ${c.type} ${c.isPrimary ? "PRIMARY KEY" : ""}`).join(", ");
        const query = `CREATE TABLE "${tableName}" (${cols});`;
        
        await db.$executeRawUnsafe(query);
        
        return NextResponse.json({ success: true, table: tableName });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
