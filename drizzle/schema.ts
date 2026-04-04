import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Email captures table for lead generation
 * Stores visitor information when they request insights
 */
export const emailCaptures = mysqlTable("emailCaptures", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: varchar("role", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  signal: varchar("signal", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = typeof emailCaptures.$inferInsert;

/**
 * Video cache table for storing generated videos
 * Reduces API costs and latency by caching videos based on prompt hash
 */
export const videoCache = mysqlTable("videoCache", {
  id: int("id").autoincrement().primaryKey(),
  /** SHA-256 hash of the visual prompt for deduplication */
  promptHash: varchar("promptHash", { length: 64 }).notNull().unique(),
  /** Original visual prompt text */
  visualPrompt: text("visualPrompt").notNull(),
  /** URL to the generated video in S3 storage */
  videoUrl: text("videoUrl").notNull(),
  /** Video style used for generation */
  videoStyle: varchar("videoStyle", { length: 50 }),
  /** Mood/tone of the video */
  mood: varchar("mood", { length: 50 }),
  /** Number of times this cached video has been reused */
  hitCount: int("hitCount").default(0).notNull(),
  /** Last time this cache entry was accessed */
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoCache = typeof videoCache.$inferSelect;
export type InsertVideoCache = typeof videoCache.$inferInsert;

/**
 * Cinema Movies table
 * Stores the full generated storyboard experience for replay
 */
export const movies = mysqlTable("movies", {
  id: int("id").autoincrement().primaryKey(),
  /** The unique slug or ID for sharing/URL */
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  /** Title of the movie/insight */
  title: text("title").notNull(),
  /** JSON blob of the full storyboard (scenes, text, video URLs) */
  storyboard: json("storyboard").notNull(),
  /** The final CTA text */
  finalCta: text("finalCta"),
  /** User email who generated this */
  userEmail: varchar("userEmail", { length: 320 }),
  /** Role context used for generation */
  role: varchar("role", { length: 100 }),
  /** Industry context used for generation */
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = typeof movies.$inferInsert;

/**
 * Signal Card conversation reports
 * Stores structured summaries and transcripts for Alfred/admin follow-through.
 */
export const signalCardConversations = mysqlTable("signalCardConversations", {
  id: int("id").autoincrement().primaryKey(),
  /** Stable report identifier for admin surfaces */
  reportId: varchar("reportId", { length: 64 }).notNull().unique(),
  /** Visitor name, if offered */
  visitorName: varchar("visitorName", { length: 120 }),
  /** Full transcript captured at reveal/report time */
  transcript: text("transcript").notNull(),
  /** Structured Swarm/Alfred summary */
  summary: text("summary").notNull(),
  /** Who this visitor appears to be */
  audience: varchar("audience", { length: 40 }),
  /** What they actually need */
  opportunity: text("opportunity"),
  /** Best concrete next move */
  nextStep: text("nextStep"),
  /** low | normal | high */
  urgency: varchar("urgency", { length: 24 }),
  /** Proof surfaces or artifacts to show next */
  proofToShow: json("proofToShow"),
  /** Reveal artifact slug if one was generated */
  revealSlug: varchar("revealSlug", { length: 120 }),
  /** Raw message count captured from the session */
  messageCount: int("messageCount"),
  /** Number of user turns observed */
  userTurns: int("userTurns"),
  /** Raw message payload for downstream admin review */
  messages: json("messages"),
  /** Whether Alfred owner notification accepted the payload */
  notifiedOwner: int("notifiedOwner").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalCardConversation = typeof signalCardConversations.$inferSelect;
export type InsertSignalCardConversation = typeof signalCardConversations.$inferInsert;
