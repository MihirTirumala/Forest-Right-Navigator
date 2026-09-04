<<<<<<< HEAD
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CLAIMS, type Claim } from "@/data/claims";
import { applyFilters, computeKpis, EMPTY_FILTERS, type Filters } from "@/data/analytics";
import { fetchMappedClaims } from "./api-client";
=======
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { CLAIMS } from "@/data/claims";
import { applyFilters, computeKpis, EMPTY_FILTERS, type Filters } from "@/data/analytics";
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff

type Ctx = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
  claims: ReturnType<typeof applyFilters>;
  kpis: ReturnType<typeof computeKpis>;
  activeCount: number;
<<<<<<< HEAD
  isBackendLoaded: boolean;
=======
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
};

const FilterContext = createContext<Ctx | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
<<<<<<< HEAD
  const [allClaims, setAllClaims] = useState<Claim[]>(CLAIMS);
  const [isBackendLoaded, setIsBackendLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetchMappedClaims()
      .then((loadedClaims) => {
        if (loadedClaims && loadedClaims.length > 0) {
          setAllClaims(loadedClaims);
          setIsBackendLoaded(true);
        }
      })
      .catch((err) => {
        console.warn("Using synthetic fallback data:", err);
      });
  }, []);

  const value = useMemo<Ctx>(() => {
    const claims = applyFilters(filters, allClaims);
=======

  const value = useMemo<Ctx>(() => {
    const claims = applyFilters(filters, CLAIMS);
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
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
      update: (key, val) => setFilters((prev) => ({ ...prev, [key]: val })),
      reset: () => setFilters(EMPTY_FILTERS),
      claims,
      kpis: computeKpis(claims),
      activeCount,
<<<<<<< HEAD
      isBackendLoaded,
    };
  }, [filters, allClaims, isBackendLoaded]);
=======
    };
  }, [filters]);
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}
