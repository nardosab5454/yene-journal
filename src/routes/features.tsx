import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Yene Journal" },
      { name: "description", content: "Trade logging, journal entries, strategy playbook, analytics and risk calculators." },
      { property: "og:title", content: "Features — Yene Journal" },
      { property: "og:description", content: "Everything you need to review your trading." },
    ],
  }),
  component: Features,
});

const groups = [
  { title: "Trade log", items: ["Stocks, forex, crypto, futures and options", "Contract multipliers and fees", "Exact decimal P&L calculated on the server", "Filter by account, symbol, side and strategy"] },
  { title: "Journal", items: ["Daily notes", "Pre-trade plans", "Post-trade reviews linked to trades"] },
  { title: "Analytics", items: ["Net P&L, win rate, profit factor, expectancy", "Equity curve", "Performance by strategy and symbol"] },
  { title: "Tools", items: ["Position-size calculator", "Risk/reward calculator", "Multiple trading accounts"] },
];

function Features() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h1 className="text-4xl font-bold">Built for honest review</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Yene Journal is a journal and analytics tool. It does not place trades or connect to your broker.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-primary">{g.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {g.items.map((i) => <li key={i}>— {i}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <Button asChild variant="hero" size="lg" className="mt-12"><Link to="/auth" search={{ mode: "signup" }}>Create a free account</Link></Button>
      </section>
    </PublicPage>
  );
}
