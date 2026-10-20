import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm">Y</span>
      Yene<span className="text-primary">Journal</span>
    </Link>
  );
}

const links = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Button asChild variant="hero" size="sm"><Link to="/dashboard">Open dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Log in</Link></Button>
              <Button asChild variant="hero" size="sm"><Link to="/auth" search={{ mode: "signup" }}>Start free</Link></Button>
            </>
          )}
        </div>
        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            <Button asChild variant="hero"><Link to={signedIn ? "/dashboard" : "/auth"}>{signedIn ? "Open dashboard" : "Log in / Sign up"}</Link></Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">A journal and analytics platform for traders. Not a broker. Not financial advice.</p>
        </div>
        <FooterCol title="Product" items={[["/features", "Features"], ["/pricing", "Pricing"], ["/faq", "FAQ"]]} />
        <FooterCol title="Support" items={[["/contact", "Contact"], ["/auth", "Log in"]]} />
        <FooterCol title="Legal" items={[["/terms", "Terms of service"], ["/privacy", "Privacy policy"]]} />
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Yene Journal</p>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map(([to, label]) => (
          <li key={to}><a href={to} className="hover:text-foreground">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
