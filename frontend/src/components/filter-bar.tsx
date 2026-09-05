import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFilters } from "@/lib/filter-store";
import { STATES } from "@/data/geo";
import { STATUSES, type ClaimStatus, type ClaimType } from "@/data/claims";
import { cn } from "@/lib/utils";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function FilterBar({ compact = false }: { compact?: boolean }) {
  const { filters, update, reset, activeCount } = useFilters();
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        update("search", localSearch);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, update]);

  const districts = STATES.filter((s) => !filters.states.length || filters.states.includes(s.state)).flatMap(
    (s) => s.districts,
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update("search", localSearch);
              }
            }}
            placeholder="Search claim ID, claimant, village, district…"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-primary"
          />
          {localSearch ? (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                update("search", "");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <select
          value={filters.states[0] ?? ""}
          onChange={(e) => {
            update("states", e.target.value ? [e.target.value] : []);
            update("districts", []);
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s.state}>{s.state}</option>
          ))}
        </select>

        <select
          value={filters.districts[0] ?? ""}
          onChange={(e) => update("districts", e.target.value ? [e.target.value] : [])}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d.district}>{d.district}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={filters.onlyFlagged}
            onChange={(e) => update("onlyFlagged", e.target.checked)}
            className="size-4 accent-[oklch(0.42_0.09_155)]"
          />
          Flagged only
        </label>

        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Clear ({activeCount})
          </button>
        )}
      </div>

      {!compact && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">Type</span>
            {(["IFR", "CR", "CFR"] as ClaimType[]).map((t) => (
              <Chip
                key={t}
                active={filters.claimTypes.includes(t)}
                onClick={() => update("claimTypes", toggle(filters.claimTypes, t))}
              >
                {t}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">Status</span>
            {STATUSES.map((s) => (
              <Chip
                key={s}
                active={filters.statuses.includes(s)}
                onClick={() => update("statuses", toggle(filters.statuses, s as ClaimStatus))}
              >
                {s}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">Pending</span>
            <input
              type="range"
              min={0}
              max={720}
              step={30}
              value={filters.minDaysPending}
              onChange={(e) => update("minDaysPending", Number(e.target.value))}
              className="w-56 accent-[oklch(0.42_0.09_155)]"
            />
            <span className="text-xs text-muted-foreground">
              {filters.minDaysPending === 0 ? "any duration" : `${filters.minDaysPending}+ days in stage`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
