import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const processResult = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(processResult);
    if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = processResult(obj[key]);
        }
        return newObj;
    }
    return obj;
};

// Helper function to resolve the exact case-sensitive table name
async function resolveTable(requestedTable: string) {
    const tables: any = await db.$queryRawUnsafe(`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
    `);
    const actualTable = tables.find((t: any) => t.tablename.toLowerCase() === requestedTable.toLowerCase());
    return actualTable ? actualTable.tablename : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
    try {
        const { table } = await params;
        const exactTable = await resolveTable(table);
        if (!exactTable) return NextResponse.json({ error: `Table '${table}' not found in database.` }, { status: 404 });
        
        const result = await db.$queryRawUnsafe(`SELECT * FROM "${exactTable}" LIMIT 100`);
        
        const colsQuery: { column_name: string }[] = await db.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position ASC
        `, exactTable);
        const columns = colsQuery.map(c => c.column_name);

        return NextResponse.json({
            data: processResult(result),
            columns
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
    try {
        const { table } = await params;
        const exactTable = await resolveTable(table);
        if (!exactTable) return NextResponse.json({ error: `Table '${table}' not found in database.` }, { status: 404 });

        const body = await req.json();
        const keys = Object.keys(body);
        const values = Object.values(body);
        
        const cols = keys.map(k => `"${k}"`).join(', ');
        const vals = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `INSERT INTO "${exactTable}" (${cols}) VALUES (${vals}) RETURNING *`;
        const result = await db.$queryRawUnsafe(query, ...values);
        
        return NextResponse.json(processResult(result));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
    try {
        const { table } = await params;
        const exactTable = await resolveTable(table);
        if (!exactTable) return NextResponse.json({ error: `Table '${table}' not found in database.` }, { status: 404 });

        const { id, updates } = await req.json();
        
        if (!id) return NextResponse.json({ error: "Missing ID for update" }, { status: 400 });
        
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        
        const setString = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const query = `UPDATE "${exactTable}" SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
        
        const result = await db.$queryRawUnsafe(query, ...values, id);
        
        return NextResponse.json(processResult(result));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
    try {
        const { table } = await params;
        const exactTable = await resolveTable(table);
        if (!exactTable) return NextResponse.json({ error: `Table '${table}' not found in database.` }, { status: 404 });

        const { id } = await req.json();
        
        if (!id) return NextResponse.json({ error: "Missing ID for deletion" }, { status: 400 });
        
        const query = `DELETE FROM "${exactTable}" WHERE id = $1 RETURNING *`;
        const result = await db.$queryRawUnsafe(query, id);
        
        return NextResponse.json(processResult(result));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
