import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Yene Journal" },
      { name: "description", content: "Compare Yene Journal Free and Premium plans." },
      { property: "og:title", content: "Pricing — Yene Journal" },
      { property: "og:description", content: "Start free. Upgrade when you need more." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h1 className="text-center text-4xl font-bold">Simple plans</h1>
        <p className="mt-3 text-center text-muted-foreground">Limits are enforced on our servers, not just in the app.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Plan name="Free" price="$0" items={["2 trading accounts", "100 trades per month", "Journal & playbook", "Core analytics & calculators"]} cta="Start free" />
          <Plan name="Premium" price="Coming soon" highlight items={["Unlimited trading accounts", "Unlimited trades", "Advanced analytics", "CSV import & screenshots (in development)"]} cta="Join free, upgrade later" />
        </div>
      </section>
    </PublicPage>
  );
}

function Plan({ name, price, items, cta, highlight }: { name: string; price: string; items: string[]; cta: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-8 ${highlight ? "border-primary/60 bg-card shadow-glow" : "border-border bg-card"}`}>
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="mt-2 font-display text-3xl font-bold">{price}</p>
      <ul className="mt-6 space-y-3 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{i}</li>
        ))}
      </ul>
      <Button asChild variant={highlight ? "hero" : "glass"} className="mt-8 w-full"><Link to="/auth" search={{ mode: "signup" }}>{cta}</Link></Button>
    </div>
  );
}
