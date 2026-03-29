import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        
        if (!query) {
             return NextResponse.json({ error: "No query provided" }, { status: 400 });
        }
        
        // Execute the raw query safely. 
        // Warning: This allows literal raw SQL execution (intended for the SQL Editor).
        let result;
        
        const q = query.trim().toUpperCase();
        if (q.startsWith("SELECT") || q.startsWith("SHOW") || q.startsWith("EXPLAIN") || q.startsWith("WITH")) {
            result = await db.$queryRawUnsafe(query);
        } else {
            result = await db.$executeRawUnsafe(query);
        }

        // Convert bigints and Dates to standard formats for JSON serialization
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

        const serialized = processResult(result);

        return NextResponse.json({ 
             data: Array.isArray(serialized) ? serialized : [{ "status": "Success", "rows_affected": serialized }] 
        });
        
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
