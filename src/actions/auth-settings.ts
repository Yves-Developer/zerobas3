"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveAuthSettings(settings: { key: string; value: string }[]) {
  try {
    for (const setting of settings) {
      await db.authConfig.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to save auth settings:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getAuthSettings() {
  try {
    const configs = await db.authConfig.findMany();
    return { success: true, data: configs };
  } catch (error) {
    console.error("Failed to fetch auth settings:", error);
    return { success: false, error: (error as Error).message };
  }
}
