import { useEffect, useState } from "react";
import { idleConfig } from "@/lib/motion-tokens";

export type IdleLayer = "none" | "breath" | "signalDrift" | "softFocus" | "cinematicHint";

/**
 * Cinematic Idle State Hook
 * Progressively activates ambient animations based on user inactivity
 * Respects prefers-reduced-motion and exits immediately on user input
 */
export function useCinematicIdle() {
  const [idleLayer, setIdleLayer] = useState<IdleLayer>("none");
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let idleTimer: NodeJS.Timeout;
    let breathTimer: NodeJS.Timeout;
    let driftTimer: NodeJS.Timeout;
    let focusTimer: NodeJS.Timeout;
    let hintTimer: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      setIdleLayer("none");
      clearTimeout(idleTimer);
      clearTimeout(breathTimer);
      clearTimeout(driftTimer);
      clearTimeout(focusTimer);
      clearTimeout(hintTimer);

      // Start idle timer
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        
        // Layer 1: Breath (6s)
        breathTimer = setTimeout(() => {
          setIdleLayer("breath");
        }, idleConfig.layers.breath.delay);

        // Layer 2: Signal Drift (14s)
        driftTimer = setTimeout(() => {
          setIdleLayer("signalDrift");
        }, idleConfig.layers.signalDrift.delay);

        // Layer 3: Soft Focus (22s)
        focusTimer = setTimeout(() => {
          setIdleLayer("softFocus");
        }, idleConfig.layers.softFocus.delay);

        // Layer 4: Cinematic Hint (30s)
        hintTimer = setTimeout(() => {
          setIdleLayer("cinematicHint");
        }, idleConfig.layers.cinematicHint.delay);
      }, idleConfig.enterDelay);
    };

    // Event listeners to detect user activity
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdle);
    });

    // Initialize
    resetIdle();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdle);
      });
      clearTimeout(idleTimer);
      clearTimeout(breathTimer);
      clearTimeout(driftTimer);
      clearTimeout(focusTimer);
      clearTimeout(hintTimer);
    };
  }, []);

  return { isIdle, idleLayer };
}
