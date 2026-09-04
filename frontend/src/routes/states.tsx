import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { SectionCard } from "@/components/kpi-card";
import { useFilters } from "@/lib/filter-store";
import { districtStats, performanceBand, stateStats } from "@/data/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/states")({
  head: () => ({
    meta: [
      { title: "State Performance — FRA Monitor" },
      {
        name: "description",
        content:
          "Compare Forest Rights Act implementation across states and districts: title conversion, rejection rates, pendency and flagged claims.",
      },
      { property: "og:title", content: "State Performance — FRA Monitor" },
      {
        property: "og:description",
        content: "State and district league tables for FRA claim throughput and process quality.",
      },
    ],
  }),
  component: StatesPage,
});

const BAND_TONE = {
  good: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-800",
  bad: "bg-red-50 text-red-700",
};

function StatesPage() {
  const { claims, update } = useFilters();
  const states = useMemo(() => stateStats(claims), [claims]);
  const districts = useMemo(() => districtStats(claims), [claims]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const chartData = states.map((s) => ({
    name: s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name,
    Titled: Number(s.titleRate.toFixed(1)),
    Rejected: Number(s.rejectionRate.toFixed(1)),
  }));

  return (
    <AppShell title="State Performance" subtitle="Comparative implementation across states and districts">
      <div className="space-y-5">
        <FilterBar compact />

        <SectionCard title="Title conversion vs rejection rate" description="Percent of claims in each state">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 10, top: 20 }} barGap={6}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} unit="%" axisLine={false} tickLine={false} />
                <RTooltip 
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    borderColor: 'var(--color-border)', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
                  labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
                />
                <Bar dataKey="Titled" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Rejected" fill="#f43f5e" opacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="State league table"
          description="Click a state to expand its districts, or to filter the whole dashboard to it"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">State</th>
                  <th className="px-3 py-2 text-right font-medium">Claims</th>
                  <th className="px-3 py-2 text-right font-medium">Titled</th>
                  <th className="px-3 py-2 text-right font-medium">Rejected</th>
                  <th className="px-3 py-2 text-right font-medium">Avg days</th>
                  <th className="px-3 py-2 text-right font-medium">Flagged</th>
                  <th className="px-3 py-2 text-left font-medium">Band</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => {
                  const band = performanceBand(s.titleRate);
                  const kids = districts.filter((d) => d.state === s.name);
                  return (
                    <Fragment key={s.name}>
                      <tr
                        onClick={() => setExpanded(expanded === s.name ? null : s.name)}
                        className="cursor-pointer border-t border-border hover:bg-muted/50"
                      >
                        <td className="px-3 py-2 font-medium text-foreground">{s.name}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{s.total}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-emerald-700">
                          {s.titled} ({s.titleRate.toFixed(1)}%)
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-red-700">
                          {s.rejected} ({s.rejectionRate.toFixed(1)}%)
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{s.avgDaysPending}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{s.flagged}</td>
                        <td className="px-3 py-2">
                          <span className={cn("rounded-full px-2 py-0.5 text-xs", BAND_TONE[band.tone])}>
                            {band.label}
                          </span>
                        </td>
                      </tr>
                      {expanded === s.name &&
                        kids.map((d) => (
                          <tr key={d.name} className="border-t border-border bg-muted/30 text-xs">
                            <td className="py-1.5 pl-8 pr-3 text-muted-foreground">
                              {d.name}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  update("states", [s.name]);
                                  update("districts", [d.name]);
                                }}
                                className="ml-2 text-primary hover:underline"
                              >
                                filter
                              </button>
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{d.total}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{d.titleRate.toFixed(1)}%</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {d.rejectionRate.toFixed(1)}%
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{d.avgDaysPending}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{d.flagged}</td>
                            <td />
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Fastest districts" description="Lowest average days in current stage">
            <ol className="space-y-2 text-sm">
              {[...districts]
                .sort((a, b) => a.avgDaysPending - b.avgDaysPending)
                .slice(0, 6)
                .map((d, i) => (
                  <li key={d.name} className="flex items-center justify-between">
                    <span>
                      <span className="mr-2 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{d.state}</span>
                    </span>
                    <span className="tabular-nums text-emerald-700">{d.avgDaysPending} d</span>
                  </li>
                ))}
            </ol>
          </SectionCard>
          <SectionCard title="Slowest districts" description="Highest average days in current stage">
            <ol className="space-y-2 text-sm">
              {[...districts]
                .sort((a, b) => b.avgDaysPending - a.avgDaysPending)
                .slice(0, 6)
                .map((d, i) => (
                  <li key={d.name} className="flex items-center justify-between">
                    <span>
                      <span className="mr-2 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{d.state}</span>
                    </span>
                    <span className="tabular-nums text-red-700">{d.avgDaysPending} d</span>
                  </li>
                ))}
            </ol>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
