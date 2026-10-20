// Data access via the signed-in browser client. Row-level security in the
// database restricts every query to the caller's own rows, and plan limits are
// enforced by database triggers, so nothing here is trusted for authorization.
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/type";

type T = Database["public"]["Tables"];
export type Trade = T["trades"]["Row"] & { strategies: { name: string } | null; trading_accounts: { name: string; currency: string } | null };
export type Account = T["trading_accounts"]["Row"];
export type Strategy = T["strategies"]["Row"];
export type Journal = T["journal_entries"]["Row"];

function check<D>(r: { data: D; error: { message: string } | null }): NonNullable<D> {
  if (r.error || r.data == null) throw new Error(friendly(r.error?.message ?? "Not found"));
  return r.data as NonNullable<D>;
}
export function friendly(msg: string) {
  return msg.replace(/^FREE_LIMIT:\s*/, "");
}

export const tradesQuery = queryOptions({
  queryKey: ["trades"],
  queryFn: async () =>
    check(await supabase.from("trades").select("*, strategies(name), trading_accounts(name, currency)").order("opened_at", { ascending: false })) as Trade[],
});
export const accountsQuery = queryOptions({
  queryKey: ["accounts"],
  queryFn: async () => check(await supabase.from("trading_accounts").select("*").order("created_at")),
});
export const strategiesQuery = queryOptions({
  queryKey: ["strategies"],
  queryFn: async () => check(await supabase.from("strategies").select("*").order("name")),
});
export const journalQuery = queryOptions({
  queryKey: ["journal"],
  queryFn: async () => check(await supabase.from("journal_entries").select("*").order("entry_date", { ascending: false }).order("created_at", { ascending: false })),
});
export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const profile = check(await supabase.from("profiles").select("*").eq("id", u.user!.id).single());
    const sub = (await supabase.from("subscriptions").select("*").eq("user_id", u.user!.id).maybeSingle()).data;
    return { profile, sub, email: u.user!.email };
  },
});

export function usePlan() {
  const { data } = useQuery(profileQuery);
  return data?.sub?.plan ?? "free";
}

export function useSave<V>(fn: (v: V) => PromiseLike<unknown>, keys: string[], success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: V) => {
      const r = (await fn(v)) as { error: { message: string } | null } | undefined;
      if (r && r.error) throw new Error(friendly(r.error.message));
    },
    onSuccess: () => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      if (success) toast.success(success);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const num = (v: unknown) => (v == null ? 0 : Number(v));
