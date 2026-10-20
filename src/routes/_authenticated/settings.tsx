import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/app-shell";
import { profileQuery, useSave } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Yene Journal" }, { name: "description", content: "Profile and plan settings." }, { property: "og:title", content: "Settings — Yene Journal" }, { property: "og:description", content: "Profile settings." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Settings,
});

const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];

function Settings() {
  const { data } = useSuspenseQuery(profileQuery);
  const [name, setName] = useState(data.profile.display_name ?? "");
  const [tz, setTz] = useState(data.profile.timezone);
  const save = useSave(() => supabase.from("profiles").update({ display_name: name.trim() || null, timezone: tz }).eq("id", data.profile.id), ["profile"], "Settings saved");

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-xl border border-border bg-card p-6" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined); }}>
          <h2 className="font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">{data.email}</p>
          <div className="space-y-1.5"><Label htmlFor="n">Display name</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label htmlFor="tz">Timezone</Label>
            <select id="tz" value={tz} onChange={(e) => setTz(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              {["UTC", ...zones.filter((z) => z !== "UTC")].map((z) => <option key={z} value={z} className="bg-popover">{z}</option>)}
            </select>
          </div>
          <Button variant="hero" disabled={save.isPending}>Save</Button>
        </form>
        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Plan</h2>
          <p className="font-display text-2xl font-bold text-primary">{data.sub?.plan === "premium" ? "Premium" : "Free"}</p>
          <p className="text-sm text-muted-foreground">Free includes 2 trading accounts and 100 trades per month. Premium checkout is not available yet.</p>
          <Button asChild variant="glass"><Link to="/pricing">Compare plans</Link></Button>
        </div>
      </div>
    </>
  );
}
