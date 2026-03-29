import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const config = await db.authConfig.findMany();
    const configMap = config.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);
    return NextResponse.json(configMap);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { key, value } = body;
    
    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    const updated = await db.authConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });

    return NextResponse.json(updated);
}
