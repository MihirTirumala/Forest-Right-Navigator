import { lazy, Suspense, useEffect, useState } from "react";
import type { RegionStat } from "@/data/analytics";

const FraMapClient = lazy(() => import("./fra-map-impl"));

type Props = {
  states: RegionStat[];
  districts: RegionStat[];
  selectedState: string | null;
  onSelectState: (name: string | null) => void;
  onSelectDistrict: (name: string) => void;
};

export function FraMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
        Loading map…
      </div>
    );

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
          Loading map…
        </div>
      }
    >
      <FraMapClient {...props} />
    </Suspense>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
      <span className="font-medium uppercase tracking-wide">Title conversion</span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-emerald-600" /> 30% and above
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-yellow-500" /> 20–30%
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-red-600" /> below 20%
      </span>
      <span className="ml-auto italic">Boundaries are simplified mock geometry, not survey data.</span>
    </div>
  );
}
