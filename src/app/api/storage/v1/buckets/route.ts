import { db } from "@/lib/db";
import { ensureBucket } from "@/lib/storage-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const buckets = await db.bucket.findMany({
            include: {
                _count: {
                    select: { files: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(buckets);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, isPublic } = await req.json();
        if (!name) return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });

        const bucketName = name.toLowerCase();

        // Ensure in S3
        await ensureBucket(bucketName);

        // Create in DB
        const bucket = await db.bucket.upsert({
            where: { name: bucketName },
            update: { isPublic },
            create: { name: bucketName, isPublic }
        });

        return NextResponse.json(bucket);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
