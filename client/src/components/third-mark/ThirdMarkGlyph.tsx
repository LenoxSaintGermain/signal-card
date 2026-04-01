import { type ReactNode, useEffect, useState } from "react";

type ThirdMarkExpression =
  | "rest"
  | "arrive"
  | "listen"
  | "think"
  | "speak"
  | "gift"
  | "certain"
  | "doubt";

function useLoop(duration = 3000) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      setT(((timestamp - start) % duration) / duration);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return t;
}

export function ThirdMarkGlyph({
  expression = "rest",
  size = 88,
  onClick,
}: {
  expression?: ThirdMarkExpression;
  size?: number;
  onClick?: () => void;
}) {
  const t = useLoop(4000);
  const center = size / 2;
  const lineLength = size * 0.38;
  const strokeWidth = Math.max(1, size * 0.026);
  const gap = size * 0.168;
  const angle = (20 * Math.PI) / 180;
  const offsetX = (lineLength / 2) * Math.sin(angle);
  const offsetY = (lineLength / 2) * Math.cos(angle);

  const palette = {
    accent: "#C4B49A",
    gold: "#E8D5A0",
  };

  const base = (x: number, y = center, opacity = 1, isThird = false) => {
    const color = isThird ? palette.gold : palette.accent;
    const width = isThird ? strokeWidth * 1.3 : strokeWidth;
    const lengthMultiplier = isThird ? 1.2 : 1;
    const hx = offsetX * lengthMultiplier;
    const hy = offsetY * lengthMultiplier;

    return (
      <line
        x1={x - hx}
        y1={y + hy}
        x2={x + hx}
        y2={y - hy}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  };

  const xs = [center - gap, center, center + gap];
  const sin = Math.sin;
  const tau = Math.PI * 2;
  let marks: ReactNode = null;

  if (expression === "rest") {
    marks = xs.map((x, index) => {
      const phase = (t + index * 0.28) % 1;
      return (
        <g key={x}>
          {base(x, center, 0.38 + 0.5 * (0.5 + 0.5 * sin(phase * tau)), index === 2)}
        </g>
      );
    });
  } else if (expression === "arrive") {
    marks = xs.map((x, index) => {
      const phase = Math.max(0, (t * 3.5 - index * 0.22)) % 1;
      const eased = phase < 0.4 ? phase / 0.4 : 1;
      return (
        <g key={x} transform={`translate(0, ${(1 - eased) * size * 0.18})`}>
          {base(x, center, eased, index === 2)}
        </g>
      );
    });
  } else if (expression === "listen") {
    marks = xs.map((x, index) => {
      const phase = 0.5 + 0.5 * sin(t * tau + index * 0.4);
      return (
        <g key={x} transform={`translate(${(index - 1) * (-size * 0.06) * phase},0)`}>
          {base(x, center, 0.38 + 0.35 * (1 - phase), index === 2)}
        </g>
      );
    });
  } else if (expression === "think") {
    marks = (
      <g transform={`rotate(${8 * sin(t * tau * 0.7)},${center},${center})`}>
        {xs.map((x, index) => (
          <g key={x}>{base(x, center, 0.5 + 0.4 * sin(t * tau + index * 0.5), index === 2)}</g>
        ))}
      </g>
    );
  } else if (expression === "speak") {
    const phase = 0.5 + 0.5 * sin(t * tau);
    marks = (
      <>
        {[
          [-size * 0.09 * phase, xs[0], 0.6 + 0.4 * phase],
          [0, xs[1], 0.7 + 0.3 * sin(t * tau + 0.3)],
          [size * 0.09 * phase, xs[2], 0.6 + 0.4 * phase],
        ].map(([dx, x, opacity], index) => (
          <g key={`${x}-${index}`} transform={`translate(${dx},0)`}>
            {base(x as number, center, opacity as number, index === 2)}
          </g>
        ))}
      </>
    );
  } else if (expression === "gift") {
    const phase = 0.5 + 0.5 * sin(t * tau);
    marks = (
      <>
        {base(xs[0], center, 0.6 + 0.4 * phase, false)}
        {base(xs[1], center, 0.7 + 0.3 * phase, false)}
        {base(xs[2], center, 0.6 + 0.4 * phase, true)}
      </>
    );
  } else if (expression === "certain") {
    marks = xs.map((x, index) => <g key={x}>{base(x, center, 0.95, index === 2)}</g>);
  } else {
    marks = xs.map((x, index) => {
      const phase = [2.1, 1.7, 2.8][index];
      return (
        <g key={x} transform={`translate(${3 * sin((t + index * 0.4) * tau * 1.3)},0)`}>
          {base(x, center, 0.15 + 0.75 * Math.abs(sin((t + index * 0.33) * tau * phase)), index === 2)}
        </g>
      );
    });
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        overflow: "visible",
        display: "block",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {marks}
    </svg>
  );
}
