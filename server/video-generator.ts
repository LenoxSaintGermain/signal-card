import { ENV } from "./_core/env";

export interface VideoGenerationResult {
  video_url: string;
  status: 'completed' | 'processing' | 'failed';
  error?: string;
}

/**
 * Generate a video from a text prompt using Gemini Veo 3.1 API
 * Returns a URL to the generated video file
 */
export async function generateVideo(prompt: string): Promise<VideoGenerationResult> {
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
  scenes: Array<{ id: number; visual_prompt: string }>
): Promise<Map<number, VideoGenerationResult>> {
  const results = new Map<number, VideoGenerationResult>();

  // Generate all videos in parallel
  const promises = scenes.map(async (scene) => {
    const result = await generateVideo(scene.visual_prompt);
    results.set(scene.id, result);
  });

  await Promise.all(promises);

  return results;
}
