import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const users = await db.user.findMany({
            include: {
                accounts: true,
                _count: {
                    select: { sessions: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { email, name, role } = await req.json();
        if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

        const user = await db.user.create({
            data: { 
                id: crypto.randomUUID(),
                email, 
                name,
            }
        });

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
