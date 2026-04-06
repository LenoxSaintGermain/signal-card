export const SIGNAL_CARD_OPERATOR_BRIEF_TOOL = "file_operator_brief";
export const SIGNAL_CARD_REFRESH_BRIEFING_TOOL = "pull_current_briefing";
export const SIGNAL_CARD_CONTACT_CAPTURE_TOOL = "request_contact_capture";

export const SIGNAL_CARD_LIVE_TOOL_DECLARATIONS = [
  {
    name: SIGNAL_CARD_OPERATOR_BRIEF_TOOL,
    description:
      "File a concise operator brief into the shared Third Signal coordination lane when the conversation reveals a real opportunity, handoff, follow-up, or actionable request for Alfred, admin, or the team.",
    parametersJsonSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          description:
            "Short title for the brief, written like an operator-facing subject line.",
        },
        summary: {
          type: "string",
          description:
            "What happened and why it matters, in 1 to 3 sentences.",
        },
        audience: {
          type: "string",
          description:
            "Who this signal is about, such as client, partner, investor, operator, guest, or other.",
        },
        opportunity: {
          type: "string",
          description:
            "The concrete business, relationship, or operating opportunity surfaced by the conversation.",
        },
        nextStep: {
          type: "string",
          description:
            "The one best next step the team should take from here.",
        },
        urgency: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "How urgent this brief feels for the team.",
        },
        requestedFor: {
          type: "string",
          enum: ["operator", "alfred"],
          description:
            "Who this brief is primarily for. Use alfred when the visitor explicitly wants Alfred looped in.",
        },
        proofToShow: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional proof surfaces or artifacts the team should show next.",
        },
      },
      required: [
        "title",
        "summary",
        "audience",
        "opportunity",
        "nextStep",
        "urgency",
        "requestedFor",
      ],
      propertyOrdering: [
        "title",
        "summary",
        "audience",
        "opportunity",
        "nextStep",
        "urgency",
        "requestedFor",
        "proofToShow",
      ],
    },
  },
  {
    name: SIGNAL_CARD_REFRESH_BRIEFING_TOOL,
    description:
      "Pull a fresh Swarm-backed briefing when the visitor asks what is current now, asks for the latest proof, or when fresher ecosystem context would sharpen the answer.",
    parametersJsonSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        focus: {
          type: "string",
          description:
            "What needs a refreshed briefing right now, such as latest work, current proof surfaces, partner traction, research, or orbital capabilities.",
        },
      },
      required: ["focus"],
      propertyOrdering: ["focus"],
    },
  },
  {
    name: SIGNAL_CARD_CONTACT_CAPTURE_TOOL,
    description:
      "Open a genuine follow-up form when the line needs real contact details before Alfred or the team can follow up. Use this instead of claiming the team will reach out when you only know the visitor's name.",
    parametersJsonSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          description:
            "Short operator-facing subject line for the follow-up opportunity.",
        },
        summary: {
          type: "string",
          description:
            "What happened and why a follow-up matters, in 1 to 3 sentences.",
        },
        audience: {
          type: "string",
          description:
            "Who this signal is about, such as client, partner, investor, operator, guest, or other.",
        },
        opportunity: {
          type: "string",
          description:
            "The concrete opportunity or need surfaced on the line.",
        },
        nextStep: {
          type: "string",
          description:
            "The one best next move once contact details are captured.",
        },
        urgency: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "How urgent this follow-up feels for the team.",
        },
        requestedFor: {
          type: "string",
          enum: ["operator", "alfred"],
          description:
            "Who should receive the follow-up brief after contact capture.",
        },
        reason: {
          type: "string",
          description:
            "A short, human-readable explanation for why the form is appearing.",
        },
        proofToShow: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional proof surfaces or artifacts the team should show next.",
        },
      },
      required: [
        "title",
        "summary",
        "audience",
        "opportunity",
        "nextStep",
        "urgency",
        "requestedFor",
        "reason",
      ],
      propertyOrdering: [
        "title",
        "summary",
        "audience",
        "opportunity",
        "nextStep",
        "urgency",
        "requestedFor",
        "reason",
        "proofToShow",
      ],
    },
  },
] as const;
