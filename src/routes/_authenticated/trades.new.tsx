import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app-shell";
import { TradeForm, type TradeInput } from "@/components/trade-form";
import { accountsQuery, strategiesQuery, useSave } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/trades/new")({
  head: () => ({ meta: [{ title: "Log trade — Yene Journal" }, { name: "description", content: "Record a new trade." }, { property: "og:title", content: "Log trade — Yene Journal" }, { property: "og:description", content: "Record a new trade." }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(accountsQuery), context.queryClient.ensureQueryData(strategiesQuery)]),
  component: NewTrade,
});

function NewTrade() {
  const navigate = useNavigate();
  const save = useSave((v: TradeInput) => supabase.from("trades").insert(v), ["trades"], "Trade saved");
  return (
    <>
      <PageHeader title="Log trade" />
      <TradeForm busy={save.isPending} onSubmit={(v) => save.mutate(v, { onSuccess: () => navigate({ to: "/trades" }) })} />
    </>
  );
}
