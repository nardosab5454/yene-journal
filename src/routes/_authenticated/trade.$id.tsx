import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app-shell";
import { Sel, TradeForm, type TradeInput } from "@/components/trade-form";
import { accountsQuery, journalQuery, num, strategiesQuery, tradesQuery, useSave } from "@/lib/data";
import { fmtMoney, riskReward } from "@/lib/trading";

export const Route = createFileRoute("/_authenticated/trade/$id")({
  head: () => ({ meta: [{ title: "Trade detail — Yene Journal" }, { name: "description", content: "Trade detail and review." }, { property: "og:title", content: "Trade — Yene Journal" }, { property: "og:description", content: "Trade detail." }] }),
  loader: async ({ context, params }) => {
    const [trades] = await Promise.all([
      context.queryClient.ensureQueryData(tradesQuery),
      context.queryClient.ensureQueryData(accountsQuery),
      context.queryClient.ensureQueryData(strategiesQuery),
      context.queryClient.ensureQueryData(journalQuery),
    ]);
    if (!trades.some((t) => t.id === params.id)) throw notFound();
  },
  notFoundComponent: () => <p className="text-muted-foreground">Trade not found. <Link to="/trades" className="text-primary">Back to trades</Link></p>,
  component: TradeDetail,
});

function TradeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: trades } = useSuspenseQuery(tradesQuery);
  const { data: journal } = useSuspenseQuery(journalQuery);
  const t = trades.find((x) => x.id === id)!;
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<"pre_trade" | "post_trade">("post_trade");
  const [body, setBody] = useState("");

  const update = useSave((v: TradeInput) => supabase.from("trades").update(v).eq("id", id), ["trades"], "Trade updated");
  const del = useSave(() => supabase.from("trades").delete().eq("id", id), ["trades", "journal"], "Trade deleted");
  const addNote = useSave(() => supabase.from("journal_entries").insert({ trade_id: id, kind, body: body.trim(), entry_date: t.opened_at.slice(0, 10) }), ["journal"], "Review saved");
  const notes = journal.filter((j) => j.trade_id === id);
  const rr = t.stop_price != null && t.target_price != null ? riskReward(num(t.entry_price), num(t.stop_price), num(t.target_price)) : null;

  return (
    <>
      <PageHeader
        title={`${t.symbol} · ${t.side}`}
        action={
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</Button>
            <Button variant="destructive" onClick={() => confirm("Delete this trade?") && del.mutate(undefined, { onSuccess: () => navigate({ to: "/trades" }) })}>Delete</Button>
          </div>
        }
      />
      {editing ? (
        <TradeForm initial={t} busy={update.isPending} onSubmit={(v) => update.mutate(v, { onSuccess: () => setEditing(false) })} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Net P&L", t.net_pnl == null ? "Open" : fmtMoney(num(t.net_pnl), t.trading_accounts?.currency)],
            ["Gross P&L", t.gross_pnl == null ? "—" : fmtMoney(num(t.gross_pnl), t.trading_accounts?.currency)],
            ["Fees", fmtMoney(num(t.fees), t.trading_accounts?.currency)],
            ["Planned R:R", rr == null ? "—" : `1 : ${rr}`],
            ["Entry → Exit", `${num(t.entry_price)} → ${t.exit_price == null ? "—" : num(t.exit_price)}`],
            ["Quantity × mult.", `${num(t.quantity)} × ${num(t.multiplier)}`],
            ["Account", t.trading_accounts?.name ?? "—"],
            ["Strategy", t.strategies?.name ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase text-muted-foreground">{k}</p>
              <p className="tabular mt-1 font-semibold">{v}</p>
            </div>
          ))}
          {t.notes && <p className="rounded-xl border border-border bg-card p-4 text-sm sm:col-span-2 lg:col-span-4">{t.notes}</p>}
        </div>
      )}

      <h2 className="mb-3 mt-10 text-lg font-semibold">Plans & reviews</h2>
      <form
        className="space-y-3 rounded-xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) addNote.mutate(undefined, { onSuccess: () => setBody("") });
        }}
      >
        <div className="w-48"><Sel value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} options={[["pre_trade", "Pre-trade plan"], ["post_trade", "Post-trade review"]]} /></div>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What was the plan? What happened? What will you repeat or change?" rows={3} />
        <Button variant="hero" size="sm" disabled={addNote.isPending || !body.trim()}>Add</Button>
      </form>
      <div className="mt-4 space-y-3">
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl border border-border p-4">
            <p className="text-xs uppercase text-cyan">{n.kind === "pre_trade" ? "Pre-trade plan" : "Post-trade review"}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{n.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
