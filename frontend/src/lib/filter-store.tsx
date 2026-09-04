import { createContext, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { CLAIMS } from "@/data/claims";
import { applyFilters, computeKpis, EMPTY_FILTERS, type Filters } from "@/data/analytics";

type Ctx = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
  claims: ReturnType<typeof applyFilters>;
  kpis: ReturnType<typeof computeKpis>;
  activeCount: number;
};

const FilterContext = createContext<Ctx | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const [, startTransition] = useTransition();

  const value = useMemo<Ctx>(() => {
    const claims = applyFilters(filters, CLAIMS);
    const activeCount =
      filters.states.length +
      filters.districts.length +
      filters.claimTypes.length +
      filters.statuses.length +
      (filters.search ? 1 : 0) +
      (filters.onlyFlagged ? 1 : 0) +
      (filters.minDaysPending > 0 ? 1 : 0);
    return {
      filters,
      setFilters,
      update: (key, val) => startTransition(() => setFilters((prev) => ({ ...prev, [key]: val }))),
      reset: () => startTransition(() => setFilters(EMPTY_FILTERS)),
      claims,
      kpis: computeKpis(claims),
      activeCount,
    };
  }, [filters]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}
