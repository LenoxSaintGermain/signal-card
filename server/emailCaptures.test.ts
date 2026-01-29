import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("emailCaptures.save", () => {
  it("saves a valid email capture", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.emailCaptures.save({
      email: "test@example.com",
      role: "CEO",
      industry: "Fintech",
      signal: "Friction Index",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects invalid email format", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.emailCaptures.save({
        email: "not-an-email",
        role: "CEO",
        industry: "Fintech",
        signal: "Friction Index",
      })
    ).rejects.toThrow();
  });

  it("accepts email without optional fields", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.emailCaptures.save({
      email: "minimal@example.com",
    });

    expect(result).toEqual({ success: true });
  });
});
