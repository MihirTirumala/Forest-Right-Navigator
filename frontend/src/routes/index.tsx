import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  FileText,
  Landmark,
  ScrollText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { KpiCard, SectionCard } from "@/components/kpi-card";
import { FraMap, MapLegend } from "@/components/fra-map";
import { useFilters } from "@/lib/filter-store";
import { districtStats, monthlyTrend, stateStats, statusBreakdown, typeBreakdown } from "@/data/analytics";
import { generateInsights } from "@/data/insights";
import { CLAIM_TYPE_LABEL } from "@/data/claims";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRA Monitor — Forest Rights Act Decision Support Dashboard" },
      {
        name: "description",
        content:
          "Monitor Forest Rights Act claims across states and districts: KPIs, GIS map, anomaly flags and data-grounded advisory insights.",
      },
      { property: "og:title", content: "FRA Monitor — Forest Rights Act Decision Support Dashboard" },
      {
        property: "og:description",
        content:
          "Claim throughput, district bottlenecks, rule-based anomaly flags and advisory insights for FRA implementation.",
      },
    ],
  }),
  component: Dashboard,
});

const TYPE_COLORS = ["#166534", "#0d9488", "#a16207"];

function Dashboard() {
  const { claims, kpis, filters, update } = useFilters();
  const [panelDistrict, setPanelDistrict] = useState<string | null>(null);

  const districts = useMemo(() => districtStats(claims), [claims]);
  const states = useMemo(() => stateStats(claims), [claims]);
  const trend = useMemo(() => monthlyTrend(claims), [claims]);
  const statuses = useMemo(() => statusBreakdown(claims), [claims]);
  const types = useMemo(() => typeBreakdown(claims), [claims]);
  const insights = useMemo(() => generateInsights(claims).slice(0, 3), [claims]);
  const panel = districts.find((d) => d.name === panelDistrict);

  return (
    <AppShell
      title="Implementation Dashboard"
      subtitle="Forest Rights Act, 2006 — claim throughput, geography and risk signals"
    >
      <div className="space-y-5">
        <FilterBar />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Claims in view" value={kpis.total.toLocaleString()} icon={FileText} hint={`${kpis.pending} still in process`} />
          <KpiCard
            label="Title conversion"
            value={`${kpis.titleRate.toFixed(1)}%`}
            icon={ShieldCheck}
            tone="good"
            hint={`${kpis.titled.toLocaleString()} titles recorded`}
          />
          <KpiCard
            label="Avg days in stage"
            value={`${kpis.avgDaysPending}`}
            icon={Clock}
            tone={kpis.avgDaysPending > 300 ? "bad" : "warn"}
            hint={`${kpis.overdue} static beyond 365 days`}
          />
          <KpiCard
            label="Flagged claims"
            value={kpis.flagged.toLocaleString()}
            icon={AlertTriangle}
            tone="bad"
            hint="Rule matches needing human review"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard
            title="Geographic view"
            description="Click a state polygon to focus, a district circle to open its panel."
            className="xl:col-span-2"
          >
            <div className="h-[420px] overflow-hidden rounded-lg border border-border">
              <FraMap
                states={states}
                districts={districts}
                selectedState={filters.states[0] ?? null}
                onSelectState={(name) => {
                  update("states", name ? [name] : []);
                  update("districts", []);
                  setPanelDistrict(null);
                }}
                onSelectDistrict={(name) => setPanelDistrict(name)}
              />
            </div>
            <div className="mt-3">
              <MapLegend />
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard
              title={panel ? `${panel.name} district` : "District panel"}
              description={panel ? `${panel.state}` : "Select a district on the map"}
              action={
                panel ? (
                  <button
                    onClick={() => {
                      update("districts", [panel.name]);
                      update("states", [panel.state]);
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                  >
                    Filter to district
                  </button>
                ) : null
              }
            >
              {panel ? (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Claims", panel.total.toLocaleString()],
                      ["Titled", `${panel.titled} (${panel.titleRate.toFixed(1)}%)`],
                      ["Rejected", `${panel.rejected} (${panel.rejectionRate.toFixed(1)}%)`],
                      ["Avg days in stage", `${panel.avgDaysPending}`],
                      ["Pending", `${panel.pending}`],
                      ["Flagged", `${panel.flagged}`],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-lg bg-muted/60 p-3">
                        <p className="text-[11px] text-muted-foreground">{l}</p>
                        <p className="font-semibold text-foreground">{v}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/claims"
                    onClick={() => {
                      update("states", [panel.state]);
                      update("districts", [panel.name]);
                    }}
                    className="inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Open the claim register for {panel.name} →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Circle size reflects claim volume; colour reflects title conversion.
                </p>
              )}
            </SectionCard>

            <SectionCard title="Claims by type">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={types} dataKey="count" nameKey="type" innerRadius={38} outerRadius={64}>
                      {types.map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[i]} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {types.map((t, i) => (
                  <li key={t.type} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: TYPE_COLORS[i] }} />
                    {CLAIM_TYPE_LABEL[t.type]} — {t.count}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Claims pipeline" description="Volume at each stage of the statutory process">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statuses} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Submissions and titles over time" description="Monthly, last 24 months in scope">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Area type="monotone" dataKey="submitted" stroke="#0d9488" fill="#0d948833" />
                  <Area type="monotone" dataKey="titled" stroke="#166534" fill="#16653433" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Advisory insights"
          description="Generated from the filtered dataset — for human review, not decision-making"
          action={
            <Link to="/insights" className="text-xs font-medium text-primary hover:underline">
              All insights →
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            {insights.map((i) => (
              <article key={i.id} className="rounded-lg border border-border p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {i.id === "overview" ? <Landmark className="size-4 text-primary" /> : i.severity === "high" ? <AlertTriangle className="size-4 text-red-600" /> : <TrendingUp className="size-4 text-primary" />}
                  {i.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{i.body}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="State scoreboard"
            description="Ranked by title conversion within current filters"
            action={
              <Link to="/states" className="text-xs font-medium text-primary hover:underline">
                Detail →
              </Link>
            }
          >
            <ul className="space-y-2">
              {states.slice(0, 6).map((s) => (
                <li key={s.name} className="flex items-center gap-3 text-sm">
                  <span className="w-40 truncate text-foreground">{s.name}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, s.titleRate * 2)}%` }}
                    />
                  </span>
                  <span className="w-12 text-right tabular-nums text-muted-foreground">
                    {s.titleRate.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Districts needing attention"
            description="Highest count of rule-based flags"
            action={
              <Link to="/anomalies" className="text-xs font-medium text-primary hover:underline">
                Anomalies →
              </Link>
            }
          >
            <ul className="divide-y divide-border text-sm">
              {[...districts]
                .sort((a, b) => b.flagged - a.flagged)
                .slice(0, 6)
                .map((d) => (
                  <li key={d.name} className="flex items-center justify-between py-2">
                    <span>
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{d.state}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{d.avgDaysPending} d avg</span>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                        {d.flagged} flagged
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </SectionCard>
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <ScrollText className="mt-0.5 size-4 shrink-0" />
          Every figure on this page is computed from a synthetic dataset of {claims.length.toLocaleString()}{" "}
          generated claims. Nothing here constitutes a determination under the Forest Rights Act; all outputs
          are advisory and must be verified by the competent authority.
        </p>
      </div>
    </AppShell>
  );
}
