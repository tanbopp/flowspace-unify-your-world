import { useNavigate } from "@tanstack/react-router";
import { useStore } from "../lib/store";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { FileText, LayoutGrid, Calendar as CalIcon } from "lucide-react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const pages = useStore(s => s.pages.filter(p => !p.trashed));
  const boards = useStore(s => s.boards.filter(b => !b.trashed));
  const cards = useStore(s => s.cards.filter(c => !c.trashed));
  const events = useStore(s => s.events);
  const navigate = useNavigate();

  const go = (fn: () => void) => { onOpenChange(false); setTimeout(fn, 0); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, tasks, events..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map(p => (
            <CommandItem key={p.id} value={`page ${p.title}`} onSelect={() => go(() => navigate({ to: "/pages/$id", params: { id: p.id } }))}>
              <span className="mr-2">{p.icon}</span><FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />{p.title || "Untitled"}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Boards">
          {boards.map(b => (
            <CommandItem key={b.id} value={`board ${b.name}`} onSelect={() => go(() => navigate({ to: "/boards/$id", params: { id: b.id } }))}>
              <span className="mr-2">{b.icon}</span><LayoutGrid className="h-3.5 w-3.5 mr-2 text-muted-foreground" />{b.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {cards.slice(0, 20).map(c => (
            <CommandItem key={c.id} value={`task ${c.title}`} onSelect={() => {
              const list = useStore.length; // placeholder
              const boardId = (typeof window !== "undefined") ? (
                // find boardId via list
                (() => {
                  const s = (window as any).__fsState;
                  return s;
                })()
              ) : undefined;
              go(() => navigate({ to: "/boards" }));
            }}>
              <LayoutGrid className="h-3.5 w-3.5 mr-2 text-muted-foreground" />{c.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Events">
          {events.map(e => (
            <CommandItem key={e.id} value={`event ${e.title}`} onSelect={() => go(() => navigate({ to: "/calendar" }))}>
              <CalIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />{e.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
