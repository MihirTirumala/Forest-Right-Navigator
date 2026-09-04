import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Sparkles,
  TreePine,
  Settings,
  UserRound,
} from "lucide-react";
import { useFilters } from "@/lib/filter-store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/claims", label: "FRA Claims", icon: FileText },
  { to: "/anomalies", label: "Anomalies", icon: AlertTriangle },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/states", label: "State Performance", icon: BarChart3 },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { claims, activeCount } = useFilters();

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TreePine className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">FRA Monitor</p>
            <p className="text-[11px] text-muted-foreground">Decision Support System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:font-medium data-[status=active]:text-primary"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border p-4 text-[11px] leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <MapIcon className="size-3.5" /> Synthetic demo data
          </p>
          <p>
            All {claims.length ? "" : ""}records, boundaries and scores are generated for demonstration.
            Recommendations are advisory and require human review.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card/95 px-6 py-3 backdropblur">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary md:inline">
              {claims.length.toLocaleString()} claims in view
              {activeCount ? ` · ${activeCount} filter${activeCount > 1 ? "s" : ""}` : ""}
            </span>
            <button className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground">
              <Settings className="size-4" />
            </button>
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-4" />
            </span>
          </div>
        </header>

        <div className="border-b border-amber-200 bg-amber-50 px-6 py-1.5 text-[11px] text-amber-900">
          Demonstration environment — synthetic dataset. Outputs are decision support only and are not a
          determination under the Forest Rights Act, 2006.
        </div>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
