import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Empty, PageHeader } from "@/components/app-shell";
import { journalQuery, useSave } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — Yene Journal" }, { name: "description", content: "Daily notes, plans and reviews." }, { property: "og:title", content: "Journal — Yene Journal" }, { property: "og:description", content: "Daily trading notes." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(journalQuery),
  component: JournalPage,
});

const label = { daily: "Daily note", pre_trade: "Pre-trade plan", post_trade: "Post-trade review" } as const;

function JournalPage() {
  const { data } = useSuspenseQuery(journalQuery);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const add = useSave(() => supabase.from("journal_entries").insert({ kind: "daily", entry_date: date, title: title || null, body: body.trim() }), ["journal"], "Entry saved");
  const del = useSave((id: string) => supabase.from("journal_entries").delete().eq("id", id), ["journal"]);

  return (
    <>
      <PageHeader title="Journal" />
      <form
        className="mb-8 space-y-3 rounded-xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) add.mutate(undefined, { onSuccess: () => { setBody(""); setTitle(""); } });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
          <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <Textarea rows={4} placeholder="Market conditions, mindset, lessons…" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button variant="hero" disabled={add.isPending || !body.trim()}>Save entry</Button>
      </form>
      {data.length ? (
        <div className="space-y-3">
          {data.map((j) => (
            <div key={j.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-cyan">{label[j.kind]} · {j.entry_date}</p>
                  {j.title && <p className="mt-1 font-semibold">{j.title}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {j.trade_id && <Button asChild variant="link" size="sm"><Link to="/trades/$id" params={{ id: j.trade_id }}>View trade</Link></Button>}
                  <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={() => confirm("Delete entry?") && del.mutate(j.id)}><Trash2 /></Button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{j.body}</p>
            </div>
          ))}
        </div>
      ) : <Empty>No journal entries yet.</Empty>}
    </>
  );
}
