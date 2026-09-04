import { Link } from "@tanstack/react-router";
import { type ReactNode, useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/claims", label: "FRA Claims", icon: FileText },
  { to: "/anomalies", label: "Anomalies", icon: AlertTriangle },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/states", label: "State Performance", icon: BarChart3 },
] as const;

/** 
 * Indian Flag Tricolour Menu Button
 * Styled with Royal Navy Blue background and solid Saffron, White, and Green bars.
 */
function TirangaMenuButton({
  onClick,
  className = "",
  title = "Toggle navigation menu",
}: {
  onClick: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label="Toggle navigation menu"
      className={cn(
        "group relative flex size-10 items-center justify-center rounded-xl bg-[#1c2763] shadow-md transition-all duration-200 hover:bg-[#161f52] hover:scale-105 active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#FF671F]/40 cursor-pointer",
        className,
      )}
    >
      <div className="flex h-5 w-6 flex-col justify-between py-0.5">
        {/* Top: Saffron */}
        <span className="h-[3.5px] w-full rounded-[2px] bg-[#FF671F] shadow-xs transition-all duration-200 group-hover:brightness-110" />
        {/* Middle: Pure White */}
        <span className="h-[3.5px] w-full rounded-[2px] bg-[#FFFFFF] shadow-xs transition-all duration-200 group-hover:brightness-110" />
        {/* Bottom: India Green */}
        <span className="h-[3.5px] w-full rounded-[2px] bg-[#046A38] shadow-xs transition-all duration-200 group-hover:brightness-110" />
      </div>
    </button>
  );
}

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fra_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("fra_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Indian National Tricolour Top Banner Ribbon */}
      <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#FF671F] via-white to-[#046A38]" />

      <div className="relative flex flex-1">
        {/* Mobile Backdrop */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
            !collapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setCollapsed(true)}
        />

        {/* Retractable Sidebar (Both Mobile & Desktop) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card shadow-2xl transition-all duration-300 ease-in-out overflow-hidden lg:static lg:shadow-none shrink-0",
            collapsed
              ? "w-0 -translate-x-full border-r-0 opacity-0 pointer-events-none lg:w-0 lg:translate-x-0"
              : "w-64 translate-x-0 opacity-100 border-r",
          )}
        >
          {/* Inner fixed-width container to prevent text reflow jitter during smooth width transition */}
          <div className="w-64 flex flex-col h-full shrink-0 select-none">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                  <TreePine className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-foreground">
                    FRA Monitor
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Decision Support System
                  </p>
                </div>
              </div>

              {/* Tiranga button inside sidebar to retract */}
              <TirangaMenuButton
                onClick={toggleSidebar}
                className="size-8.5 rounded-lg"
                title="Retract menu"
              />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setCollapsed(true);
                    }
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                >
                  <item.icon className="size-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="space-y-2 border-t border-border p-4 text-[11px] leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <MapIcon className="size-3.5 shrink-0" /> Synthetic demo data
              </p>
              <p>
                All records, boundaries and scores are generated for demonstration.
                Recommendations are advisory and require human review.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Page Area */}
        <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Only show in header when sidebar is retracted (avoids two buttons side by side) */}
              {collapsed && (
                <TirangaMenuButton
                  onClick={toggleSidebar}
                  title="Expand menu"
                />
              )}

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
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
    </div>
  );
}
