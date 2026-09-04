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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
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

const TYPE_COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

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
                    <RTooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
                    />
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
                <BarChart data={statuses} margin={{ left: -20, top: 10 }} barSize={32}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                  <XAxis dataKey="status" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} interval={0} angle={-18} textAnchor="end" height={60} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <RTooltip 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
                    labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Submissions and titles over time" description="Monthly, last 24 months in scope">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <RTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
                    labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="titled" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
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
            description="Claims conversion, pending stages and granted area by state"
            action={
              <Link to="/states" className="text-xs font-medium text-primary hover:underline">
                View All ({states.length}) →
              </Link>
            }
          >
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {states.slice(0, 8).map((s, idx) => {
                const isSelected = filters.states.includes(s.name);
                return (
                  <div
                    key={s.name}
                    onClick={() => update("states", isSelected ? [] : [s.name])}
                    className={cn(
                      "group cursor-pointer rounded-lg border p-2.5 transition-all hover:border-primary/40 hover:bg-accent/40",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <span className="truncate font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {s.titleRate.toFixed(1)}% Titled
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {s.total} claims
                        </span>
                      </div>
                    </div>

                    {/* Tri-color conversion bar: Green (Titled), Amber (Pending), Red (Rejected) */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted flex">
                      <span
                        title={`Titled: ${s.titled} (${s.titleRate.toFixed(1)}%)`}
                        style={{ width: `${s.titleRate}%` }}
                        className="h-full bg-emerald-600 transition-all duration-300"
                      />
                      <span
                        title={`Pending: ${s.pending}`}
                        style={{ width: `${s.total > 0 ? (s.pending / s.total) * 100 : 0}%` }}
                        className="h-full bg-amber-500 transition-all duration-300"
                      />
                      <span
                        title={`Rejected: ${s.rejected} (${s.rejectionRate.toFixed(1)}%)`}
                        style={{ width: `${s.rejectionRate}%` }}
                        className="h-full bg-red-500 transition-all duration-300"
                      />
                    </div>

                    {/* Detailed State Claims Metrics */}
                    <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] sm:grid-cols-4 text-muted-foreground">
                      <div>
                        <span className="text-muted-foreground/70">Granted: </span>
                        <span className="font-medium text-foreground">{s.titled}</span> ({(s.areaGranted ?? 0).toLocaleString()} ha)
                      </div>
                      <div>
                        <span className="text-muted-foreground/70">Pending: </span>
                        <span className="font-medium text-foreground">{s.pending}</span> ({s.avgDaysPending}d avg)
                      </div>
                      <div>
                        <span className="text-muted-foreground/70">Rejected: </span>
                        <span className="font-medium text-red-600">{s.rejected}</span> ({s.rejectionRate.toFixed(0)}%)
                      </div>
                      <div>
                        <span className="text-muted-foreground/70">Anomalies: </span>
                        <span className={cn("font-medium", s.flagged > 0 ? "text-amber-600 font-semibold" : "text-foreground")}>
                          {s.flagged} flagged
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
