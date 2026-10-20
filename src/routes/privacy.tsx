import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Yene Journal" },
      { name: "description", content: "How Yene Journal handles your data." },
      { property: "og:title", content: "Privacy policy — Yene Journal" },
      { property: "og:description", content: "How Yene Journal handles your data." },
    ],
  }),
  component: () => (
    <PublicPage>
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-20 text-muted-foreground">
        <h1 className="text-4xl font-bold text-foreground">Privacy policy</h1>
        <p>Draft — to be reviewed by a legal professional before launch.</p>
        <p>We store your email, profile settings and the trading records you enter. Your records are visible only to you and are never sold.</p>
        <p>We use essential cookies and local storage to keep you signed in. You can delete your data by contacting support.</p>
      </article>
    </PublicPage>
  ),
});
