import { ENV } from "./_core/env";
import { getDb } from "./db";
import { videoCache } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

export interface VideoGenerationResult {
  video_url: string;
  status: 'completed' | 'processing' | 'failed';
  error?: string;
}

/**
 * Create a SHA-256 hash of a prompt for cache lookup
 */
function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt.trim().toLowerCase()).digest('hex');
}

/**
 * Generate a video from a text prompt using Gemini Veo 3.1 API
 * Implements caching to avoid regenerating identical prompts
 * Returns a URL to the generated video file
 */
export async function generateVideo(prompt: string, metadata?: { videoStyle?: string; mood?: string }): Promise<VideoGenerationResult> {
  const promptHash = hashPrompt(prompt);
  
  // Check cache first
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Video Generator] Database not available, skipping cache");
    } else {
      const cached = await db.select().from(videoCache).where(eq(videoCache.promptHash, promptHash)).limit(1);
    
      if (cached.length > 0) {
        console.log(`[Video Generator] Cache HIT for prompt hash: ${promptHash}`);
        
        // Update hit count and last accessed timestamp
        await db.update(videoCache)
          .set({ 
            hitCount: cached[0].hitCount + 1,
            lastAccessedAt: new Date()
          })
          .where(eq(videoCache.id, cached[0].id));
        
        return {
          video_url: cached[0].videoUrl,
          status: 'completed'
        };
      }
      
      console.log(`[Video Generator] Cache MISS for prompt hash: ${promptHash}`);
    }
  } catch (cacheError) {
    console.error(`[Video Generator] Cache lookup error:`, cacheError);
    // Continue with generation if cache lookup fails
  }
  try {
    const apiUrl = ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
      ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/models/veo-3.1-generate-preview:generateVideos`
      : "https://forge.manus.im/v1/models/veo-3.1-generate-preview:generateVideos";

    // Initiate video generation
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        // Optional parameters for portrait mode and quality
        config: {
          aspect_ratio: "9:16", // Portrait for mobile
          resolution: "720p", // Balance quality and speed
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Video Generator] API Error:", response.status, errorText);
      throw new Error(`Veo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const operationId = data.name; // Operation ID for polling

    // Poll for completion (Veo takes 30-60 seconds typically)
    const videoUrl = await pollVideoGeneration(operationId);

    // Store in cache for future use
    try {
      const db = await getDb();
      if (db) {
        await db.insert(videoCache).values({
          promptHash,
          visualPrompt: prompt,
          videoUrl: videoUrl,
          videoStyle: metadata?.videoStyle || null,
          mood: metadata?.mood || null,
          hitCount: 0,
          lastAccessedAt: new Date(),
        });
        console.log(`[Video Generator] Cached video for prompt hash: ${promptHash}`);
      }
    } catch (cacheError) {
      console.error(`[Video Generator] Failed to cache video:`, cacheError);
      // Don't fail the request if caching fails
    }

    return {
      video_url: videoUrl,
      status: 'completed'
    };

  } catch (error) {
    console.error("[Video Generator] Error:", error);
    return {
      video_url: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Poll the Veo API to check if video generation is complete
 */
async function pollVideoGeneration(operationId: string, maxAttempts = 30): Promise<string> {
  const apiUrl = ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/${operationId}`
    : `https://forge.manus.im/v1/${operationId}`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between polls

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to poll operation: ${response.status}`);
    }

    const data = await response.json();

    if (data.done) {
      // Video generation complete
      const videoFile = data.response?.generated_videos?.[0]?.video;
      if (!videoFile || !videoFile.uri) {
        throw new Error("No video URL in response");
      }
      return videoFile.uri;
    }

    console.log(`[Video Generator] Polling attempt ${attempt + 1}/${maxAttempts}...`);
  }

  throw new Error("Video generation timed out");
}

/**
 * Generate videos for all scenes in a storyboard
 * This can be called in parallel for faster generation
 */
export async function generateStoryboardVideos(
  scenes: Array<{ id: number; visual_prompt: string; video_style?: string; mood?: string }>
): Promise<Map<number, VideoGenerationResult>> {
  const results = new Map<number, VideoGenerationResult>();

  // Generate all videos in parallel
  const promises = scenes.map(async (scene) => {
    const result = await generateVideo(scene.visual_prompt, {
      videoStyle: scene.video_style,
      mood: scene.mood
    });
    results.set(scene.id, result);
  });

  await Promise.all(promises);

  return results;
}
