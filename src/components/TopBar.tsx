import { useRouterState, Link } from "@tanstack/react-router";
import { Search, Plus, Bell, Moon, Sun } from "lucide-react";
import { useStore, actions } from "../lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useNavigate } from "@tanstack/react-router";

export function TopBar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const pages = useStore((s) => s.pages);
  const boards = useStore((s) => s.boards);
  const theme = useStore((s) => s.theme);
  const notifs = useStore((s) => s.notifications);
  const navigate = useNavigate();

  const crumbs: { label: string; to?: any; params?: any }[] = [];
  if (path === "/") crumbs.push({ label: "Home" });
  else if (path.startsWith("/pages/")) {
    const id = path.split("/")[2];
    const chain: any[] = [];
    let cur = pages.find((p) => p.id === id);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parentId ? pages.find((p) => p.id === cur!.parentId) : undefined;
    }
    chain.forEach((p) =>
      crumbs.push({
        label: `${p.icon} ${p.title || "Untitled"}`,
        to: "/pages/$id",
        params: { id: p.id },
      }),
    );
  } else if (path === "/boards") crumbs.push({ label: "Boards" });
  else if (path.startsWith("/boards/")) {
    crumbs.push({ label: "Boards", to: "/boards" });
    const b = boards.find((b) => b.id === path.split("/")[2]);
    if (b) crumbs.push({ label: `${b.icon} ${b.name}` });
  } else if (path === "/calendar") crumbs.push({ label: "Calendar" });
  else if (path === "/settings") crumbs.push({ label: "Settings" });
  else if (path === "/trash") crumbs.push({ label: "Trash" });
  else if (path === "/inbox") crumbs.push({ label: "Inbox" });

  return (
    <header className="h-11 shrink-0 border-b flex items-center gap-2 px-3">
      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-1 min-w-0 overflow-hidden">
        {crumbs.map((c, i) => (
          <div key={i} className="flex items-center gap-1 truncate">
            {i > 0 && <span className="opacity-50">/</span>}
            {c.to ? (
              <Link to={c.to} params={c.params} className="hover:text-foreground truncate">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground truncate">{c.label}</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onOpenCommand}
        className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md hover:bg-accent"
      >
        <Search className="h-3.5 w-3.5" /> Search... <span className="ml-1 opacity-60">⌘K</span>
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1.5 rounded hover:bg-accent">
            <Plus className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="end">
          <button
            onClick={() => {
              const id = actions.createPage();
              navigate({ to: "/pages/$id", params: { id } });
            }}
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
          >
            📄 New page
          </button>
          <button
            onClick={() => {
              const id = actions.createBoard();
              navigate({ to: "/boards/$id", params: { id } });
            }}
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
          >
            📋 New board
          </button>
          <button
            onClick={() => navigate({ to: "/calendar" })}
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
          >
            📅 New event
          </button>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1.5 rounded hover:bg-accent relative">
            <Bell className="h-4 w-4" />
            {notifs.some((n) => !n.read) && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-destructive rounded-full" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2" align="end">
          <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b">
            <span className="text-sm font-medium">Notifications</span>
            <button
              onClick={() => actions.markAllRead()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          </div>
          {notifs.length === 0 && (
            <div className="text-xs text-muted-foreground p-3 text-center">All caught up 🎉</div>
          )}
          {notifs.map((n) => (
            <div key={n.id} className="px-2 py-2 text-sm rounded hover:bg-accent">
              <div>{n.text}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {new Date(n.at).toLocaleString()}
              </div>
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <button
        onClick={() => actions.setTheme(theme === "dark" ? "light" : "dark")}
        className="p-1.5 rounded hover:bg-accent"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  );
}
