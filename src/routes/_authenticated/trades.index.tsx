import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, PageHeader } from "@/components/app-shell";
import { Sel } from "@/components/trade-form";
import { accountsQuery, num, strategiesQuery, tradesQuery } from "@/lib/data";
import { fmtMoney } from "@/lib/trading";

export const Route = createFileRoute("/_authenticated/trades/")({
  head: () => ({ meta: [{ title: "Trades — Yene Journal" }, { name: "description", content: "Your trade log." }, { property: "og:title", content: "Trades — Yene Journal" }, { property: "og:description", content: "Your trade log." }] }),
  loader: ({ context }) => Promise.all([tradesQuery, accountsQuery, strategiesQuery].map((q) => context.queryClient.ensureQueryData(q as typeof tradesQuery))),
  component: Trades,
});

function Trades() {
  const { data: trades } = useSuspenseQuery(tradesQuery);
  const { data: accounts } = useSuspenseQuery(accountsQuery);
  const { data: strategies } = useSuspenseQuery(strategiesQuery);
  const [q, setQ] = useState("");
  const [acct, setAcct] = useState("");
  const [strat, setStrat] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(
    () =>
      trades.filter(
        (t) =>
          (!q || t.symbol.includes(q.toUpperCase())) &&
          (!acct || t.account_id === acct) &&
          (!strat || t.strategy_id === strat) &&
          (!status || (status === "open" ? t.net_pnl == null : status === "win" ? num(t.net_pnl) > 0 : t.net_pnl != null && num(t.net_pnl) <= 0)),
      ),
    [trades, q, acct, strat, status],
  );

  return (
    <>
      <PageHeader title="Trades" action={<Button asChild variant="hero"><Link to="/trades/new">Log trade</Link></Button>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Input placeholder="Search symbol" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search symbol" />
        <Sel value={acct} onChange={(e) => setAcct(e.target.value)} options={[["", "All accounts"], ...accounts.map((a) => [a.id, a.name] as [string, string])]} />
        <Sel value={strat} onChange={(e) => setStrat(e.target.value)} options={[["", "All strategies"], ...strategies.map((s) => [s.id, s.name] as [string, string])]} />
        <Sel value={status} onChange={(e) => setStatus(e.target.value)} options={[["", "All results"], ["win", "Winners"], ["loss", "Losers / breakeven"], ["open", "Open"]]} />
      </div>
      {rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
              <tr>{["Date", "Symbol", "Side", "Qty", "Entry", "Exit", "Strategy", "Net P&L"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="tabular">
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-4 py-3">{new Date(t.opened_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold"><Link to="/trades/$id" params={{ id: t.id }} className="hover:text-primary">{t.symbol}</Link></td>
                  <td className="px-4 py-3 capitalize">{t.side}</td>
                  <td className="px-4 py-3">{num(t.quantity)}</td>
                  <td className="px-4 py-3">{num(t.entry_price)}</td>
                  <td className="px-4 py-3">{t.exit_price == null ? "—" : num(t.exit_price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.strategies?.name ?? "—"}</td>
                  <td className={`px-4 py-3 font-semibold ${t.net_pnl == null ? "text-muted-foreground" : num(t.net_pnl) >= 0 ? "text-profit" : "text-loss"}`}>
                    {t.net_pnl == null ? "Open" : fmtMoney(num(t.net_pnl), t.trading_accounts?.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>{trades.length ? "No trades match these filters." : "No trades yet. Log your first one."}</Empty>}
    </>
  );
}
