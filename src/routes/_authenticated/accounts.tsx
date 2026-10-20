import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, PageHeader } from "@/components/app-shell";
import { accountsQuery, num, useSave } from "@/lib/data";
import { fmtMoney } from "@/lib/trading";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Yene Journal" }, { name: "description", content: "Manage trading accounts." }, { property: "og:title", content: "Accounts — Yene Journal" }, { property: "og:description", content: "Manage trading accounts." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountsQuery),
  component: Accounts,
});

function Accounts() {
  const { data } = useSuspenseQuery(accountsQuery);
  const [form, setForm] = useState({ name: "", broker: "", currency: "USD", starting_balance: "" });
  const create = useSave(
    () => supabase.from("trading_accounts").insert({ name: form.name.trim(), broker: form.broker || null, currency: form.currency.toUpperCase(), starting_balance: Number(form.starting_balance || 0) }),
    ["accounts"],
    "Account created",
  );
  const remove = useSave((id: string) => supabase.from("trading_accounts").delete().eq("id", id), ["accounts", "trades"], "Account deleted");

  return (
    <>
      <PageHeader title="Trading accounts" />
      <form
        className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          create.mutate(undefined, { onSuccess: () => setForm({ name: "", broker: "", currency: "USD", starting_balance: "" }) });
        }}
      >
        <Field label="Name"><Input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
        <Field label="Broker"><Input value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} /></Field>
        <Field label="Currency"><Input value={form.currency} maxLength={3} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
        <Field label="Starting balance"><Input type="number" step="0.01" value={form.starting_balance} onChange={(e) => setForm({ ...form, starting_balance: e.target.value })} /></Field>
        <div className="flex items-end"><Button variant="hero" className="w-full" disabled={create.isPending}>Add account</Button></div>
      </form>
      {data.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.broker || "No broker"} · start {fmtMoney(num(a.starting_balance), a.currency)}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Delete ${a.name}`} onClick={() => confirm(`Delete "${a.name}" and all its trades?`) && remove.mutate(a.id)}>
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      ) : <Empty>No accounts yet. Add your first one above.</Empty>}
    </>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
