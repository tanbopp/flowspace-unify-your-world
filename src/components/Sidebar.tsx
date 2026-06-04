import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Search, Inbox, FileText, LayoutGrid, Calendar, Star, Trash2,
  Settings as SettingsIcon, ChevronRight, ChevronDown, Plus, MoreHorizontal, PanelLeft
} from "lucide-react";
import { useState } from "react";
import { useStore, actions, type Page } from "../lib/store";
import { cn } from "../lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function Sidebar({ collapsed, onOpenCommand }: { collapsed: boolean; onOpenCommand: () => void }) {
  const workspaceName = useStore(s => s.workspaceName);
  const pages = useStore(s => s.pages.filter(p => !p.trashed));
  const boards = useStore(s => s.boards.filter(b => !b.trashed));
  const notifs = useStore(s => s.notifications.filter(n => !n.read).length);
  const favorites = [
    ...pages.filter(p => p.favorite).map(p => ({ kind: "page" as const, id: p.id, name: p.title, icon: p.icon })),
    ...boards.filter(b => b.favorite).map(b => ({ kind: "board" as const, id: b.id, name: b.name, icon: b.icon })),
  ];
  const navigate = useNavigate();

  const rootPages = pages.filter(p => !p.parentId);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <IconBtn onClick={() => actions.toggleSidebar()} icon={<PanelLeft className="h-4 w-4" />} />
        <IconBtn onClick={() => navigate({ to: "/" })} icon={<Home className="h-4 w-4" />} />
        <IconBtn onClick={onOpenCommand} icon={<Search className="h-4 w-4" />} />
        <IconBtn onClick={() => navigate({ to: "/boards" })} icon={<LayoutGrid className="h-4 w-4" />} />
        <IconBtn onClick={() => navigate({ to: "/calendar" })} icon={<Calendar className="h-4 w-4" />} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-sidebar-foreground">
      <div className="px-2 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 text-sm font-semibold truncate">
          <span className="text-base">🌊</span>
          <span className="truncate">{workspaceName}</span>
        </div>
        <button onClick={() => actions.toggleSidebar()} className="p-1 rounded hover:bg-sidebar-hover">
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="px-2 space-y-0.5 mt-1">
        <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Home" />
        <button onClick={onOpenCommand} className="w-full flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-sidebar-hover">
          <Search className="h-4 w-4" /><span>Search</span>
          <span className="ml-auto text-[10px] text-muted-foreground">⌘K</span>
        </button>
        <NavItem to="/inbox" icon={<Inbox className="h-4 w-4" />} label="Inbox" badge={notifs > 0 ? notifs : undefined} />
      </nav>

      <div className="flex-1 overflow-y-auto mt-3 px-2 space-y-3">
        {favorites.length > 0 && (
          <Section title="Favorites">
            {favorites.map(f => (
              <Link key={f.id} to={f.kind === "page" ? "/pages/$id" : "/boards/$id"} params={{ id: f.id }}
                className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-sidebar-hover [&.active]:bg-sidebar-active"
                activeProps={{ className: "active" }}>
                <span>{f.icon}</span><span className="truncate">{f.name}</span>
              </Link>
            ))}
          </Section>
        )}

        <Section title="Pages" action={<button onClick={() => {
          const id = actions.createPage();
          navigate({ to: "/pages/$id", params: { id } });
        }} className="p-0.5 hover:bg-sidebar-hover rounded"><Plus className="h-3.5 w-3.5" /></button>}>
          {rootPages.map(p => <PageTree key={p.id} page={p} pages={pages} depth={0} />)}
          {rootPages.length === 0 && <div className="text-xs text-muted-foreground px-2 py-1">No pages</div>}
        </Section>

        <Section title="Boards" action={<button onClick={() => {
          const id = actions.createBoard();
          navigate({ to: "/boards/$id", params: { id } });
        }} className="p-0.5 hover:bg-sidebar-hover rounded"><Plus className="h-3.5 w-3.5" /></button>}>
          {boards.map(b => (
            <Link key={b.id} to="/boards/$id" params={{ id: b.id }}
              className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-sidebar-hover [&.active]:bg-sidebar-active"
              activeProps={{ className: "active" }}>
              <span>{b.icon}</span><span className="truncate">{b.name}</span>
            </Link>
          ))}
        </Section>

        <Section title="Calendar">
          <NavItem to="/calendar" icon={<Calendar className="h-4 w-4" />} label="Calendar" />
        </Section>
      </div>

      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <NavItem to="/trash" icon={<Trash2 className="h-4 w-4" />} label="Trash" />
        <NavItem to="/settings" icon={<SettingsIcon className="h-4 w-4" />} label="Settings" />
      </div>
    </div>
  );
}

function IconBtn({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="p-2 rounded hover:bg-sidebar-hover">{icon}</button>;
}

function NavItem({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-sidebar-hover [&.active]:bg-sidebar-active"
      activeProps={{ className: "active" }} activeOptions={{ exact: to === "/" }}>
      {icon}<span>{label}</span>
      {badge ? <span className="ml-auto text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">{badge}</span> : null}
    </Link>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{title}</span>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function PageTree({ page, pages, depth }: { page: Page; pages: Page[]; depth: number }) {
  const children = pages.filter(p => p.parentId === page.id);
  const [open, setOpen] = useState(true);
  const router = useRouterState({ select: r => r.location.pathname });
  const isActive = router === `/pages/${page.id}`;
  const navigate = useNavigate();

  return (
    <div>
      <div className={cn("group flex items-center gap-1 px-1 py-1 text-sm rounded hover:bg-sidebar-hover", isActive && "bg-sidebar-active")} style={{ paddingLeft: 4 + depth * 12 }}>
        {children.length > 0 ? (
          <button onClick={() => setOpen(o => !o)} className="p-0.5 hover:bg-sidebar-active rounded">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : <span className="w-4" />}
        <button onClick={() => navigate({ to: "/pages/$id", params: { id: page.id } })} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
          <span className="text-sm">{page.icon}</span>
          <span className="truncate">{page.title || "Untitled"}</span>
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-sidebar-active rounded"><MoreHorizontal className="h-3.5 w-3.5" /></button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            <MenuItem onClick={() => actions.toggleFavorite("page", page.id)}>{page.favorite ? "Unfavorite" : "Add to Favorites"}</MenuItem>
            <MenuItem onClick={() => { const id = actions.createPage(page.id); navigate({ to: "/pages/$id", params: { id } }); }}>Add sub-page</MenuItem>
            <MenuItem onClick={() => { const newTitle = prompt("Rename page", page.title); if (newTitle != null) actions.updatePage(page.id, { title: newTitle }); }}>Rename</MenuItem>
            <MenuItem destructive onClick={() => actions.deletePage(page.id)}>Delete</MenuItem>
          </PopoverContent>
        </Popover>
        <button onClick={() => { const id = actions.createPage(page.id); setOpen(true); navigate({ to: "/pages/$id", params: { id } }); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-sidebar-active rounded">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && children.map(c => <PageTree key={c.id} page={c} pages={pages} depth={depth + 1} />)}
    </div>
  );
}

export function MenuItem({ children, onClick, destructive }: { children: React.ReactNode; onClick?: () => void; destructive?: boolean }) {
  return (
    <button onClick={onClick} className={cn("w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent", destructive && "text-destructive")}>
      {children}
    </button>
  );
}
