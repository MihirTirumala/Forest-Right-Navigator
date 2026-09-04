import { useEffect, useState, type ComponentType } from "react";
import type { RegionStat } from "@/data/analytics";

type Props = {
  states: RegionStat[];
  districts: RegionStat[];
  selectedState: string | null;
  onSelectState: (name: string | null) => void;
  onSelectDistrict: (name: string) => void;
};

export function FraMap(props: Props) {
  const [MapComp, setMapComp] = useState<ComponentType<Props> | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("./fra-map-impl")
      .then((mod) => {
        if (isMounted) {
          setMapComp(() => mod.default);
        }
      })
      .catch((err) => {
        console.error("Failed to load Leaflet map:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!MapComp) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-50/40 text-xs text-emerald-800 font-medium animate-pulse">
        Loading GIS FRA Map…
      </div>
    );
  }

  return <MapComp {...props} />;
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
      <span className="font-semibold uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
        Title conversion
      </span>
      <span className="flex items-center gap-1.5 font-medium text-emerald-800">
        <span className="size-3 rounded-sm bg-[#047857] shadow-xs border border-emerald-900/30" /> ≥ 30% (High Progress)
      </span>
      <span className="flex items-center gap-1.5 font-medium text-emerald-700">
        <span className="size-3 rounded-sm bg-[#10b981] shadow-xs border border-emerald-700/30" /> 20–30% (Moderate)
      </span>
      <span className="flex items-center gap-1.5 font-medium text-emerald-600">
        <span className="size-3 rounded-sm bg-[#34d399] shadow-xs border border-emerald-500/30" /> &lt; 20% (In Progress)
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-3 rounded-sm bg-[#a7f3d0] border border-emerald-400/50" /> Other Forest Territories
      </span>
      <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Official Administrative Boundaries (Survey of India datum)
      </span>
    </div>
  );
}
