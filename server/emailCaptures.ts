import { emailCaptures, InsertEmailCapture } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Save an email capture to the database
 */
export async function saveEmailCapture(capture: InsertEmailCapture): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save email capture: database not available");
    return;
  }

  try {
    await db.insert(emailCaptures).values(capture);
  } catch (error) {
    console.error("[Database] Failed to save email capture:", error);
    throw error;
  }
}

/**
 * Get all email captures (for admin dashboard)
 */
export async function getAllEmailCaptures() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get email captures: database not available");
    return [];
  }

  try {
    return await db.select().from(emailCaptures).orderBy(emailCaptures.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get email captures:", error);
    return [];
  }
}
