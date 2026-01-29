import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("insights.generate", () => {
  it("generates a strategic insight with all required fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.insights.generate({
      signalId: "S01",
      signalTitle: "Friction Index",
      signalTruth: "Every layer of abstraction you add to hide complexity is a tax on velocity.",
      role: "CTO / VP Eng",
      industry: "SaaS / Tech",
    });

    // Verify the structure
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("storyboard");
    expect(result).toHaveProperty("final_cta");

    // Verify types
    expect(typeof result.title).toBe("string");
    expect(Array.isArray(result.storyboard)).toBe(true);
    expect(typeof result.final_cta).toBe("string");

    // Verify content quality
    expect(result.title.length).toBeGreaterThan(5);
    expect(result.storyboard).toHaveLength(5);
    expect(result.final_cta.length).toBeGreaterThan(5);

    // Verify storyboard scene structure
    result.storyboard.forEach((scene) => {
      expect(scene).toHaveProperty("id");
      expect(scene).toHaveProperty("visual_prompt");
      expect(scene).toHaveProperty("text_overlay");
      expect(scene).toHaveProperty("video_style");
      expect(scene).toHaveProperty("mood");
      expect(typeof scene.visual_prompt).toBe("string");
      expect(typeof scene.text_overlay).toBe("string");
    });
  }, 30000); // 30 second timeout for API call

  it("handles different industries and roles", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.insights.generate({
      signalId: "S05",
      signalTitle: "Data Debt",
      signalTruth: "The cost of bad data compounds faster than the cost of bad code.",
      role: "CEO / Founder",
      industry: "Fintech / Banking",
    });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("storyboard");
    expect(result.storyboard.length).toBeGreaterThan(0);
    // Verify at least one scene has meaningful content
    const hasContent = result.storyboard.some(scene => scene.text_overlay.length > 10);
    expect(hasContent).toBe(true);
  }, 30000);
});
