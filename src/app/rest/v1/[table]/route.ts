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

export async function GET(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
    try {
        const { table } = await params;
        const searchParams = req.nextUrl.searchParams;
        const select = searchParams.get("select") || "*";
        
        let query = `SELECT * FROM "${table}" LIMIT 100`;
        if (select !== "*") {
             const safeSelect = select.split(",").map(s => `"${s.trim()}"`).join(", ");
             query = `SELECT ${safeSelect} FROM "${table}" LIMIT 100`;
        }

        const result = await db.$queryRawUnsafe(query);
        return NextResponse.json(processResult(result));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
    try {
        const { table } = await params;
        const body = await req.json();
        
        const isArray = Array.isArray(body);
        const dataArray = isArray ? body : [body];
        
        if (dataArray.length === 0) return NextResponse.json([]);
        
        // Ensure each item has default fields if missing
        for (const item of dataArray) {
            if (!item.id) item.id = crypto.randomUUID();
            if (!item.createdAt) item.createdAt = new Date();
            if (!item.updatedAt) item.updatedAt = new Date();
        }

        const keys = Object.keys(dataArray[0]);
        const cols = keys.map(k => `"${k}"`).join(', ');
        
        // Basic batch insert
        let allResults = [];
        for (const item of dataArray) {
             const values = keys.map(k => {
                 const v = item[k];
                 if (v === undefined) return null;
                 return v;
             });
             const vals = values.map((_, i) => `$${i + 1}`).join(', ');
             const query = `INSERT INTO "${table}" (${cols}) VALUES (${vals}) RETURNING *`;
             const result = await db.$queryRawUnsafe(query, ...values);
             if (Array.isArray(result) && result[0]) {
                 allResults.push(result[0]);
             }
        }
        
        return NextResponse.json(processResult(isArray ? allResults : allResults[0]));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-version, x-csrftoken, x-requested-with, apikey",
            "Access-Control-Allow-Credentials": "true",
        },
    });
}
