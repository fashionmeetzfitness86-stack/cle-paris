import type { ReactNode } from "react";

/**
 * SplitText — Mask clip-path word reveal
 *
 * Each word is wrapped in an overflow-hidden container,
 * then revealed via clip-path inset animation (left-to-right wipe).
 * Fully respects prefers-reduced-motion.
 */

interface SplitTextProps {
  text: string;
  className?: string;
  /** Base delay in ms before first word starts */
  delay?: number;
  /** Stagger between each word in ms */
  stagger?: number;
  /** Duration of each word reveal in ms */
  duration?: number;
  as?: keyof JSX.IntrinsicElements;
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 70,
  duration = 900,
  as: Tag = "span",
}: SplitTextProps) {
  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
        >
          <span
            className="inline-block"
            style={{
              animation: `clipInLeft ${duration}ms cubic-bezier(0.16,1,0.3,1) both`,
              animationDelay: `${delay + i * stagger}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00a0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * SplitLine — Single line clip-path reveal (used for subheadings, labels)
 * Simpler than SplitText — reveals the whole string as one unit.
 */
export function SplitLine({
  children,
  className = "",
  delay = 0,
  direction = "left",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up";
}) {
  const animName =
    direction === "left"
      ? "clipInLeft"
      : direction === "right"
      ? "clipInRight"
      : "fadeUp";

  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      <span
        className="inline-block"
        style={{
          animation: `${animName} 0.9s cubic-bezier(0.16,1,0.3,1) both`,
          animationDelay: `${delay}ms`,
        }}
      >
        {children}
      </span>
    </span>
  );
}
