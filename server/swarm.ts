import type { ThirdMarkCurrentIntelligence } from "@shared/thirdMark";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";

type SwarmChatResponse = {
  content?: string;
  artifact?: unknown;
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
  const endpoint = getSwarmEndpoint("/api/chat");
  if (!endpoint) {
    return null;
  }

  const timeout = createTimeoutSignal(ENV.swarmRequestTimeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        space_id: "signal-card",
        sender_id: "signal-card",
      }),
      signal: timeout.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `[Swarm] /api/chat failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
    }

    const json = (await response.json()) as SwarmChatResponse;
    return json;
  } finally {
    timeout.clear();
  }
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
    const response = await callSwarmChat(buildBriefingPrompt(visitorName));
    const content = typeof response?.content === "string" ? response.content : "";
    const briefing = parseBriefing(content);
    if (!briefing) {
      console.warn("[Swarm] Unable to parse Signal Card briefing payload.");
      return null;
    }
    return briefing;
  } catch (error) {
    console.warn("[Swarm] Failed to fetch Signal Card briefing:", error);
    return null;
  }
}

export async function reportThirdMarkConversationToAlfred(input: ThirdMarkConversationReportInput) {
  let report = buildFallbackConversationReport(input);

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
  const content = [
    `Visitor: ${input.visitorName?.trim() || "unknown"}`,
    `Audience: ${report.audience}`,
    `Opportunity: ${report.opportunity}`,
    `Next step: ${report.nextStep}`,
    `Urgency: ${report.urgency}`,
    report.proofToShow.length > 0 ? `Proof to show: ${report.proofToShow.join("; ")}` : null,
    input.revealSlug ? `Reveal slug: ${input.revealSlug}` : null,
    "",
    "Summary:",
    report.summary,
    "",
    "Transcript:",
    truncate(input.transcript, 12_000),
  ]
    .filter(Boolean)
    .join("\n");

  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
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
    report,
  };
}
