import { NextRequest, NextResponse } from "next/server";
import { 
  PutObjectCommand, 
  GetObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/storage";
import { db } from "@/lib/db";
import { ensureBucket } from "@/lib/storage-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  const p = await params;
  const bucket = p.bucket.toLowerCase();
  const objectPath = p.path.join("/");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // 1. Ensure bucket exists
    await ensureBucket(bucket);

    // 2. Upload to Minio
    const buffer = Buffer.from(await file.arrayBuffer());
    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: objectPath,
        Body: buffer,
        ContentType: file.type,
    }));

    // 3. Track in database
    const bucketRecord = await db.bucket.upsert({
        where: { name: bucket },
        update: {},
        create: { name: bucket },
    });

    const fileRecord = await db.file.upsert({
        where: { 
            bucketId_path: { bucketId: bucketRecord.id, path: objectPath } 
        },
        update: { 
            name: file.name, 
            size: file.size, 
            mimeType: file.type 
        },
        create: {
            name: file.name,
            path: objectPath,
            size: file.size,
            mimeType: file.type,
            bucketId: bucketRecord.id,
        },
    });

    return NextResponse.json({ 
        message: "File uploaded successfully", 
        data: fileRecord 
    });
  } catch (error: any) {
    console.error("Storage upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  const p = await params;
  const bucket = p.bucket.toLowerCase();
  const objectPath = p.path.join("/");

  try {
    // Generate signed URL for 1-hour access or just redirect
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: objectPath,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return NextResponse.redirect(url);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
