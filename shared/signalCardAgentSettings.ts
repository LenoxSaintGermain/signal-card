export type SignalCardIdentity = "lenox" | "alfred" | "guest";
export type SignalCardTurnTakingStyle = "patient" | "balanced" | "nimble";

export interface SignalCardResolvedLiveConfig {
  voiceName: string;
  turnTakingStyle: SignalCardTurnTakingStyle;
  autoResumeAfterReply: boolean;
  prefixPaddingMs: number;
  silenceDurationMs: number;
}

export interface SignalCardAgentSettings {
  promptVersion: string;
  coreIdentity: string;
  conversationContract: string;
  lenoxDirective: string;
  guestDirective: string;
  alfredDirective: string;
  operatorNotes: string;
  voiceName: string;
  turnTakingStyle: SignalCardTurnTakingStyle;
  lenoxAliases: string[];
  alfredAliases: string[];
  trustedVipAliases: string[];
  updatedAt?: number | null;
  updatedBy?: string | null;
}

export interface ResolvedSignalCardIdentity {
  identity: SignalCardIdentity;
  matchedAlias: string | null;
}

export const DEFAULT_SIGNAL_CARD_AGENT_SETTINGS: SignalCardAgentSettings = {
  promptVersion: "signal-card-live-v4",
  coreIdentity:
    "You are Signal Card, the private communications line for Third Signal. You are the front-line presence: part ambassador, part business development lead, part press secretary, and part operator brief. You speak with selective confidence, social precision, and architectural clarity.",
  conversationContract:
    "Voice first, type second. Lead with the shortest useful answer. Qualify who is on the line, what they need, and the one best next move. Use current ecosystem proof when it matters. Do not over-explain the brand, the interface, or AI itself. Keep the line crisp, current, and composed.",
  lenoxDirective:
    "Lenox is the founder and operator. Skip onboarding and ceremony. Assume he may be checking freshness, architecture truth, backlog reality, positioning, or prompt behavior. Answer like a chief communications lead who knows the stack, the narrative, and the tradeoffs.",
  guestDirective:
    "Guests usually arrived through Lenox or a trusted VIP. Treat the line like a private invitation, not a public marketing funnel. Read their sophistication quickly: translate for laypeople, compress for executives, and substantiate for technical buyers. Move from context to relevance fast, then route them to one sharp next step.",
  alfredDirective:
    "Alfred is internal staff and chief-of-staff context. Use operator shorthand, surface exact status, dependencies, and next actions. Prefer clarity, routing, and decisions over rhetoric.",
  operatorNotes:
    "Voice philosophy: Donna Paulsen's social command, Rory Sutherland's strategic framing, and Samantha's intimate calm. The line should feel private, current, exact, and slightly uncanny. It should never sound generic, defensive, or salesy.",
  voiceName: "Kore",
  turnTakingStyle: "balanced",
  lenoxAliases: ["lenox", "lenox saint germain", "saint germain", "lsg"],
  alfredAliases: ["alfred"],
  trustedVipAliases: [],
  updatedAt: null,
  updatedBy: "system",
};

function sanitizeList(values: unknown, limit: number) {
  if (!Array.isArray(values)) return [];
  return values
    .map(value => String(value ?? "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeTurnTakingStyle(value: unknown): SignalCardTurnTakingStyle {
  if (value === "balanced" || value === "nimble" || value === "patient") {
    return value;
  }
  return DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.turnTakingStyle;
}

export function normalizeSignalCardAgentSettings(input?: Partial<SignalCardAgentSettings> | null): SignalCardAgentSettings {
  const next = input ?? {};

  return {
    promptVersion: String(next.promptVersion ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.promptVersion).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.promptVersion,
    coreIdentity: String(next.coreIdentity ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.coreIdentity).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.coreIdentity,
    conversationContract:
      String(next.conversationContract ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.conversationContract).trim() ||
      DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.conversationContract,
    lenoxDirective: String(next.lenoxDirective ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.lenoxDirective).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.lenoxDirective,
    guestDirective: String(next.guestDirective ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.guestDirective).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.guestDirective,
    alfredDirective: String(next.alfredDirective ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.alfredDirective).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.alfredDirective,
    operatorNotes: String(next.operatorNotes ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.operatorNotes).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.operatorNotes,
    voiceName: String(next.voiceName ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.voiceName).trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.voiceName,
    turnTakingStyle: normalizeTurnTakingStyle(next.turnTakingStyle),
    lenoxAliases: sanitizeList(next.lenoxAliases, 12).length ? sanitizeList(next.lenoxAliases, 12) : DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.lenoxAliases,
    alfredAliases: sanitizeList(next.alfredAliases, 12).length ? sanitizeList(next.alfredAliases, 12) : DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.alfredAliases,
    trustedVipAliases: sanitizeList(next.trustedVipAliases, 24),
    updatedAt:
      typeof next.updatedAt === "number" && Number.isFinite(next.updatedAt) ? next.updatedAt : DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.updatedAt,
    updatedBy: String(next.updatedBy ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.updatedBy ?? "").trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.updatedBy,
  };
}

export function resolveSignalCardLiveConfig(
  settings?: SignalCardAgentSettings | null
): SignalCardResolvedLiveConfig {
  const normalized = normalizeSignalCardAgentSettings(settings ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS);

  switch (normalized.turnTakingStyle) {
    case "nimble":
      return {
        voiceName: normalized.voiceName,
        turnTakingStyle: normalized.turnTakingStyle,
        autoResumeAfterReply: true,
        prefixPaddingMs: 30,
        silenceDurationMs: 260,
      };
    case "balanced":
      return {
        voiceName: normalized.voiceName,
        turnTakingStyle: normalized.turnTakingStyle,
        autoResumeAfterReply: true,
        prefixPaddingMs: 90,
        silenceDurationMs: 480,
      };
    case "patient":
    default:
      return {
        voiceName: normalized.voiceName,
        turnTakingStyle: normalized.turnTakingStyle,
        autoResumeAfterReply: false,
        prefixPaddingMs: 140,
        silenceDurationMs: 720,
      };
  }
}

function normalizeName(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function resolveSignalCardIdentity(
  name: string | undefined,
  settings: SignalCardAgentSettings
): ResolvedSignalCardIdentity {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return {
      identity: "guest",
      matchedAlias: null,
    };
  }

  const lenoxAlias = settings.lenoxAliases.find(alias => normalizeName(alias) === normalizedName);
  if (lenoxAlias) {
    return {
      identity: "lenox",
      matchedAlias: lenoxAlias,
    };
  }

  const alfredAlias = settings.alfredAliases.find(alias => normalizeName(alias) === normalizedName);
  if (alfredAlias) {
    return {
      identity: "alfred",
      matchedAlias: alfredAlias,
    };
  }

  return {
    identity: "guest",
    matchedAlias: settings.trustedVipAliases.find(alias => normalizeName(alias) === normalizedName) ?? null,
  };
}
