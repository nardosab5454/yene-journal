import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { accountsQuery, strategiesQuery, type Trade } from "@/lib/data";
import { realizedPnl } from "@/lib/trading";

const optNum = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().nonnegative().nullable());
export const tradeSchema = z.object({
  account_id: z.string().uuid("Choose an account"),
  strategy_id: z.string().uuid().nullable(),
  symbol: z.string().trim().min(1, "Symbol required").max(30).transform((s) => s.toUpperCase()),
  asset_class: z.enum(["stock", "forex", "crypto", "futures", "options", "other"]),
  side: z.enum(["long", "short"]),
  quantity: z.coerce.number().positive("Quantity must be > 0"),
  multiplier: z.coerce.number().positive(),
  entry_price: z.coerce.number().nonnegative(),
  exit_price: optNum,
  stop_price: optNum,
  target_price: optNum,
  fees: z.coerce.number().nonnegative(),
  opened_at: z.string().min(1, "Open time required"),
  closed_at: z.string().nullable(),
  notes: z.string().max(5000).nullable(),
});
export type TradeInput = z.infer<typeof tradeSchema>;

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export function TradeForm({ initial, onSubmit, busy }: { initial?: Trade; onSubmit: (v: TradeInput) => void; busy: boolean }) {
  const { data: accounts } = useSuspenseQuery(accountsQuery);
  const { data: strategies } = useSuspenseQuery(strategiesQuery);
  const [f, setF] = useState({
    account_id: initial?.account_id ?? accounts[0]?.id ?? "",
    strategy_id: initial?.strategy_id ?? "",
    symbol: initial?.symbol ?? "",
    asset_class: initial?.asset_class ?? "stock",
    side: initial?.side ?? "long",
    quantity: String(initial?.quantity ?? ""),
    multiplier: String(initial?.multiplier ?? "1"),
    entry_price: String(initial?.entry_price ?? ""),
    exit_price: initial?.exit_price != null ? String(initial.exit_price) : "",
    stop_price: initial?.stop_price != null ? String(initial.stop_price) : "",
    target_price: initial?.target_price != null ? String(initial.target_price) : "",
    fees: String(initial?.fees ?? "0"),
    opened_at: toLocal(initial?.opened_at ?? new Date().toISOString()),
    closed_at: toLocal(initial?.closed_at ?? null),
    notes: initial?.notes ?? "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const preview =
    f.exit_price && f.entry_price && f.quantity
      ? realizedPnl({ side: f.side as "long" | "short", entry: +f.entry_price, exit: +f.exit_price, quantity: +f.quantity, multiplier: +f.multiplier || 1, fees: +f.fees || 0 })
      : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = tradeSchema.safeParse({
      ...f,
      strategy_id: f.strategy_id || null,
      opened_at: f.opened_at ? new Date(f.opened_at).toISOString() : "",
      closed_at: f.closed_at ? new Date(f.closed_at).toISOString() : f.exit_price ? new Date().toISOString() : null,
      notes: f.notes || null,
    });
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Invalid input"); return; }
    onSubmit(r.data);
  }

  if (!accounts.length) return <p className="text-muted-foreground">Create a trading account first.</p>;

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <F label="Account"><Sel value={f.account_id} onChange={set("account_id")} options={accounts.map((a) => [a.id, a.name])} /></F>
        <F label="Symbol"><Input value={f.symbol} onChange={set("symbol")} placeholder="AAPL" required /></F>
        <F label="Asset class"><Sel value={f.asset_class} onChange={set("asset_class")} options={["stock", "forex", "crypto", "futures", "options", "other"].map((x) => [x, x])} /></F>
        <F label="Side"><Sel value={f.side} onChange={set("side")} options={[["long", "Long"], ["short", "Short"]]} /></F>
        <F label="Quantity"><Input type="number" step="any" value={f.quantity} onChange={set("quantity")} required /></F>
        <F label="Multiplier"><Input type="number" step="any" value={f.multiplier} onChange={set("multiplier")} /></F>
        <F label="Entry price"><Input type="number" step="any" value={f.entry_price} onChange={set("entry_price")} required /></F>
        <F label="Exit price (blank = open)"><Input type="number" step="any" value={f.exit_price} onChange={set("exit_price")} /></F>
        <F label="Stop"><Input type="number" step="any" value={f.stop_price} onChange={set("stop_price")} /></F>
        <F label="Target"><Input type="number" step="any" value={f.target_price} onChange={set("target_price")} /></F>
        <F label="Fees & commissions"><Input type="number" step="0.01" value={f.fees} onChange={set("fees")} /></F>
        <F label="Strategy"><Sel value={f.strategy_id} onChange={set("strategy_id")} options={[["", "None"], ...strategies.map((s) => [s.id, s.name] as [string, string])]} /></F>
        <F label="Opened"><Input type="datetime-local" value={f.opened_at} onChange={set("opened_at")} required /></F>
        <F label="Closed"><Input type="datetime-local" value={f.closed_at} onChange={set("closed_at")} /></F>
      </div>
      <F label="Notes"><Textarea value={f.notes} onChange={set("notes")} rows={3} /></F>
      <div className="flex items-center justify-between">
        <p className="tabular text-sm text-muted-foreground">
          Net P&L preview: <span className={preview == null ? "" : preview >= 0 ? "text-profit" : "text-loss"}>{preview == null ? "open" : preview.toFixed(2)}</span>
        </p>
        <Button variant="hero" disabled={busy}>{busy ? "Saving…" : "Save trade"}</Button>
      </div>
    </form>
  );
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

export function Sel({ value, onChange, options }: { value: string; onChange: (e: { target: { value: string } }) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={onChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
      {options.map(([v, l]) => <option key={v} value={v} className="bg-popover">{l}</option>)}
    </select>
  );
}
