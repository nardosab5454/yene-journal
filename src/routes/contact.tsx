import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & support — Yene Journal" },
      { name: "description", content: "Get help with Yene Journal." },
      { property: "og:title", content: "Contact — Yene Journal" },
      { property: "og:description", content: "Get help with Yene Journal." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-4xl font-bold">Contact & support</h1>
        <p className="mt-4 text-muted-foreground">Questions, bugs or feature ideas? Email us and we'll get back to you.</p>
        <a href="mailto:support@yenejournal.com" className="mt-8 inline-block rounded-xl border border-border bg-card px-6 py-4 font-mono text-primary hover:border-primary/50">
          support@yenejournal.com
        </a>
      </section>
    </PublicPage>
  );
}
