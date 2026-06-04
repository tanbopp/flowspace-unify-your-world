import { useStore, actions } from "../lib/store";
import { RotateCcw } from "lucide-react";

export function Trash() {
  const pages = useStore((s) => s.pages.filter((p) => p.trashed));
  const cards = useStore((s) => s.cards.filter((c) => c.trashed));
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Trash</h1>
      <section>
        <h2 className="text-sm font-medium mb-2">Pages</h2>
        {pages.length === 0 ? (
          <div className="text-sm text-muted-foreground">Empty</div>
        ) : (
          pages.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 border rounded mb-1 text-sm"
            >
              <span>{p.icon}</span>
              <span className="flex-1">{p.title}</span>
              <button
                onClick={() => actions.restorePage(p.id)}
                className="text-xs px-2 py-1 hover:bg-accent rounded flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Restore
              </button>
            </div>
          ))
        )}
      </section>
      <section>
        <h2 className="text-sm font-medium mb-2">Cards</h2>
        {cards.length === 0 ? (
          <div className="text-sm text-muted-foreground">Empty</div>
        ) : (
          cards.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-3 py-2 border rounded mb-1 text-sm"
            >
              <span className="flex-1">{c.title}</span>
              <button
                onClick={() => actions.updateCard(c.id, { trashed: false })}
                className="text-xs px-2 py-1 hover:bg-accent rounded flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Restore
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
