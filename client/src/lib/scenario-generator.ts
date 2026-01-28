import { Signal } from "./signals";

interface Scenario {
  title: string;
  body: string;
  implication: string;
  metrics: string[];
}

// This function now calls the backend tRPC API which uses Gemini for real-time insights
// The function signature remains the same for backward compatibility
export async function generateScenario(signal: Signal, role: string, industry: string): Promise<Scenario> {
  // Note: This is a placeholder that will be replaced by the actual tRPC call in the component
  // The component will use trpc.insights.generate.useMutation() directly
  throw new Error("This function should not be called directly. Use trpc.insights.generate.useMutation() instead.");
}
