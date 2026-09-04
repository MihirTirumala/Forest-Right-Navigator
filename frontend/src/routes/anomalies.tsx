import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bot, CheckCircle, RefreshCw, ShieldAlert, ShieldQuestion, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { ClaimDetail } from "@/components/claim-detail";
import { SectionCard, KpiCard } from "@/components/kpi-card";
import { useFilters } from "@/lib/filter-store";
import { RULES, RULE_BY_CODE } from "@/data/anomalies";
import { flagsForClaims } from "@/data/analytics";
import type { Claim } from "@/data/claims";
import { cn } from "@/lib/utils";
import { fetchDistrictAiAudit, type DistrictAiAudit } from "@/lib/api-client";

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

const DISTRICT_PROFILES = [
  { state: "Maharashtra", district: "Gadchiroli" },
  { state: "Odisha", district: "Sundargarh" },
  { state: "Chhattisgarh", district: "Dantewada" },
  { state: "Odisha", district: "Kandhamal" },
  { state: "Gujarat", district: "Narmada" },
  { state: "Jharkhand", district: "Paschim Singhbhum" },
];

function AnomaliesPage() {
  const { claims } = useFilters();
  const [ruleFilter, setRuleFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Claim | null>(null);

  // AI Audit State
  const [activeProfile, setActiveProfile] = useState<{ state: string; district: string }>(DISTRICT_PROFILES[0]!);
  const [aiAudit, setAiAudit] = useState<DistrictAiAudit | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const loadAiAudit = (st: string, dt: string) => {
    setLoadingAi(true);
    fetchDistrictAiAudit(st, dt)
      .then((res) => {
        setAiAudit(res);
      })
      .finally(() => {
        setLoadingAi(false);
      });
  };

  useEffect(() => {
    if (activeProfile) {
      loadAiAudit(activeProfile.state, activeProfile.district);
    }
  }, [activeProfile]);

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
      title="Anomaly Review & AI Audit Engine"
      subtitle="Rule-based anomaly checks combined with live Groq LLM executive compliance synthesis"
    >
      <div className="space-y-5">
        <FilterBar compact />

        {/* Live Groq AI District Audit Card */}
        <SectionCard
          title="🤖 Live Groq AI District Compliance Auditor"
          description="Synthesizes administrative delays, land mismatches, and rejection spikes via llama-3.3-70b-versatile / groq-mini"
          action={
            <div className="flex items-center gap-2">
              <select
                value={activeProfile ? `${activeProfile.state}||${activeProfile.district}` : ""}
                onChange={(e) => {
                  const parts = e.target.value.split("||");
                  if (parts.length === 2 && parts[0] && parts[1]) {
                    setActiveProfile({ state: parts[0], district: parts[1] });
                  }
                }}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DISTRICT_PROFILES.map((p) => (
                  <option key={`${p.state}-${p.district}`} value={`${p.state}||${p.district}`}>
                    {p.district}, {p.state}
                  </option>
                ))}
              </select>
              <button
                onClick={() => activeProfile && loadAiAudit(activeProfile.state, activeProfile.district)}
                disabled={loadingAi || !activeProfile}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loadingAi && "animate-spin")} />
                Refresh AI
              </button>
            </div>
          }
        >
          {loadingAi ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin text-primary" />
              Running live Groq LLM compliance synthesis for {activeProfile?.district}...
            </div>
          ) : aiAudit ? (
            <div className="grid gap-4 md:grid-cols-12">
              {/* Left Score Badge */}
              <div className="md:col-span-4 rounded-xl border border-border bg-card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Audit Risk Index
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-bold border",
                        aiAudit.risk_level === "HIGH"
                          ? "bg-red-500/10 text-red-600 border-red-500/30"
                          : aiAudit.risk_level === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      )}
                    >
                      {aiAudit.risk_level} RISK
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {aiAudit.risk_score}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">District:</span>
                      <span className="font-semibold text-foreground">{aiAudit.district}, {aiAudit.state}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Total Claims:</span>
                      <span className="font-semibold text-foreground">{aiAudit.total_claims}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Status Resolution Delay:</span>
                      <span className="font-semibold text-foreground">{aiAudit.avg_processing_days} days</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">GIS Land Mismatches:</span>
                      <span className="font-semibold text-foreground">{aiAudit.mismatched_land_records}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs">
                  {aiAudit.ai_summary.anomaly_detected ? (
                    <span className="inline-flex items-center text-amber-600 font-medium gap-1">
                      <ShieldAlert className="h-4 w-4" /> Anomaly Detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-emerald-600 font-medium gap-1">
                      <CheckCircle className="h-4 w-4" /> Normal Compliance
                    </span>
                  )}
                  <span className="ml-auto rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                    {aiAudit.ai_summary.primary_root_cause}
                  </span>
                </div>
              </div>

              {/* Right Executive Synthesis Briefing */}
              <div className="md:col-span-8 rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Groq Executive Audit Briefing</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground font-normal">
                    {aiAudit.ai_summary.audit_briefing}
                  </p>

                  <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5" /> Recommended Directive:
                    </span>
                    <p className="mt-1 text-xs text-foreground font-medium">
                      {aiAudit.ai_summary.recommended_action}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                  <span>Model: groq/compound-mini / llama-3.3-70b</span>
                  <span>Source: Django REST API + SQLite Aggregates</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Click Refresh AI to connect to the backend Groq AI audit stream.
            </div>
          )}
        </SectionCard>

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
