import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    try {
        const bucket = await db.bucket.findUnique({
            where: { name },
            include: {
                files: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });
        
        if (!bucket) return NextResponse.json({ error: "Bucket not found" }, { status: 404 });
        
        return NextResponse.json(bucket.files);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
