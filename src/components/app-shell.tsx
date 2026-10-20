import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { BarChart3, BookOpen, Calculator, LayoutDashboard, LogOut, Menu, Settings, Target, Wallet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site-chrome";
import { usePlan } from "@/lib/data";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trades", label: "Trades", icon: BarChart3 },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/playbook", label: "Playbook", icon: Target },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/tools", label: "Calculators", icon: Calculator },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const plan = usePlan();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const side = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo />
      <nav className="flex flex-col gap-1">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-border p-3 text-xs">
          <span className="text-muted-foreground">Plan: </span>
          <span className={plan === "premium" ? "font-semibold text-primary" : "font-semibold"}>{plan === "premium" ? "Premium" : "Free"}</span>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-border bg-sidebar md:block">{side}</aside>
      <div className="flex items-center justify-between border-b border-border p-4 md:hidden">
        <Logo />
        <button aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="border-b border-border bg-sidebar md:hidden">{side}</div>}
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{children}</div>;
}
