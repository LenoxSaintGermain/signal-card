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
    expect(result).toHaveProperty("body");
    expect(result).toHaveProperty("implication");
    expect(result).toHaveProperty("metrics");

    // Verify types
    expect(typeof result.title).toBe("string");
    expect(typeof result.body).toBe("string");
    expect(typeof result.implication).toBe("string");
    expect(Array.isArray(result.metrics)).toBe(true);

    // Verify content quality
    expect(result.title.length).toBeGreaterThan(10);
    expect(result.body.length).toBeGreaterThan(50);
    expect(result.implication.length).toBeGreaterThan(20);
    expect(result.metrics).toHaveLength(3);

    // Verify metrics format (should contain numbers and %/+ signs)
    result.metrics.forEach((metric) => {
      expect(metric).toMatch(/[+\-\d%]/);
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
    expect(result.title).toContain("Fintech");
    expect(result.body.length).toBeGreaterThan(50);
  }, 30000);
});
