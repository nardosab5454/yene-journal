// Pure trading calculations. Monetary values arrive from the database as exact
// decimal strings (net_pnl is computed in Postgres); we convert to numbers only
// for aggregation/display, rounding results to cents.

export type ClosedTrade = { net_pnl: number; closed_at: string | null; opened_at: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Realized P&L for a full exit: (exit - entry) * qty * multiplier * direction - fees. */
export function realizedPnl(input: {
  side: "long" | "short";
  entry: number;
  exit: number;
  quantity: number;
  multiplier?: number;
  fees?: number;
}): number {
  const dir = input.side === "long" ? 1 : -1;
  const gross = round2((input.exit - input.entry) * input.quantity * (input.multiplier ?? 1) * dir);
  return round2(gross - (input.fees ?? 0));
}

export type Metrics = {
  totalPnl: number;
  trades: number;
  wins: number;
  losses: number;
  winRate: number; // 0..1
  profitFactor: number | null; // null when no losing trades
  expectancy: number;
  avgWin: number;
  avgLoss: number;
};

/** Breakeven trades (pnl = 0) count toward trades but neither wins nor losses. */
export function computeMetrics(pnls: number[]): Metrics {
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const grossWin = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const total = pnls.reduce((a, b) => a + b, 0);
  return {
    totalPnl: round2(total),
    trades: pnls.length,
    wins: wins.length,
    losses: losses.length,
    winRate: pnls.length ? wins.length / pnls.length : 0,
    profitFactor: grossLoss === 0 ? null : round2(grossWin / grossLoss),
    expectancy: pnls.length ? round2(total / pnls.length) : 0,
    avgWin: wins.length ? round2(grossWin / wins.length) : 0,
    avgLoss: losses.length ? round2(-grossLoss / losses.length) : 0,
  };
}

/** Cumulative equity by close time, starting from the given balance. */
export function equityCurve(trades: ClosedTrade[], start = 0) {
  const sorted = [...trades].sort(
    (a, b) => +new Date(a.closed_at ?? a.opened_at) - +new Date(b.closed_at ?? b.opened_at),
  );
  let eq = start;
  return sorted.map((t) => {
    eq = round2(eq + t.net_pnl);
    return { date: (t.closed_at ?? t.opened_at).slice(0, 10), equity: eq };
  });
}

/** Units to buy so that hitting the stop loses riskPct of balance. */
export function positionSize(balance: number, riskPct: number, entry: number, stop: number, multiplier = 1) {
  const perUnit = Math.abs(entry - stop) * multiplier;
  if (perUnit === 0 || balance <= 0 || riskPct <= 0) return 0;
  return Math.floor(((balance * riskPct) / 100 / perUnit) * 10000) / 10000;
}

export function riskReward(entry: number, stop: number, target: number) {
  const risk = Math.abs(entry - stop);
  if (risk === 0) return null;
  return round2(Math.abs(target - entry) / risk);
}

export const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
