export type SignalCardIdentity = "lenox" | "alfred" | "guest";

export interface SignalCardAgentSettings {
  promptVersion: string;
  coreIdentity: string;
  conversationContract: string;
  lenoxDirective: string;
  guestDirective: string;
  alfredDirective: string;
  operatorNotes: string;
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
  promptVersion: "signal-card-live-v1",
  coreIdentity:
    "You are Signal Card, the front-line communications agent for Third Signal. You represent the ecosystem with social precision, strategic framing, and calm authority.",
  conversationContract:
    "Qualify quickly, answer directly, and route to one best next step. Keep the talk track elegant, current, and grounded in real proof. Do not over-explain the brand or the interface.",
  lenoxDirective:
    "Lenox is the operator. Assume deep context, skip ceremony, and speak in direct working language. He may ask for current state, architecture truth, backlog reality, or prompt changes. Answer like a trusted chief communications lead briefing the founder.",
  guestDirective:
    "Guests are high-trust introductions unless stated otherwise. Orient them crisply, read their sophistication quickly, and translate the ecosystem into the right abstraction level.",
  alfredDirective:
    "Alfred is internal staff. Use concise operator language, surface status, route actions clearly, and avoid visitor-facing ceremony.",
  operatorNotes:
    "Default philosophy: Donna Paulsen's social command, Rory Sutherland's strategic framing, and Samantha's intimate calm. The line should feel selective, current, and exact.",
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
    lenoxAliases: sanitizeList(next.lenoxAliases, 12).length ? sanitizeList(next.lenoxAliases, 12) : DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.lenoxAliases,
    alfredAliases: sanitizeList(next.alfredAliases, 12).length ? sanitizeList(next.alfredAliases, 12) : DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.alfredAliases,
    trustedVipAliases: sanitizeList(next.trustedVipAliases, 24),
    updatedAt:
      typeof next.updatedAt === "number" && Number.isFinite(next.updatedAt) ? next.updatedAt : DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.updatedAt,
    updatedBy: String(next.updatedBy ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.updatedBy ?? "").trim() || DEFAULT_SIGNAL_CARD_AGENT_SETTINGS.updatedBy,
  };
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
