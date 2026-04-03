import { Fragment, type CSSProperties } from "react";
import { motion } from "framer-motion";

const cinematicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function CinematicWordReveal({
  text,
  className,
  wordClassName = "inline-block mr-[0.28em] align-baseline",
  style,
  stagger = 0.045,
  duration = 0.22,
  blur = 4,
  initialDelay = 0,
  cursor = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  style?: CSSProperties;
  stagger?: number;
  duration?: number;
  blur?: number;
  initialDelay?: number;
  cursor?: boolean;
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  return (
    <div className={className} style={style}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          <motion.span
            initial={{ opacity: 0, y: 8, filter: `blur(${blur}px)` }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration,
              delay: initialDelay + index * stagger,
              ease: cinematicEase,
            }}
            className={wordClassName}
          >
            {word}
          </motion.span>
        </Fragment>
      ))}
      {cursor && (
        <motion.span
          aria-hidden
          className="ml-1 inline-block h-[0.9em] w-[0.12em] rounded-full bg-[#B8EFFF]/72 align-middle"
          animate={{ opacity: [0.22, 1, 0.22] }}
          transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
