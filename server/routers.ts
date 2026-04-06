import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, rateLimitedPublicProcedure, router } from "./_core/trpc";
import { saveEmailCapture } from "./emailCaptures";
import { generateInsight } from "./insight-generator";
import { createThirdMarkLiveSession } from "./live-session";
import {
  fetchSignalCardBriefing,
  fileSignalCardOperatorAction,
  reportThirdMarkConversationToAlfred,
} from "./swarm";
import { generateAndPersistStoryboardVideos } from "./video-generator";
import { movies, signalCardConversations } from "../drizzle/schema";
import { getDb } from "./db";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  cinema: router({
    save: rateLimitedPublicProcedure({ windowMs: 10 * 60 * 1000, max: 10, keyPrefix: "cinema-save" })
      .input(z.object({
        title: z.string(),
        storyboard: z.any(), // JSON
        finalCta: z.string(),
        userEmail: z.string().optional(),
        role: z.string().optional(),
        industry: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const slug = nanoid(10);
        await db.insert(movies).values({
          slug,
          title: input.title,
          storyboard: input.storyboard,
          finalCta: input.finalCta,
          userEmail: input.userEmail,
          role: input.role,
          industry: input.industry,
        });

        void generateAndPersistStoryboardVideos(slug, input.storyboard).catch(
          error => {
            console.error("[Cinema] Failed to generate storyboard videos:", error);
          }
        );

        return { success: true, slug };
      }),

    list: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(movies).orderBy(desc(movies.createdAt)).limit(20);
      }),
      
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(movies).where(eq(movies.slug, input.slug)).limit(1);
        return result[0] || null;
      }),
  }),

  emailCaptures: router({
    save: rateLimitedPublicProcedure({ windowMs: 60 * 60 * 1000, max: 30, keyPrefix: "email-capture" })
      .input(z.object({
        email: z.string().email("Please enter a valid email address"),
        role: z.string().optional(),
        industry: z.string().optional(),
        signal: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await saveEmailCapture(input);
        return { success: true };
      }),
  }),

  insights: router({
    generate: rateLimitedPublicProcedure({ windowMs: 10 * 60 * 1000, max: 5, keyPrefix: "insights-generate" })
      .input(z.object({
        signalId: z.string(),
        signalTitle: z.string(),
        signalTruth: z.string(),
        role: z.string(),
        industry: z.string(),
        rawInput: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await generateInsight(input);
        return result;
      }),
  }),

  live: router({
    session: rateLimitedPublicProcedure({ windowMs: 10 * 60 * 1000, max: 20, keyPrefix: "live-session" })
      .input(
        z.object({
          name: z.string().trim().max(80).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createThirdMarkLiveSession(input);
      }),
    report: rateLimitedPublicProcedure({ windowMs: 10 * 60 * 1000, max: 30, keyPrefix: "live-report" })
      .input(
        z.object({
          visitorName: z.string().trim().max(80).optional(),
          transcript: z.string().trim().min(1).max(20_000),
          messageCount: z.number().int().min(0).max(200).optional(),
          userTurns: z.number().int().min(0).max(100).optional(),
          revealSlug: z.string().trim().max(120).nullable().optional(),
          messages: z
            .array(
              z.object({
                role: z.enum(["guide", "user", "model"]),
                text: z.string().trim().min(1).max(4_000),
              })
            )
            .max(80)
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await reportThirdMarkConversationToAlfred(input);
      }),
    briefing: rateLimitedPublicProcedure({ windowMs: 10 * 60 * 1000, max: 30, keyPrefix: "live-briefing" })
      .input(
        z.object({
          visitorName: z.string().trim().max(80).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await fetchSignalCardBriefing(input.visitorName);
      }),
    operatorAction: rateLimitedPublicProcedure({ windowMs: 10 * 60 * 1000, max: 30, keyPrefix: "live-operator-action" })
      .input(
        z.object({
          visitorName: z.string().trim().max(80).optional(),
          transcript: z.string().trim().min(1).max(20_000),
          messageCount: z.number().int().min(0).max(200).optional(),
          userTurns: z.number().int().min(0).max(100).optional(),
          messages: z
            .array(
              z.object({
                role: z.enum(["guide", "user", "model"]),
                text: z.string().trim().min(1).max(4_000),
              })
            )
            .max(80)
            .optional(),
          title: z.string().trim().min(1).max(140),
          summary: z.string().trim().min(1).max(4_000),
          audience: z.string().trim().min(1).max(64),
          opportunity: z.string().trim().min(1).max(300),
          nextStep: z.string().trim().min(1).max(300),
          urgency: z.enum(["low", "normal", "high"]).default("normal"),
          requestedFor: z.enum(["operator", "alfred"]).default("operator"),
          proofToShow: z.array(z.string().trim().min(1).max(240)).max(8).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await fileSignalCardOperatorAction(input);
      }),
    reports: router({
      list: adminProcedure
        .query(async () => {
          const db = await getDb();
          if (!db) return [];
          return await db
            .select()
            .from(signalCardConversations)
            .orderBy(desc(signalCardConversations.createdAt))
            .limit(50);
        }),
      get: adminProcedure
        .input(
          z.object({
            reportId: z.string().trim().min(1).max(64),
          })
        )
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return null;
          const result = await db
            .select()
            .from(signalCardConversations)
            .where(eq(signalCardConversations.reportId, input.reportId))
            .limit(1);
          return result[0] ?? null;
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
