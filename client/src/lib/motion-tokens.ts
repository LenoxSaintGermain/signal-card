/**
 * Motion Design Token System
 * Based on Agentic OS Motion Spec v1.0
 */

export const motionTokens = {
  // Durations (in seconds for Framer Motion)
  duration: {
    instant: 0,
    xs: 0.12,
    sm: 0.18,
    md: 0.26,
    lg: 0.42,
    xl: 0.7,
    cinematic: 1.1,
  },

  // Easing functions
  ease: {
    exit: [0.33, 1, 0.68, 1], // easeOutCubic
    enter: [0.32, 0, 0.67, 0], // easeInCubic
    standard: [0.65, 0, 0.35, 1], // easeInOutCubic
    spring: {
      soft: { type: "spring" as const, mass: 1, stiffness: 220, damping: 26 },
      snappy: {
        type: "spring" as const,
        mass: 1,
        stiffness: 300,
        damping: 28,
      },
    },
  },

  // Distance / Transform values (in pixels)
  distance: {
    nudge: 4,
    shift: 12,
    slide: 24,
    scene: 56,
  },

  // Scale values
  scale: {
    pop: 1.03,
    focus: 1.06,
  },

  // Blur values (in pixels)
  blur: {
    soft: 6,
    med: 12,
  },

  // Opacity values
  alpha: {
    hidden: 0,
    dim: 0.55,
    muted: 0.75,
    full: 1,
  },

  // Stagger delays (in seconds)
  stagger: {
    micro: 0.03,
    sm: 0.055,
    md: 0.09,
  },

  // Z-index lift for elevation
  zLift: 6,
} as const;

/**
 * Animation Pattern Presets
 */
export const animationPatterns = {
  fadeIn: {
    initial: { opacity: motionTokens.alpha.hidden },
    animate: { opacity: motionTokens.alpha.full },
    transition: {
      duration: motionTokens.duration.sm,
      ease: motionTokens.ease.exit,
    },
  },

  slideUpIn: {
    initial: {
      y: motionTokens.distance.shift,
      opacity: motionTokens.alpha.hidden,
    },
    animate: { y: 0, opacity: motionTokens.alpha.full },
    transition: {
      duration: motionTokens.duration.md,
      ease: motionTokens.ease.exit,
    },
  },

  cardConvergeFocus: {
    // For focused card
    focus: {
      initial: { scale: 1, opacity: motionTokens.alpha.full },
      animate: { scale: motionTokens.scale.focus },
      transition: {
        duration: motionTokens.duration.lg,
        ease: motionTokens.ease.standard,
      },
    },
    // For non-focused cards
    blur: {
      initial: { opacity: motionTokens.alpha.full, filter: "blur(0px)" },
      animate: {
        opacity: motionTokens.alpha.dim,
        filter: `blur(${motionTokens.blur.soft}px)`,
      },
      transition: {
        duration: motionTokens.duration.lg,
        ease: motionTokens.ease.standard,
      },
    },
  },

  sceneWipe: {
    initial: { opacity: motionTokens.alpha.hidden, scale: 1.1 },
    animate: { opacity: motionTokens.alpha.full, scale: 1 },
    exit: { opacity: motionTokens.alpha.hidden, scale: 0.95 },
    transition: {
      duration: motionTokens.duration.cinematic,
      ease: motionTokens.ease.standard,
    },
  },

  microGlowConfirm: {
    initial: { scale: 1 },
    animate: { scale: [1, motionTokens.scale.pop, 1] },
    transition: {
      duration: motionTokens.duration.xs,
      ...motionTokens.ease.spring.soft,
    },
  },
} as const;

/**
 * Idle State Configuration
 */
export const idleConfig = {
  enterDelay: 6000, // 6 seconds
  layers: {
    breath: {
      delay: 6000,
      duration: motionTokens.duration.cinematic,
      maxBrightnessDelta: 0.08,
    },
    signalDrift: {
      delay: 14000,
      maxParticles: 6,
      maxOpacity: 0.1,
    },
    softFocus: {
      delay: 22000,
      targetOpacity: motionTokens.alpha.muted,
    },
    cinematicHint: {
      delay: 30000,
      maxPerSession: 2,
      cooldownMs: 300000, // 5 minutes
    },
  },
} as const;
