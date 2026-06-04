import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { AppShell } from "../components/AppShell";
import { useStore } from "../lib/store";
import { Toaster } from "../components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FlowSpace — Docs, Tasks & Calendar" },
      { name: "description", content: "All-in-one productivity workspace." },
      { property: "og:title", content: "FlowSpace — Docs, Tasks & Calendar" },
      { name: "twitter:title", content: "FlowSpace — Docs, Tasks & Calendar" },
      { property: "og:description", content: "All-in-one productivity workspace." },
      { name: "twitter:description", content: "All-in-one productivity workspace." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/389a60b8-7ccd-4e81-8ca5-22255c06c46f/id-preview-e95c4663--c209761c-287b-49d7-a0f6-1b6292459990.lovable.app-1780575730088.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/389a60b8-7ccd-4e81-8ca5-22255c06c46f/id-preview-e95c4663--c209761c-287b-49d7-a0f6-1b6292459990.lovable.app-1780575730088.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => <div className="p-8">Not found</div>,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const theme = useStore(s => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell><Outlet /></AppShell>
      <Toaster />
    </QueryClientProvider>
  );
}
