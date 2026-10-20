import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/app-shell";
import { positionSize, riskReward } from "@/lib/trading";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "Calculators — Yene Journal" }, { name: "description", content: "Position size and risk/reward calculators." }, { property: "og:title", content: "Calculators — Yene Journal" }, { property: "og:description", content: "Trading calculators." }] }),
  component: Tools,
});

function Tools() {
  const [v, setV] = useState({ balance: "10000", risk: "1", entry: "50", stop: "48", target: "56", mult: "1" });
  const n = (k: keyof typeof v) => Number(v[k]) || 0;
  const size = positionSize(n("balance"), n("risk"), n("entry"), n("stop"), n("mult") || 1);
  const rr = riskReward(n("entry"), n("stop"), n("target"));
  const fields: [keyof typeof v, string][] = [["balance", "Account balance"], ["risk", "Risk %"], ["entry", "Entry"], ["stop", "Stop"], ["target", "Target"], ["mult", "Multiplier"]];
  return (
    <>
      <PageHeader title="Calculators" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
          {fields.map(([k, l]) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={k}>{l}</Label>
              <Input id={k} type="number" step="any" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Out label="Position size" value={`${size} units`} />
          <Out label="Amount at risk" value={(n("balance") * n("risk") / 100).toFixed(2)} />
          <Out label="Risk : reward" value={rr == null ? "—" : `1 : ${rr}`} />
          <Out label="Potential reward" value={(size * Math.abs(n("target") - n("entry")) * (n("mult") || 1)).toFixed(2)} />
        </div>
      </div>
    </>
  );
}

function Out({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="tabular mt-2 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
