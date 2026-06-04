import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, actions } from "../lib/store";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/boards")({
  component: BoardsIndex,
});

function BoardsIndex() {
  const boards = useStore(s => s.boards.filter(b => !b.trashed));
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <button onClick={() => actions.createBoard()} className="inline-flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90">
          <Plus className="h-4 w-4" /> New board
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {boards.map(b => (
          <Link key={b.id} to="/boards/$id" params={{ id: b.id }} className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <div className="text-2xl mb-2">{b.icon}</div>
            <div className="font-medium">{b.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
