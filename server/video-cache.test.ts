import { describe, expect, it, beforeEach } from "vitest";
import { getDb } from "./db";
import { videoCache } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

/**
 * Helper function to hash prompts (matches video-generator.ts)
 */
function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt.trim().toLowerCase()).digest('hex');
}

describe("Video Cache", () => {
  beforeEach(async () => {
    // Clean up test data before each test
    const db = await getDb();
    if (db) {
      await db.delete(videoCache).where(eq(videoCache.promptHash, hashPrompt("test prompt for caching")));
      await db.delete(videoCache).where(eq(videoCache.promptHash, hashPrompt("another test prompt")));
    }
  });

  it("stores and retrieves cached videos", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const testPrompt = "test prompt for caching";
    const testHash = hashPrompt(testPrompt);
    const testVideoUrl = "https://example.com/video.mp4";

    // Insert a cache entry
    await db.insert(videoCache).values({
      promptHash: testHash,
      visualPrompt: testPrompt,
      videoUrl: testVideoUrl,
      videoStyle: "cinematic",
      mood: "dark",
      hitCount: 0,
      lastAccessedAt: new Date(),
    });

    // Retrieve the cache entry
    const cached = await db.select().from(videoCache).where(eq(videoCache.promptHash, testHash)).limit(1);

    expect(cached).toHaveLength(1);
    expect(cached[0].promptHash).toBe(testHash);
    expect(cached[0].visualPrompt).toBe(testPrompt);
    expect(cached[0].videoUrl).toBe(testVideoUrl);
    expect(cached[0].videoStyle).toBe("cinematic");
    expect(cached[0].mood).toBe("dark");
    expect(cached[0].hitCount).toBe(0);
  });

  it("updates hit count when cache is accessed", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const testPrompt = "another test prompt";
    const testHash = hashPrompt(testPrompt);

    // Insert initial cache entry
    await db.insert(videoCache).values({
      promptHash: testHash,
      visualPrompt: testPrompt,
      videoUrl: "https://example.com/video2.mp4",
      videoStyle: "glitch",
      mood: "urgent",
      hitCount: 0,
      lastAccessedAt: new Date(),
    });

    // Simulate cache hit by updating hit count
    const cached = await db.select().from(videoCache).where(eq(videoCache.promptHash, testHash)).limit(1);
    expect(cached[0].hitCount).toBe(0);

    await db.update(videoCache)
      .set({ 
        hitCount: cached[0].hitCount + 1,
        lastAccessedAt: new Date()
      })
      .where(eq(videoCache.id, cached[0].id));

    // Verify hit count increased
    const updated = await db.select().from(videoCache).where(eq(videoCache.promptHash, testHash)).limit(1);
    expect(updated[0].hitCount).toBe(1);
  });

  it("handles case-insensitive and whitespace-normalized prompts", () => {
    const prompt1 = "  Test Prompt  ";
    const prompt2 = "test prompt";
    const prompt3 = "TEST PROMPT";

    const hash1 = hashPrompt(prompt1);
    const hash2 = hashPrompt(prompt2);
    const hash3 = hashPrompt(prompt3);

    // All variations should produce the same hash
    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it("produces different hashes for different prompts", () => {
    const prompt1 = "cinematic drone shot";
    const prompt2 = "abstract data visualization";

    const hash1 = hashPrompt(prompt1);
    const hash2 = hashPrompt(prompt2);

    expect(hash1).not.toBe(hash2);
  });

  it("enforces unique constraint on promptHash", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const testPrompt = "unique constraint test";
    const testHash = hashPrompt(testPrompt);

    // Insert first entry
    await db.insert(videoCache).values({
      promptHash: testHash,
      visualPrompt: testPrompt,
      videoUrl: "https://example.com/video1.mp4",
      hitCount: 0,
      lastAccessedAt: new Date(),
    });

    // Attempt to insert duplicate should fail
    await expect(
      db.insert(videoCache).values({
        promptHash: testHash,
        visualPrompt: testPrompt,
        videoUrl: "https://example.com/video2.mp4",
        hitCount: 0,
        lastAccessedAt: new Date(),
      })
    ).rejects.toThrow();

    // Clean up
    await db.delete(videoCache).where(eq(videoCache.promptHash, testHash));
  });
});
