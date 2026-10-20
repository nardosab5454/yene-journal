import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Empty, PageHeader } from "@/components/app-shell";
import { num, strategiesQuery, tradesQuery, useSave } from "@/lib/data";
import { computeMetrics, fmtMoney } from "@/lib/trading";

export const Route = createFileRoute("/_authenticated/playbook")({
  head: () => ({ meta: [{ title: "Playbook — Yene Journal" }, { name: "description", content: "Your strategies and how they perform." }, { property: "og:title", content: "Playbook — Yene Journal" }, { property: "og:description", content: "Strategy playbook." }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(strategiesQuery), context.queryClient.ensureQueryData(tradesQuery)]),
  component: Playbook,
});

function Playbook() {
  const { data: strategies } = useSuspenseQuery(strategiesQuery);
  const { data: trades } = useSuspenseQuery(tradesQuery);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const add = useSave(() => supabase.from("strategies").insert({ name: name.trim(), description: desc || null }), ["strategies"], "Strategy added");
  const del = useSave((id: string) => supabase.from("strategies").delete().eq("id", id), ["strategies", "trades"]);

  return (
    <>
      <PageHeader title="Strategy playbook" />
      <form className="mb-8 space-y-3 rounded-xl border border-border bg-card p-5" onSubmit={(e) => { e.preventDefault(); if (name.trim()) add.mutate(undefined, { onSuccess: () => { setName(""); setDesc(""); } }); }}>
        <Input placeholder="Strategy name, e.g. Opening range breakout" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        <Textarea placeholder="Rules: entry, stop, target, conditions" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button variant="hero" disabled={add.isPending || !name.trim()}>Add strategy</Button>
      </form>
      {strategies.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {strategies.map((s) => {
            const m = computeMetrics(trades.filter((t) => t.strategy_id === s.id && t.net_pnl != null).map((t) => num(t.net_pnl)));
            return (
              <div key={s.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{s.name}</h3>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${s.name}`} onClick={() => confirm("Delete strategy? Trades keep their data.") && del.mutate(s.id)}><Trash2 /></Button>
                </div>
                {s.description && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.description}</p>}
                <p className="tabular mt-3 text-sm">
                  {m.trades} trades · win {(m.winRate * 100).toFixed(0)}% · <span className={m.totalPnl >= 0 ? "text-profit" : "text-loss"}>{fmtMoney(m.totalPnl)}</span>
                </p>
              </div>
            );
          })}
        </div>
      ) : <Empty>No strategies yet.</Empty>}
    </>
  );
}
