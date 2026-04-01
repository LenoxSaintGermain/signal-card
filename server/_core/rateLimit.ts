import { TRPCError } from "@trpc/server";
import type { Request, Response } from "express";

type RateLimitConfig = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const STORE = new Map<string, RateLimitEntry>();
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  for (const [key, entry] of Array.from(STORE.entries())) {
    if (entry.resetAt <= now) {
      STORE.delete(key);
    }
  }
  lastSweep = now;
}

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function enforceRateLimit(
  req: Request,
  res: Response,
  config: RateLimitConfig,
  keySuffix: string
) {
  const now = Date.now();
  sweep(now);

  const prefix = config.keyPrefix ?? "trpc";
  const key = `${prefix}:${keySuffix}:${getClientIdentifier(req)}`;

  let entry = STORE.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.max) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader("Retry-After", retryAfter.toString());
    res.setHeader("X-RateLimit-Limit", config.max.toString());
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000).toString());
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again shortly.",
    });
  }

  entry.count += 1;
  STORE.set(key, entry);

  const remaining = Math.max(0, config.max - entry.count);
  res.setHeader("X-RateLimit-Limit", config.max.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000).toString());
}

export type { RateLimitConfig };
