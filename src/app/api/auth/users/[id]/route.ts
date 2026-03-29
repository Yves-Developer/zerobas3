import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await db.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const user = await db.user.update({
            where: { id },
            data: body
        });
        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
