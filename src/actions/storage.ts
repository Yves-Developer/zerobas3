"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBuckets() {
    return await db.bucket.findMany({
        include: {
            _count: {
                select: { files: true }
            }
        }
    });
}

export async function getFiles(bucketName: string) {
    const bucket = await db.bucket.findUnique({
        where: { name: bucketName },
        include: { files: true }
    });
    return bucket?.files || [];
}

export async function deleteFile(fileId: string) {
    // Actually we should also delete from S3, but for now we'll just remove from DB
    // A more complete implementation would call S3 DeleteObject
    await db.file.delete({ where: { id: fileId } });
    revalidatePath("/dashboard/storage");
}
