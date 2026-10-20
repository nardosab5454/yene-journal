import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, CalendarDays, Calculator, ShieldCheck, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPage } from "@/components/site-chrome";
import { HeroVisual } from "@/components/hero-virtual";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yene Journal — The trading journal that shows you your edge" },
      { name: "description", content: "Log trades, review your plans and see win rate, profit factor and expectancy in one place. Free to start." },
      { property: "og:title", content: "Yene Journal — Trading journal & analytics" },
      { property: "og:description", content: "Log trades, review your plans and find your edge. Free to start." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: BookOpen, title: "Journal every trade", text: "Entries, exits, fees, plans and post-trade reviews in one record." },
  { icon: BarChart3, title: "Know your numbers", text: "Net P&L, win rate, profit factor, expectancy and an equity curve." },
  { icon: Tags, title: "Strategy playbook", text: "Group trades by setup and tag them to see what actually works." },
  { icon: Calculator, title: "Risk calculators", text: "Position size and risk/reward before you click buy." },
  { icon: CalendarDays, title: "Calendar view", text: "See green and red days at a glance." },
  { icon: ShieldCheck, title: "Private by default", text: "Your data is visible only to you." },
];

function Index() {
  return (
    <PublicPage>
      <section className="relative overflow-hidden bg-hero">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="glass inline-block rounded-full px-3 py-1 text-xs text-muted-foreground">Trading journal · Analytics · Playbook</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Stop guessing.<br /><span className="text-gradient">See your edge.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Yene Journal turns every trade you log into clear numbers, so you know which setups to keep and which to drop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/auth" search={{ mode: "signup" }}>Start journaling free</Link></Button>
              <Button asChild variant="glass" size="lg"><Link to="/features">See features</Link></Button>
            </div>
          </motion.div>
          <div className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">DEMO · illustrative chart</span>
              <span className="font-mono text-profit">+ equity</span>
            </div>
            <div className="h-64"><HeroVisual /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold">Everything a serious trader reviews</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Free forever for getting started.</h2>
            <p className="mt-2 text-muted-foreground">Upgrade to Premium when you need more accounts and unlimited trades.</p>
          </div>
          <Button asChild variant="hero" size="lg"><Link to="/pricing">Compare plans</Link></Button>
        </div>
      </section>
    </PublicPage>
  );
}
