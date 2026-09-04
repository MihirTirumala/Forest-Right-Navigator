import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpDown, Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { ClaimDetail } from "@/components/claim-detail";
import { useFilters } from "@/lib/filter-store";
import { FLAGS_BY_CLAIM } from "@/data/anomalies";
import type { Claim } from "@/data/claims";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/claims")({
  head: () => ({
    meta: [
      { title: "FRA Claims Register — FRA Monitor" },
      {
        name: "description",
        content:
          "Searchable register of Forest Rights Act claims with status, area, pendency and rule-based flags, and a full claim detail view.",
      },
      { property: "og:title", content: "FRA Claims Register — FRA Monitor" },
      {
        property: "og:description",
        content: "Filter, sort and inspect individual Forest Rights Act claims and their review flags.",
      },
    ],
  }),
  component: ClaimsPage,
});

type SortKey = "id" | "claimant" | "district" | "status" | "areaClaimedHa" | "daysInCurrentStage";

const STATUS_TONE: Record<string, string> = {
  "Title Granted": "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  "DLC Approved": "bg-teal-50 text-teal-700",
  "SDLC Review": "bg-sky-50 text-sky-700",
  "Gram Sabha Approved": "bg-indigo-50 text-indigo-700",
  "Under Verification": "bg-amber-50 text-amber-700",
  Submitted: "bg-slate-100 text-slate-700",
};

const PAGE = 25;

function ClaimsPage() {
  const { claims } = useFilters();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "daysInCurrentStage", dir: -1 });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Claim | null>(null);

  const sorted = useMemo(() => {
    const copy = [...claims];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
    return copy;
  }, [claims, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE));
  const current = Math.min(page, pageCount - 1);
  const rows = sorted.slice(current * PAGE, current * PAGE + PAGE);

  const header = (key: SortKey, label: string, className?: string) => (
    <th className={cn("px-3 py-2 text-left font-medium", className)}>
      <button
        onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === -1 ? 1 : -1 }))}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <ArrowUpDown className="size-3 opacity-50" />
      </button>
    </th>
  );

  function exportCsv() {
    const head = "id,claimant,type,state,district,village,status,areaClaimed,areaGranted,daysInStage\n";
    const body = sorted
      .map((c) =>
        [
          c.id,
          c.claimant,
          c.claimType,
          c.state,
          c.district,
          c.village,
          c.status,
          c.areaClaimedHa,
          c.areaGrantedHa ?? "",
          c.daysInCurrentStage,
        ].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "fra-claims-synthetic.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="FRA Claims" subtitle="Register of individual and community claims under the Act">
      <div className="space-y-5">
        <FilterBar />

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{sorted.length.toLocaleString()}</span> claims
              match the current filters
            </p>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Download className="size-3.5" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {header("id", "Claim ID")}
                  {header("claimant", "Claimant")}
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  {header("district", "District")}
                  {header("status", "Status")}
                  {header("areaClaimedHa", "Area (ha)")}
                  {header("daysInCurrentStage", "Days in stage")}
                  <th className="px-3 py-2 text-left font-medium">Flags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const flags = FLAGS_BY_CLAIM[c.id] ?? [];
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="cursor-pointer border-t border-border hover:bg-muted/50"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{c.claimant}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.claimType}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {c.district}
                        <span className="block text-[11px]">{c.state}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            STATUS_TONE[c.status] ?? "bg-muted text-muted-foreground",
                          )}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{c.areaClaimedHa}</td>
                      <td
                        className={cn(
                          "px-3 py-2 tabular-nums",
                          c.daysInCurrentStage > 365 ? "font-semibold text-red-600" : "text-muted-foreground",
                        )}
                      >
                        {c.daysInCurrentStage}
                      </td>
                      <td className="px-3 py-2">
                        {flags.length ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                            <AlertTriangle className="size-3" />
                            {flags.length}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-sm text-muted-foreground">
                      No claims match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {current + 1} of {pageCount}
            </span>
            <div className="flex gap-2">
              <button
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
                className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
                className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && <ClaimDetail claim={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}
