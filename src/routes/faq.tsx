import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Yene Journal" },
      { name: "description", content: "Answers to common questions about Yene Journal." },
      { property: "og:title", content: "FAQ — Yene Journal" },
      { property: "og:description", content: "Common questions about Yene Journal." },
    ],
  }),
  component: Faq,
});

const qa: [string, string][] = [
  ["Is Yene Journal a broker?", "No. It is a journal and analytics platform. It never places trades or holds funds."],
  ["How is P&L calculated?", "Net P&L = (exit − entry) × quantity × multiplier × direction − fees, computed with exact decimals on our servers. Shorts profit when price falls."],
  ["Who can see my trades?", "Only you. Every record is tied to your account and access is checked on the server."],
  ["What does the Free plan include?", "2 trading accounts and 100 trades per month, plus the journal, playbook, analytics and calculators."],
  ["Can I import from my broker?", "CSV import is planned and not available yet."],
];

function Faq() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-4xl font-bold">Frequently asked questions</h1>
        <Accordion type="single" collapsible className="mt-10">
          {qa.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicPage>
  );
}
