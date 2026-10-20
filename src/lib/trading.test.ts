import { describe, expect, it } from "vitest";
import { computeMetrics, equityCurve, positionSize, realizedPnl, riskReward } from "./trading";

describe("trading calculations", () => {
  it("long P&L subtracts fees", () => {
    expect(realizedPnl({ side: "long", entry: 100, exit: 110, quantity: 10, fees: 2 })).toBe(98);
  });
  it("short P&L profits when price falls", () => {
    expect(realizedPnl({ side: "short", entry: 50, exit: 45, quantity: 4 })).toBe(20);
  });
  it("futures multiplier scales P&L", () => {
    expect(realizedPnl({ side: "long", entry: 5000, exit: 5002, quantity: 1, multiplier: 50 })).toBe(100);
  });
  it("metrics: win rate, profit factor, expectancy", () => {
    const m = computeMetrics([100, -50, 200, -50, 0]);
    expect(m.winRate).toBe(0.4);
    expect(m.profitFactor).toBe(3);
    expect(m.expectancy).toBe(40);
    expect(m.totalPnl).toBe(200);
  });
  it("profit factor is null with no losses", () => {
    expect(computeMetrics([10, 20]).profitFactor).toBeNull();
  });
  it("equity curve accumulates in close order", () => {
    const c = equityCurve(
      [
        { net_pnl: -5, closed_at: "2026-01-02T00:00:00Z", opened_at: "2026-01-02T00:00:00Z" },
        { net_pnl: 10, closed_at: "2026-01-01T00:00:00Z", opened_at: "2026-01-01T00:00:00Z" },
      ],
      1000,
    );
    expect(c.map((p) => p.equity)).toEqual([1010, 1005]);
  });
  it("position size risks the given percent", () => {
    expect(positionSize(10000, 1, 50, 48)).toBe(50);
  });
  it("risk/reward ratio", () => {
    expect(riskReward(100, 95, 115)).toBe(3);
  });
});
