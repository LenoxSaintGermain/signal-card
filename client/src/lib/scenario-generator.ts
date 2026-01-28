import { Signal } from "./signals";

interface Scenario {
  title: string;
  body: string;
  implication: string;
  metrics: string[];
}

export function generateScenario(signal: Signal, role: string, industry: string): Promise<Scenario> {
  // Simulate network latency for "processing" effect
  return new Promise((resolve) => {
    setTimeout(() => {
      // Dynamic content generation logic (simulated)
      const industryContexts: Record<string, string> = {
        "SaaS / Tech": "where feature velocity is the only moat left",
        "Fintech / Banking": "where regulatory burden often masquerades as technical debt",
        "Healthcare / Bio": "where data silos are literally a matter of life and death",
        "Retail / E-comm": "where margin compression demands hyper-efficiency",
        "Manufacturing": "where the physical-digital bridge is the primary bottleneck",
        "Professional Services": "where billable hours are being demonetized by intelligence"
      };

      const rolePerspectives: Record<string, string> = {
        "CEO / Founder": "you are likely feeling the disconnect between your vision and the organization's execution speed",
        "CTO / VP Eng": "you are fighting a war on two fronts: maintaining legacy stability while architecting for an AI-native future",
        "Product Leader": "you are trapped in the 'feature factory' instead of delivering outcome-based value",
        "Operations Lead": "you see the friction points that everyone else ignores as 'just the way we do things'",
        "Investor / VC": "you need to know if this asset is a platform for compounding growth or a depreciating legacy stack"
      };

      const context = industryContexts[industry] || "where complexity is the default state";
      const perspective = rolePerspectives[role] || "you are uniquely positioned to see the system failures";

      resolve({
        title: `The ${industry.split('/')[0].trim()} ${signal.title} Paradox`,
        body: `In ${industry}, ${context}. ${signal.truth} As a ${role}, ${perspective}. The system is currently optimized to preserve the problem, not solve it.`,
        implication: `The strategic move is to invert the model. By deploying autonomous agents to address ${signal.title.toLowerCase()}, we don't just patch the leak—we redesign the plumbing. This shifts your team from 'keeping the lights on' to 'lighting the fire'.`,
        metrics: [
          "Velocity +40%", 
          "Overhead -60%", 
          "Signal Fidelity 99%"
        ]
      });
    }, 2500);
  });
}
