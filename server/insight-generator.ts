import { ENV } from "./_core/env";

interface InsightInput {
  signalId: string;
  signalTitle: string;
  signalTruth: string;
  role: string;
  industry: string;
}

interface InsightOutput {
  title: string;
  body: string;
  implication: string;
  metrics: string[];
}

/**
 * Generate a bespoke strategic insight using Google Gemini API
 * This replaces the simulated scenario generator with real AI-powered analysis
 */
export async function generateInsight(input: InsightInput): Promise<InsightOutput> {
  const { signalId, signalTitle, signalTruth, role, industry } = input;

  const prompt = `You are a strategic AI consultant for Third Signal Labs. Generate a bespoke, executive-level strategic insight based on the following context:

**Signal ID**: ${signalId}
**Signal**: ${signalTitle}
**Core Truth**: ${signalTruth}
**Client Role**: ${role}
**Industry**: ${industry}

Your task is to create a compelling, personalized strategic vignette that demonstrates deep understanding of their specific context. The output must be:

1. **Title**: A punchy, paradox-style title (e.g., "The ${industry.split('/')[0].trim()} ${signalTitle} Paradox")

2. **Body** (150-200 words): A narrative that:
   - Opens with industry-specific context
   - Connects the signal truth to their role's perspective
   - Reveals the hidden system dynamics at play
   - Uses concrete, vivid language (avoid buzzwords)
   - Speaks directly to their pain points

3. **Implication** (50-75 words): A strategic recommendation that:
   - Reframes the problem as an opportunity
   - Suggests a counterintuitive approach
   - Positions AI/automation as the leverage point
   - Uses active, confident language

4. **Metrics** (exactly 3): Projected outcomes in format "Metric +/-XX%"
   - Must be specific, ambitious but credible
   - Examples: "Velocity +40%", "Overhead -60%", "Signal Fidelity 99%"

Return ONLY valid JSON in this exact structure:
{
  "title": "string",
  "body": "string",
  "implication": "string",
  "metrics": ["string", "string", "string"]
}

Make it feel like a $50k consulting deliverable distilled into 3 minutes of reading. Be specific, be bold, be memorable.`;

  try {
    const apiUrl = ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
      ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
      : "https://forge.manus.im/v1/chat/completions";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "strategic_insight",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "A punchy, paradox-style title for the insight",
                },
                body: {
                  type: "string",
                  description: "The main narrative body of the insight (150-200 words)",
                },
                implication: {
                  type: "string",
                  description: "The strategic recommendation (50-75 words)",
                },
                metrics: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Exactly 3 projected outcome metrics",
                },
              },
              required: ["title", "body", "implication", "metrics"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log the response for debugging
    console.log("[Insight Generator] API Response:", JSON.stringify(data, null, 2));
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error(`No choices in API response. Full response: ${JSON.stringify(data)}`);
    }
    
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from Gemini API");
    }

    const insight: InsightOutput = JSON.parse(content);

    return insight;
  } catch (error) {
    console.error("[Insight Generator] Error:", error);

    // Fallback to a high-quality simulated response if API fails
    return {
      title: `The ${industry.split('/')[0].trim()} ${signalTitle} Paradox`,
      body: `In ${industry}, ${signalTruth} As a ${role}, you are uniquely positioned to see the system failures that others ignore. The current architecture is optimized to preserve the problem, not solve it. Every layer of complexity you've inherited is a tax on velocity, and the cost compounds daily.`,
      implication: `The strategic move is to invert the model. By deploying autonomous agents to address ${signalTitle.toLowerCase()}, we don't just patch the leak—we redesign the plumbing. This shifts your team from 'keeping the lights on' to 'lighting the fire'.`,
      metrics: ["Velocity +40%", "Overhead -60%", "Signal Fidelity 99%"],
    };
  }
}
