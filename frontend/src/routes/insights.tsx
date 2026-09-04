import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Info, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { SectionCard } from "@/components/kpi-card";
import { useFilters } from "@/lib/filter-store";
import { answerQuestion, generateInsights } from "@/data/insights";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — FRA Monitor" },
      {
        name: "description",
        content:
          "Data-grounded narrative summaries and a question-answering assistant over the filtered Forest Rights Act claim set. Advisory only.",
      },
      { property: "og:title", content: "AI Insights — FRA Monitor" },
      {
        property: "og:description",
        content: "Every sentence is derived from the claims currently in view, with the evidence shown.",
      },
    ],
  }),
  component: InsightsPage,
});

const SUGGESTIONS = [
  "Where are the worst delays?",
  "Which districts reject the most claims?",
  "Summarise the anomaly flags",
  "Compare state performance",
  "How are community (CFR) claims doing?",
  "How much area has been recognised?",
];

type Turn = { q: string; a: string; evidence: string[] };

function InsightsPage() {
  const { claims } = useFilters();
  const insights = useMemo(() => generateInsights(claims), [claims]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  function ask(q: string) {
    if (!q.trim()) return;
    const a = answerQuestion(q, claims);
    setTurns((t) => [...t, { q, a: a.text, evidence: a.evidence }]);
    setInput("");
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 30);
  }

  return (
    <AppShell
      title="AI Insights"
      subtitle="Narrative analysis grounded strictly in the claims currently in view"
    >
      <div className="space-y-5">
        <FilterBar compact />

        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            These summaries are produced by deterministic computation over the filtered dataset — no statement
            is made that cannot be traced to the evidence listed beneath it. Nothing here approves, rejects or
            prioritises a claim; recommendations are prompts for a human officer to verify against the file.
          </p>
        </div>

        <SectionCard
          title="Ask the assistant"
          description={`Answers are computed live from the ${claims.length.toLocaleString()} claims in view`}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          <div ref={chatContainerRef} className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {turns.length === 0 && (
              <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                Ask about delays, rejections, anomalies, state comparisons, community claims, women claimants
                or recognised area. The assistant only reports what the filtered data shows and will say so
                when a question falls outside it.
              </p>
            )}
            {turns.map((t, i) => (
              <div key={i} className="space-y-2">
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {t.q}
                </p>
                <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-card px-3 py-2">
                  <p className="text-sm leading-relaxed text-foreground">{t.a}</p>
                  <ul className="mt-2 space-y-0.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                    {t.evidence.map((e, k) => (
                      <li key={k}>• {e}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[11px] italic text-muted-foreground">
                    Advisory only — verify before acting.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the claims currently in view…"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className={cn(
                "flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground",
                !input.trim() && "opacity-50",
              )}
            >
              <Send className="size-4" /> Ask
            </button>
          </form>
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-2">
          {insights.map((i) => (
            <SectionCard
              key={i.id}
              title={i.title}
              description={`Severity: ${i.severity}`}
              action={<Sparkles className="size-4 text-primary" />}
            >
              <p className="text-sm leading-relaxed text-foreground">{i.body}</p>
              <div className="mt-3 rounded-lg bg-muted/60 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Evidence
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {i.evidence.map((e, idx) => (
                    <li key={idx}>• {e}</li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
