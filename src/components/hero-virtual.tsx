import { motion, useReducedMotion } from "framer-motion";

// Decorative market-inspired visual: candles, an animated price line and drifting particles.
const candles = Array.from({ length: 22 }, (_, i) => {
  const base = 120 - i * 3 + Math.sin(i * 1.3) * 18;
  const up = Math.sin(i * 2.1) > -0.2;
  const h = 18 + Math.abs(Math.cos(i * 1.7)) * 34;
  return { x: 20 + i * 26, y: base, h, wick: h + 16, up };
});
const line = candles.map((c, i) => `${i ? "L" : "M"}${c.x + 5},${c.y + c.h / 2}`).join(" ");

export function HeroVisual() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 600 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="ln" x1="0" x2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      {candles.map((c, i) => (
        <motion.g
          key={i}
          initial={reduce ? false : { opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: i * 0.04, duration: 0.5 }}
          style={{ transformOrigin: `${c.x}px ${c.y + c.h / 2}px` }}
        >
          <line x1={c.x + 5} x2={c.x + 5} y1={c.y - 8} y2={c.y - 8 + c.wick} stroke="var(--muted-foreground)" strokeOpacity={0.5} />
          <rect x={c.x} y={c.y} width={10} height={c.h} rx={2} fill={c.up ? "var(--profit)" : "var(--loss)"} fillOpacity={0.85} />
        </motion.g>
      ))}
      <motion.path
        d={line}
        fill="none"
        stroke="url(#ln)"
        strokeWidth={2.5}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
      {!reduce &&
        Array.from({ length: 14 }).map((_, i) => (
          <motion.circle
            key={i}
            r={1.6}
            fill="var(--primary)"
            cx={30 + i * 40}
            initial={{ cy: 250, opacity: 0 }}
            animate={{ cy: [250, 20], opacity: [0, 0.8, 0] }}
            transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
    </svg>
  );
}
