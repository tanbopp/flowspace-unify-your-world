import { type ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { useStore } from "../lib/store";
import { cn } from "../lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useStore(s => s.sidebarCollapsed);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className={cn(
        "shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-150 ease-out",
        collapsed ? "w-12" : "w-60"
      )}>
        <Sidebar collapsed={collapsed} onOpenCommand={() => setCmdOpen(true)} />
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenCommand={() => setCmdOpen(true)} />
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
