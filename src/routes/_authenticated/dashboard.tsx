import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader } from "@/components/app-shell";
import { accountsQuery, num, tradesQuery } from "@/lib/data";
import { computeMetrics, equityCurve, fmtMoney } from "@/lib/trading";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Yene Journal" }, { name: "description", content: "Your trading performance at a glance." }, { property: "og:title", content: "Dashboard — Yene Journal" }, { property: "og:description", content: "Your trading performance." }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(tradesQuery), context.queryClient.ensureQueryData(accountsQuery)]),
  component: Dashboard,
});

function Dashboard() {
  const { data: trades } = useSuspenseQuery(tradesQuery);
  const { data: accounts } = useSuspenseQuery(accountsQuery);
  const closed = trades.filter((t) => t.net_pnl != null).map((t) => ({ ...t, net_pnl: num(t.net_pnl) }));
  const m = computeMetrics(closed.map((t) => t.net_pnl));
  const start = accounts.reduce((a, b) => a + num(b.starting_balance), 0);
  const curve = equityCurve(closed, start);
  const byStrategy = Object.entries(
    closed.reduce<Record<string, number>>((acc, t) => {
      const k = t.strategies?.name ?? "No strategy";
      acc[k] = (acc[k] ?? 0) + t.net_pnl;
      return acc;
    }, {}),
  ).map(([name, pnl]) => ({ name, pnl: Math.round(pnl * 100) / 100 }));

  if (!accounts.length)
    return (
      <>
        <PageHeader title="Dashboard" />
        <Empty>
          Create a trading account to start logging trades.
          <div className="mt-4"><Button asChild variant="hero"><Link to="/accounts">Add account</Link></Button></div>
        </Empty>
      </>
    );

  const stats = [
    { label: "Net P&L", value: fmtMoney(m.totalPnl), tone: m.totalPnl >= 0 ? "text-profit" : "text-loss" },
    { label: "Win rate", value: `${(m.winRate * 100).toFixed(1)}%` },
    { label: "Profit factor", value: m.profitFactor == null ? (m.wins ? "∞" : "—") : m.profitFactor.toFixed(2) },
    { label: "Expectancy", value: fmtMoney(m.expectancy), tone: m.expectancy >= 0 ? "text-profit" : "text-loss" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" action={<Button asChild variant="hero"><Link to="/trades/new">Log trade</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`tabular mt-2 font-display text-2xl font-bold ${s.tone ?? ""}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{m.trades} closed trades · {m.wins} wins · {m.losses} losses · avg win {fmtMoney(m.avgWin)} · avg loss {fmtMoney(m.avgLoss)}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Equity curve</h2>
          {curve.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={curve}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={70} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="equity" stroke="var(--primary)" strokeWidth={2} fill="url(#eq)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty>Close a trade to see your equity curve.</Empty>}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">P&L by strategy</h2>
          {byStrategy.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byStrategy} layout="vertical">
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="pnl" radius={4}>
                  {byStrategy.map((s) => <Cell key={s.name} fill={s.pnl >= 0 ? "var(--profit)" : "var(--loss)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty>No closed trades yet.</Empty>}
        </div>
      </div>
    </>
  );
}
