import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site-chrome";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — Yene Journal" },
      { name: "description", content: "Access your Yene Journal account." },
      { property: "og:title", content: "Log in — Yene Journal" },
      { property: "og:description", content: "Access your Yene Journal account." },
    ],
  }),
  component: AuthPage,
});

const creds = z.object({ email: z.string().trim().email("Enter a valid email"), password: z.string().min(8, "At least 8 characters") });

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const v = z.string().email().safeParse(email.trim());
        if (!v.success) { toast.error("Enter a valid email"); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(v.data, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) { toast.error(error.message); return; }
        setSent("Check your inbox for a reset link.");
        return;
      }
      const v = creds.safeParse({ email, password });
      if (!v.success) { toast.error(v.error.issues[0]?.message ?? "Invalid input"); return; }
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ ...v.data, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
        if (error) { toast.error(error.message); return; }
        setSent("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword(v.data);
        if (error) { toast.error(error.message); return; }
        navigate({ to: "/dashboard" });
      }
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) { toast.error(error.message); return; }
    if (data.url) window.location.assign(data.url);
  }

  return (
    <div className="relative grid min-h-screen place-items-center bg-hero px-4">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="glass relative w-full max-w-sm rounded-2xl p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">
          {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
        </h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">{sent}</p>
        ) : (
          <>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <Label htmlFor="pw">Password</Label>
                  <Input id="pw" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              )}
              <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Log in"}
              </Button>
            </form>
            {mode !== "forgot" && (
              <div className="mt-4 space-y-2">
                <Button type="button" variant="glass" className="w-full" onClick={signInWithGoogle}>Continue with Google</Button>
              </div>
            )}
          </>
        )}
        <div className="mt-6 flex justify-between text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              <button onClick={() => setMode("signup")} className="hover:text-foreground">Create account</button>
              <button onClick={() => setMode("forgot")} className="hover:text-foreground">Forgot password?</button>
            </>
          ) : (
            <button onClick={() => { setMode("login"); setSent(null); }} className="hover:text-foreground">Back to log in</button>
          )}
          <Link to="/" className="hover:text-foreground">Home</Link>
        </div>
      </div>
    </div>
  );
}
