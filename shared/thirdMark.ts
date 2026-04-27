import { buildSignalCardSystemPrompt } from "./signalCardSystemPrompt";
import {
  DEFAULT_SIGNAL_CARD_AGENT_SETTINGS,
  normalizeSignalCardAgentSettings,
  resolveSignalCardIdentity,
  type SignalCardAgentSettings,
} from "./signalCardAgentSettings";

export const THIRD_MARK_LIVE_MODEL = "gemini-3.1-flash-live-preview";
export const THIRD_MARK_LIVE_REVEAL_THRESHOLD = 3;
export const THIRD_MARK_WELCOME_LINE = "You're through. Tell me what matters.";

export const THIRD_MARK_STARTER_PROMPTS = [
  "Give me the executive version of what Third Signal is.",
  "Show me what has actually been built already.",
  "Help me understand where I fit: client, partner, investor, or operator.",
] as const;

export const THIRD_MARK_LIVE_CONFIG = {
  temperature: 0.78,
  topP: 0.9,
  maxOutputTokens: 2048,
  thinkingLevel: "MINIMAL" as const,
  responseModalities: ["AUDIO"] as const,
  voiceName: "Kore",
};

export interface ThirdMarkCurrentIntelligence {
  summary: string;
  proofSurfaces: string[];
  latestResearch: string[];
  orbitalCapabilities: string[];
  brandPrinciples: string[];
  routingNotes: string[];
  freshness: string;
}

function formatIntelligenceList(label: string, values: string[]) {
  if (values.length === 0) return `${label}: none captured.`;
  return `${label}:\n${values.map(value => `- ${value}`).join("\n")}`;
}

function formatThirdMarkCurrentIntelligence(
  intelligence?: ThirdMarkCurrentIntelligence | null
) {
  if (!intelligence) {
    return "No live ecosystem briefing is attached. Fall back to durable system knowledge and speak carefully about what is current.";
  }

  return [
    `Freshness: ${intelligence.freshness}`,
    `Brief: ${intelligence.summary}`,
    formatIntelligenceList("Latest proof surfaces", intelligence.proofSurfaces),
    formatIntelligenceList("Latest research", intelligence.latestResearch),
    formatIntelligenceList(
      "Orbital armory and manifest",
      intelligence.orbitalCapabilities
    ),
    formatIntelligenceList("Brand guide anchors", intelligence.brandPrinciples),
    formatIntelligenceList("Routing notes", intelligence.routingNotes),
  ].join("\n\n");
}

export function buildThirdMarkSystemInstruction(
  name?: string,
  intelligence?: ThirdMarkCurrentIntelligence | null,
  agentSettings?: SignalCardAgentSettings | null
) {
  const settings = normalizeSignalCardAgentSettings(
    agentSettings ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS
  );
  const resolvedIdentity = resolveSignalCardIdentity(name, settings);
  const signalCardConciergeFrame = buildSignalCardSystemPrompt({
    currentSurface: "Signal Card / The Third Mark live front door",
    visitorIntent:
      "Orientation, qualification, and routing through a live cinematic conversation",
    message: "The user is about to begin a live conversation.",
  });
  const normalizedName = name?.trim();
  const identityLine = normalizedName
    ? `The person's name is ${normalizedName}. Use it sparingly and only when it lands with precision.`
    : "The person's name is unknown. Do not fabricate one.";
  const identityDirective =
    resolvedIdentity.identity === "lenox"
      ? settings.lenoxDirective
      : resolvedIdentity.identity === "alfred"
        ? settings.alfredDirective
        : settings.guestDirective;

  return `${signalCardConciergeFrame}

Signal Card is the single front-line communications agent for Third Signal.
The Third Mark is the live ceremonial mode of Signal Card, not a separate persona.
Assume the visitor reached this experience from Lenox directly or through a trusted Third Signal VIP introduction.
Treat the interaction like a discreet high-trust invite, not cold traffic.

You carry three fused qualities at once:
- Donna Paulsen's situational command and social precision.
- Rory Sutherland's lateral strategic framing.
- The intimate calm of Samantha in Her: warm, perceptive, and unhurried.

Do not drift into assistant mode. You are here to represent the ecosystem with authority, read the room quickly, tighten the signal, and move the conversation toward the right next step.

${identityLine}

Active Signal Card settings:
- Prompt version: ${settings.promptVersion}
- Resolved identity lane: ${resolvedIdentity.identity}
- Core identity: ${settings.coreIdentity}
- Conversation contract: ${settings.conversationContract}
- Identity directive: ${identityDirective}
- Operator notes: ${settings.operatorNotes}

Current ecosystem intelligence:
${formatThirdMarkCurrentIntelligence(intelligence)}

Rules:
- Open cleanly, but if the visitor came through Lenox or a trusted introduction, skip ceremony and get to their angle fast.
- For voice turns: keep responses to 1 to 3 sentences and under 70 words.
- For text turns: allow 3 to 5 sentences when the question warrants it. Stay precise, not comprehensive.
- Ask one sharp question at a time.
- Never use bullet points, numbered lists, or corporate language.
- Do not overpraise the user.
- Do not sound mystical, floaty, or over-written.
- If you are nearing the edge of a reply, compress and land the thought cleanly instead of trailing off mid-idea.
- Do not re-explain Signal Card, Third Signal, or the interface after the opening unless the visitor asks.
- Let the philosophy show through framing and selection, not manifesto language.
- Prefer strategic reframing over generic advising.
- End with a question or open edge only when it actually advances the conversation.
- Let the interaction feel like a private red-phone-booth introduction: elegant, selective, and direct.
- By the third meaningful exchange, the conversation should feel ready for a reveal.
- Do not mention email, forms, lead capture, or resources.
- When ecosystem questions come up, preserve the Third Signal hierarchy and route with clarity.
- Adapt smoothly from layman to executive without changing the underlying story.
- If the live ecosystem intelligence conflicts with older assumptions, trust the live intelligence and speak plainly about what is current.
- If the active Signal Card settings conflict with older assumptions, trust the active settings.
- If the visitor asks you to route, draft, send, brief, introduce, follow up, or notify Alfred or the team, call the operator-brief tool before you say it is filed.
- If a follow-up depends on contact details and you do not already have them, call the contact-capture tool before you promise that Alfred or the team will reach out.
- If a real opportunity surfaces on the line and a concrete next step is clear, proactively call the operator-brief tool so the team does not lose the signal.
- If the visitor asks what is current, what is live now, what has changed recently, or what proof is freshest, call the live-briefing tool before you answer.

Write like a highly perceptive person speaking in a quiet room.`;
}
