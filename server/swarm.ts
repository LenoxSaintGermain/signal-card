import type { ThirdMarkCurrentIntelligence } from "@shared/thirdMark";
import {
  normalizeSignalCardAgentSettings,
  type SignalCardAgentSettings,
} from "@shared/signalCardAgentSettings";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { signalCardConversations } from "../drizzle/schema";

type SwarmChatResponse = {
  content?: string;
  artifact?: unknown;
};

type SwarmCoordinationBriefingResponse = {
  summary?: string;
  proof_surfaces?: unknown;
  latest_research?: unknown;
  orbital_capabilities?: unknown;
  brand_principles?: unknown;
  routing_notes?: unknown;
  freshness?: string;
};

type SwarmCoordinationReportResponse = {
  ok?: boolean;
  reportId?: string;
  intelligenceId?: string;
  storedAt?: number;
};

type SwarmSignalCardAgentSettingsResponse = {
  ok?: boolean;
  settings?: {
    prompt_version?: string;
    core_identity?: string;
    conversation_contract?: string;
    lenox_directive?: string;
    guest_directive?: string;
    alfred_directive?: string;
    operator_notes?: string;
    voice_name?: string;
    turn_taking_style?: string;
    lenox_aliases?: unknown;
    alfred_aliases?: unknown;
    trusted_vip_aliases?: unknown;
    updated_at?: number | null;
    updated_by?: string | null;
  } | null;
};

export interface ThirdMarkConversationReportInput {
  visitorName?: string;
  transcript: string;
  messageCount?: number;
  userTurns?: number;
  revealSlug?: string | null;
  messages?: Array<{
    role: "guide" | "user" | "model";
    text: string;
  }>;
}

export interface ThirdMarkConversationReport {
  summary: string;
  audience: string;
  opportunity: string;
  nextStep: string;
  urgency: string;
  proofToShow: string[];
}

export interface ThirdMarkConversationReportResult {
  notified: boolean;
  persisted: boolean;
  reportId: string | null;
  report: ThirdMarkConversationReport;
}

export interface SignalCardOperatorActionInput {
  visitorName?: string;
  transcript: string;
  messageCount?: number;
  userTurns?: number;
  messages?: Array<{
    role: "guide" | "user" | "model";
    text: string;
  }>;
  title: string;
  summary: string;
  audience: string;
  opportunity: string;
  nextStep: string;
  urgency: "low" | "normal" | "high";
  requestedFor: "operator" | "alfred";
  proofToShow?: string[];
}

export interface SignalCardOperatorActionResult {
  persisted: boolean;
  reportId: string | null;
  title: string;
  summary: string;
  nextStep: string;
}

function getSwarmEndpoint(pathname: string) {
  if (!ENV.swarmBackendUrl) {
    return null;
  }

  const url = new URL(pathname, ENV.swarmBackendUrl.endsWith("/") ? ENV.swarmBackendUrl : `${ENV.swarmBackendUrl}/`);
  return url.toString();
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear() {
      clearTimeout(timer);
    },
  };
}

async function callSwarmChat(prompt: string) {
  return callSwarmJsonEndpoint<SwarmChatResponse>("/api/chat", {
    text: prompt,
    space_id: "signal-card",
    sender_id: "signal-card",
  });
}

async function callSwarmJsonEndpoint<T>(
  pathname: string,
  payload: Record<string, unknown>,
  options?: {
    method?: "POST" | "GET";
    headers?: Record<string, string>;
  }
) {
  const endpoint = getSwarmEndpoint(pathname);
  if (!endpoint) {
    return null;
  }

  const timeout = createTimeoutSignal(ENV.swarmRequestTimeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: options?.method ?? "POST",
      headers: {
        "content-type": "application/json",
        ...getSwarmOperatorHeaders(),
        ...(options?.headers ?? {}),
      },
      body: (options?.method ?? "POST") === "GET" ? undefined : JSON.stringify(payload),
      signal: timeout.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`[Swarm] ${pathname} failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`);
    }

    const json = (await response.json()) as T;
    return json;
  } finally {
    timeout.clear();
  }
}

function getSwarmOperatorHeaders(): Record<string, string> {
  if (!ENV.swarmOperatorApiKey) {
    return {};
  }

  return {
    "x-swarm-operator-key": ENV.swarmOperatorApiKey,
    "x-orbital-admin-key": ENV.swarmOperatorApiKey,
  };
}

function extractJsonCandidate(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? value;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return candidate.trim();
  }
  return candidate.slice(firstBrace, lastBrace + 1).trim();
}

function normalizeStringArray(value: unknown, maxItems = 6) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function parseBriefing(payload: string): ThirdMarkCurrentIntelligence | null {
  try {
    const parsed = JSON.parse(extractJsonCandidate(payload)) as Record<string, unknown>;

    const summary = String(parsed.summary ?? "").trim();
    if (!summary) {
      return null;
    }

    return {
      summary,
      proofSurfaces: normalizeStringArray(parsed.proof_surfaces),
      latestResearch: normalizeStringArray(parsed.latest_research),
      orbitalCapabilities: normalizeStringArray(parsed.orbital_capabilities),
      brandPrinciples: normalizeStringArray(parsed.brand_principles),
      routingNotes: normalizeStringArray(parsed.routing_notes),
      freshness: String(parsed.freshness ?? "unknown").trim() || "unknown",
    };
  } catch {
    return null;
  }
}

function parseConversationReport(payload: string): ThirdMarkConversationReport | null {
  try {
    const parsed = JSON.parse(extractJsonCandidate(payload)) as Record<string, unknown>;
    const summary = String(parsed.summary ?? "").trim();
    const audience = String(parsed.audience ?? "").trim();
    const opportunity = String(parsed.opportunity ?? "").trim();
    const nextStep = String(parsed.next_step ?? "").trim();
    const urgency = String(parsed.urgency ?? "").trim();

    if (!summary || !nextStep) {
      return null;
    }

    return {
      summary,
      audience: audience || "unknown",
      opportunity: opportunity || "not yet classified",
      nextStep,
      urgency: urgency || "normal",
      proofToShow: normalizeStringArray(parsed.proof_to_show),
    };
  } catch {
    return null;
  }
}

function parseSignalCardAgentSettings(
  payload?: SwarmSignalCardAgentSettingsResponse | null
): SignalCardAgentSettings | null {
  const settings = payload?.settings;
  if (!settings) {
    return null;
  }

  return normalizeSignalCardAgentSettings({
    promptVersion: settings.prompt_version,
    coreIdentity: settings.core_identity,
    conversationContract: settings.conversation_contract,
    lenoxDirective: settings.lenox_directive,
    guestDirective: settings.guest_directive,
    alfredDirective: settings.alfred_directive,
    operatorNotes: settings.operator_notes,
    voiceName: settings.voice_name,
    turnTakingStyle: settings.turn_taking_style as SignalCardAgentSettings["turnTakingStyle"],
    lenoxAliases: Array.isArray(settings.lenox_aliases) ? settings.lenox_aliases.map(value => String(value)) : [],
    alfredAliases: Array.isArray(settings.alfred_aliases) ? settings.alfred_aliases.map(value => String(value)) : [],
    trustedVipAliases: Array.isArray(settings.trusted_vip_aliases) ? settings.trusted_vip_aliases.map(value => String(value)) : [],
    updatedAt: typeof settings.updated_at === "number" ? settings.updated_at : null,
    updatedBy: typeof settings.updated_by === "string" ? settings.updated_by : null,
  });
}

function buildBriefingPrompt(visitorName?: string) {
  return `You are the ecosystem context plane for Third Signal.

Prepare a live briefing for Signal Card, the front-line concierge agent.
Focus on what is current across the ecosystem right now:
- latest case studies and proof from Signal Spark
- latest showcase surfaces
- latest research that should influence the talk track
- latest Orbital armory and manifest capabilities
- the active brand guide constraints that should shape tone and routing

Visitor name: ${visitorName?.trim() || "unknown"}

Return JSON only with this exact shape:
{
  "summary": "2-4 sentences max",
  "proof_surfaces": ["..."],
  "latest_research": ["..."],
  "orbital_capabilities": ["..."],
  "brand_principles": ["..."],
  "routing_notes": ["..."],
  "freshness": "ISO date or concise freshness note"
}

Keep every list concise and current. If something is unclear, say so briefly instead of inventing it.`;
}

function buildConversationReportPrompt(input: ThirdMarkConversationReportInput) {
  const transcript = truncate(input.transcript, 12_000);
  const messageLog = (input.messages ?? [])
    .slice(-18)
    .map(message => `${message.role}: ${message.text}`)
    .join("\n");

  return `You are Alfred's summarization lane for Third Signal.

Summarize this Signal Card conversation for Lenox and the admin layer.
Classify who the visitor is, what they actually want, what proof surface should follow, and the single best next move.

Visitor name: ${input.visitorName?.trim() || "unknown"}
User turns: ${input.userTurns ?? 0}
Message count: ${input.messageCount ?? 0}
Reveal slug: ${input.revealSlug ?? "none"}

Transcript:
${transcript}

Recent message log:
${messageLog || "none"}

Return JSON only with this exact shape:
{
  "summary": "3-5 sentences max",
  "audience": "client | partner | investor | operator | press | other",
  "opportunity": "what they actually need",
  "next_step": "one concrete next move",
  "urgency": "low | normal | high",
  "proof_to_show": ["specific proof surfaces or artifacts to route them toward"]
}`;
}

function buildFallbackConversationReport(input: ThirdMarkConversationReportInput): ThirdMarkConversationReport {
  return {
    summary: truncate(input.transcript.replace(/\s+/g, " ").trim(), 340),
    audience: "unknown",
    opportunity: "Needs manual review from the conversation transcript.",
    nextStep: "Review transcript and route manually inside admin.",
    urgency: "normal",
    proofToShow: [],
  };
}

export async function fetchSignalCardBriefing(visitorName?: string) {
  if (!ENV.swarmBackendUrl) {
    return null;
  }

  try {
    try {
      const directBriefing = await callSwarmJsonEndpoint<SwarmCoordinationBriefingResponse>(
        "/api/coordination/briefing",
        {
          source: "signal-card",
          surface: "Signal Card",
          visitor_name: visitorName?.trim() || null,
          intent: "Orientation, qualification, and routing through a live cinematic conversation",
        }
      );

      const directSummary = String(directBriefing?.summary ?? "").trim();
      if (directSummary) {
        return {
          summary: directSummary,
          proofSurfaces: normalizeStringArray(directBriefing?.proof_surfaces),
          latestResearch: normalizeStringArray(directBriefing?.latest_research),
          orbitalCapabilities: normalizeStringArray(directBriefing?.orbital_capabilities),
          brandPrinciples: normalizeStringArray(directBriefing?.brand_principles),
          routingNotes: normalizeStringArray(directBriefing?.routing_notes),
          freshness: String(directBriefing?.freshness ?? "unknown").trim() || "unknown",
        };
      }
    } catch (error) {
      console.warn("[Swarm] Coordination briefing endpoint unavailable, falling back to chat:", error);
    }

    const response = await callSwarmChat(buildBriefingPrompt(visitorName));
    const content = typeof response?.content === "string" ? response.content : "";
    const briefing = parseBriefing(content);
    if (briefing) {
      return briefing;
    }

    console.warn("[Swarm] Unable to parse Signal Card briefing payload.");
    return null;
  } catch (error) {
    console.warn("[Swarm] Failed to fetch Signal Card briefing:", error);
    return null;
  }
}

export async function fetchSignalCardAgentSettings() {
  if (!ENV.swarmBackendUrl || !ENV.swarmOperatorApiKey) {
    return null;
  }

  try {
    const response = await callSwarmJsonEndpoint<SwarmSignalCardAgentSettingsResponse>(
      "/api/agent-settings/signal-card",
      {},
      {
        method: "GET",
        headers: getSwarmOperatorHeaders(),
      }
    );
    return parseSignalCardAgentSettings(response);
  } catch (error) {
    console.warn("[Swarm] Failed to fetch Signal Card agent settings:", error);
    return null;
  }
}

export async function reportThirdMarkConversationToAlfred(input: ThirdMarkConversationReportInput) {
  let report = buildFallbackConversationReport(input);
  let persisted = false;
  let reportId: string | null = null;

  if (ENV.swarmBackendUrl) {
    try {
      const response = await callSwarmChat(buildConversationReportPrompt(input));
      const content = typeof response?.content === "string" ? response.content : "";
      const parsed = parseConversationReport(content);
      if (parsed) {
        report = parsed;
      }
    } catch (error) {
      console.warn("[Swarm] Failed to summarize Signal Card conversation:", error);
    }
  }

  let notified = false;
  if (ENV.swarmBackendUrl) {
    try {
      reportId = `sig-${nanoid(10)}`;
      const coordination = await callSwarmJsonEndpoint<SwarmCoordinationReportResponse>(
        "/api/coordination/report",
        {
          source: "signal-card",
          surface: "Signal Card",
          report_id: reportId,
          title: "Signal Card conversation report",
          visitor_name: input.visitorName?.trim() || null,
          audience: report.audience,
          opportunity: report.opportunity,
          next_step: report.nextStep,
          urgency: report.urgency,
          summary: report.summary,
          transcript: truncate(input.transcript, 12_000),
          reveal_slug: input.revealSlug?.trim() || null,
          proof_to_show: report.proofToShow,
          message_count: input.messageCount ?? null,
          user_turns: input.userTurns ?? null,
          messages: input.messages ?? [],
          tags: ["signal-card", "conversation", report.audience].filter(Boolean),
        }
      );

      if (coordination?.ok) {
        persisted = true;
        reportId = coordination.reportId ?? reportId;
      }
    } catch (error) {
      console.warn("[Signal Card] Failed to persist coordination report via Swarm:", error);
    }
  }

  const content = [
    `Visitor: ${input.visitorName?.trim() || "unknown"}`,
    `Audience: ${report.audience}`,
    `Opportunity: ${report.opportunity}`,
    `Next step: ${report.nextStep}`,
    `Urgency: ${report.urgency}`,
    report.proofToShow.length > 0 ? `Proof to show: ${report.proofToShow.join("; ")}` : null,
    input.revealSlug ? `Reveal slug: ${input.revealSlug}` : null,
    reportId ? `Report id: ${reportId}` : null,
    "",
    "Summary:",
    report.summary,
    "",
    "Transcript:",
    truncate(input.transcript, 12_000),
  ]
    .filter(Boolean)
    .join("\n");

  const db = await getDb();

  if (!db) {
    console.warn("[Signal Card] Database unavailable; skipping conversation persistence.");
  } else {
    try {
      const localReportId = reportId ?? `sig-${nanoid(10)}`;
      await db.insert(signalCardConversations).values({
        reportId: localReportId,
        visitorName: input.visitorName?.trim() || null,
        transcript: truncate(input.transcript, 20_000),
        summary: report.summary,
        audience: report.audience,
        opportunity: report.opportunity,
        nextStep: report.nextStep,
        urgency: report.urgency,
        proofToShow: report.proofToShow,
        revealSlug: input.revealSlug?.trim() || null,
        messageCount: input.messageCount ?? null,
        userTurns: input.userTurns ?? null,
        messages: input.messages ?? [],
        notifiedOwner: 0,
      });
      persisted = true;
      reportId = localReportId;
    } catch (error) {
      console.warn("[Signal Card] Failed to persist conversation report:", error);
    }
  }

  if (!persisted && ENV.forgeApiUrl && ENV.forgeApiKey) {
    try {
      notified = await notifyOwner({
        title: "Signal Card conversation reported to Alfred",
        content,
      });
    } catch (error) {
      console.warn("[Signal Card] Failed to notify Alfred about conversation:", error);
    }
  }

  return {
    notified,
    persisted,
    reportId,
    report,
  };
}

export async function fileSignalCardOperatorAction(
  input: SignalCardOperatorActionInput
): Promise<SignalCardOperatorActionResult> {
  const sanitizedTitle =
    truncate(input.title.trim() || "Signal Card operator brief", 140);
  const sanitizedSummary =
    truncate(input.summary.trim() || "Signal Card captured an operator-facing signal.", 4_000);
  const sanitizedAudience = truncate(input.audience.trim() || "operator", 64);
  const sanitizedOpportunity =
    truncate(input.opportunity.trim() || "Operator follow-up requested from the line.", 300);
  const sanitizedNextStep =
    truncate(input.nextStep.trim() || "Review the captured signal and choose the next move.", 300);
  const proofToShow = normalizeStringArray(input.proofToShow, 8);
  const targetTag = input.requestedFor === "alfred" ? "alfred-request" : "operator-brief";

  let persisted = false;
  let reportId: string | null = null;

  if (ENV.swarmBackendUrl) {
    try {
      reportId = `sig-${nanoid(10)}`;
      const coordination = await callSwarmJsonEndpoint<SwarmCoordinationReportResponse>(
        "/api/coordination/report",
        {
          source: "signal-card",
          surface: "Signal Card",
          report_id: reportId,
          title: sanitizedTitle,
          visitor_name: input.visitorName?.trim() || null,
          audience: sanitizedAudience,
          opportunity: sanitizedOpportunity,
          next_step: sanitizedNextStep,
          urgency: input.urgency,
          summary: sanitizedSummary,
          transcript: truncate(input.transcript, 12_000),
          reveal_slug: null,
          proof_to_show: proofToShow,
          message_count: input.messageCount ?? null,
          user_turns: input.userTurns ?? null,
          messages: input.messages ?? [],
          tags: [
            "signal-card",
            "conversation",
            targetTag,
            sanitizedAudience,
          ].filter(Boolean),
        }
      );

      if (coordination?.ok) {
        persisted = true;
        reportId = coordination.reportId ?? reportId;
      }
    } catch (error) {
      console.warn("[Signal Card] Failed to persist operator action via Swarm:", error);
    }
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Signal Card] Database unavailable; skipping local operator action persistence.");
  } else {
    try {
      const localReportId = reportId ?? `sig-${nanoid(10)}`;
      await db.insert(signalCardConversations).values({
        reportId: localReportId,
        visitorName: input.visitorName?.trim() || null,
        transcript: truncate(input.transcript, 20_000),
        summary: sanitizedSummary,
        audience: sanitizedAudience,
        opportunity: sanitizedOpportunity,
        nextStep: sanitizedNextStep,
        urgency: input.urgency,
        proofToShow,
        revealSlug: null,
        messageCount: input.messageCount ?? null,
        userTurns: input.userTurns ?? null,
        messages: input.messages ?? [],
        notifiedOwner: 0,
      });
      persisted = true;
      reportId = localReportId;
    } catch (error) {
      console.warn("[Signal Card] Failed to persist operator action locally:", error);
    }
  }

  return {
    persisted,
    reportId,
    title: sanitizedTitle,
    summary: sanitizedSummary,
    nextStep: sanitizedNextStep,
  };
}
