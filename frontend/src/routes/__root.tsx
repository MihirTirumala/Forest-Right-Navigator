import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
<<<<<<< HEAD
} from "@tanstack/react-router";
import { useEffect } from "react";

=======
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
import { FilterProvider } from "../lib/filter-store";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
<<<<<<< HEAD
  console.error("Root route error:", error);
=======
  console.error(error);
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
<<<<<<< HEAD
          {error?.message || "Something went wrong on our end. You can try refreshing or head back home."}
=======
          Something went wrong on our end. You can try refreshing or head back home.
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
<<<<<<< HEAD
=======
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FRA Monitor — Forest Rights Act Decision Support" },
      {
        name: "description",
        content:
          "Decision support for Forest Rights Act implementation: claim analytics, GIS view, anomaly rules and advisory insights on synthetic demo data.",
      },
      { property: "og:title", content: "FRA Monitor — Forest Rights Act Decision Support" },
      {
        property: "og:description",
        content: "Claim analytics, GIS mapping and transparent anomaly rules for FRA implementation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

<<<<<<< HEAD
=======
function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
<<<<<<< HEAD
=======
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
>>>>>>> d1519aca71fe5b10b28f6a281e8a801069302dff
        <Outlet />
      </FilterProvider>
    </QueryClientProvider>
  );
}
