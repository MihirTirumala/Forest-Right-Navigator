import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ShieldQuestion } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { ClaimDetail } from "@/components/claim-detail";
import { SectionCard, KpiCard } from "@/components/kpi-card";
import { useFilters } from "@/lib/filter-store";
import { RULES, RULE_BY_CODE } from "@/data/anomalies";
import { flagsForClaims } from "@/data/analytics";
import type { Claim } from "@/data/claims";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/anomalies")({
  head: () => ({
    meta: [
      { title: "Anomaly Review — FRA Monitor" },
      {
        name: "description",
        content:
          "Transparent rule-based anomaly flags on Forest Rights Act claims: delays, area mismatches, missing Gram Sabha resolutions and duplicates.",
      },
      { property: "og:title", content: "Anomaly Review — FRA Monitor" },
      {
        property: "og:description",
        content: "Every flag names the rule that produced it, for human verification against the file.",
      },
    ],
  }),
  component: AnomaliesPage,
});

const SEV_TONE: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};

function AnomaliesPage() {
  const { claims } = useFilters();
  const [ruleFilter, setRuleFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Claim | null>(null);

  const flags = useMemo(() => flagsForClaims(claims), [claims]);
  const byRule = useMemo(
    () => RULES.map((r) => ({ rule: r, hits: flags.filter((f) => f.code === r.code) })),
    [flags],
  );
  const visible = ruleFilter ? flags.filter((f) => f.code === ruleFilter) : flags;
  const claimById = useMemo(() => new Map(claims.map((c) => [c.id, c])), [claims]);
  const distinct = new Set(flags.map((f) => f.claimId)).size;

  return (
    <AppShell
      title="Anomaly Review"
      subtitle="Deterministic rules over the claim register — advisory prompts, never determinations"
    >
      <div className="space-y-5">
        <FilterBar compact />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Rule hits" value={flags.length.toLocaleString()} icon={AlertTriangle} tone="bad" />
          <KpiCard label="Claims affected" value={distinct.toLocaleString()} icon={ShieldQuestion} tone="warn" />
          <KpiCard
            label="High severity"
            value={flags.filter((f) => f.severity === "high").length.toLocaleString()}
            icon={AlertTriangle}
            tone="bad"
          />
          <KpiCard
            label="Share of register"
            value={`${((distinct / (claims.length || 1)) * 100).toFixed(1)}%`}
            icon={ShieldQuestion}
          />
        </div>

        <SectionCard
          title="Rule catalogue"
          description="Each rule is a plain condition evaluated on every claim. Click a rule to filter the queue."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {byRule.map(({ rule, hits }) => (
              <button
                key={rule.code}
                onClick={() => setRuleFilter(ruleFilter === rule.code ? null : rule.code)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  ruleFilter === rule.code ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {rule.code} · {rule.title}
                  </p>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", SEV_TONE[rule.severity])}>
                    {hits.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{rule.description}</p>
                <p className="mt-2 rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  {rule.rule}
                </p>
                <p className="mt-2 text-[11px] text-primary">Review: {rule.reviewAction}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={ruleFilter ? `Queue — ${RULE_BY_CODE[ruleFilter]!.title}` : "Review queue"}
          description={`${visible.length.toLocaleString()} flags awaiting human verification`}
          action={
            ruleFilter ? (
              <button onClick={() => setRuleFilter(null)} className="text-xs text-primary hover:underline">
                Show all rules
              </button>
            ) : null
          }
        >
          <ul className="divide-y divide-border">
            {visible.slice(0, 120).map((f, i) => {
              const claim = claimById.get(f.claimId);
              if (!claim) return null;
              const rule = RULE_BY_CODE[f.code]!;
              return (
                <li key={`${f.claimId}-${f.code}-${i}`}>
                  <button
                    onClick={() => setSelected(claim)}
                    className="flex w-full items-start justify-between gap-4 py-3 text-left hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {rule.code} · {rule.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.claimant} — {claim.village}, {claim.district} ({claim.state})
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Evidence: {f.detail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", SEV_TONE[f.severity])}>
                        {f.severity}
                      </span>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{claim.id}</p>
                    </div>
                  </button>
                </li>
              );
            })}
            {!visible.length && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No rule matched within the current filters.
              </li>
            )}
          </ul>
          {visible.length > 120 && (
            <p className="pt-3 text-xs text-muted-foreground">
              Showing the first 120 of {visible.length.toLocaleString()} flags — narrow the filters to see more.
            </p>
          )}
        </SectionCard>
      </div>

      {selected && <ClaimDetail claim={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}
