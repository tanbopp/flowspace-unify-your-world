import { useMemo, useState } from "react";
import { useStore, actions, type Card, type BoardList } from "../lib/store";
import {
  Plus,
  X,
  MoreHorizontal,
  LayoutGrid,
  Table as TableIcon,
  List as ListIcon,
  Filter,
  Star,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CardModal } from "./CardModal";
import { cn } from "../lib/utils";
import { MenuItem } from "./Sidebar";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function BoardView({ boardId }: { boardId: string }) {
  const board = useStore((s) => s.boards.find((b) => b.id === boardId));
  const lists = useStore((s) =>
    s.lists.filter((l) => l.boardId === boardId).sort((a, b) => a.order - b.order),
  );
  const allCards = useStore((s) =>
    s.cards.filter((c) => !c.trashed && lists.some((l) => l.id === c.listId)),
  );
  const [view, setView] = useState<"kanban" | "table" | "list">("kanban");
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("");

  const filtered = useMemo(
    () => (filterPriority ? allCards.filter((c) => c.priority === filterPriority) : allCards),
    [allCards, filterPriority],
  );

  if (!board) return <div className="p-8 text-muted-foreground">Board not found.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-3 flex items-center gap-3">
        <span className="text-2xl">{board.icon}</span>
        <input
          value={board.name}
          onChange={(e) => actions.updateBoard(board.id, { name: e.target.value })}
          className="text-2xl font-semibold bg-transparent focus:outline-none flex-1 min-w-0"
        />
        <button
          onClick={() => actions.toggleFavorite("board", board.id)}
          className="p-1.5 rounded hover:bg-accent"
        >
          <Star className={cn("h-4 w-4", board.favorite && "fill-yellow-400 text-yellow-400")} />
        </button>
        <div className="flex border rounded-md overflow-hidden">
          {(
            [
              ["kanban", LayoutGrid],
              ["table", TableIcon],
              ["list", ListIcon],
            ] as const
          ).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn("p-1.5 text-xs", view === v ? "bg-accent" : "hover:bg-accent")}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 rounded hover:bg-accent flex items-center gap-1 text-xs">
              <Filter className="h-3.5 w-3.5" />
              {filterPriority || "All"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="end">
            <MenuItem onClick={() => setFilterPriority("")}>All</MenuItem>
            {["low", "medium", "high", "urgent"].map((p) => (
              <MenuItem key={p} onClick={() => setFilterPriority(p)}>
                {p}
              </MenuItem>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 overflow-auto">
        {view === "kanban" && (
          <KanbanView lists={lists} cards={filtered} onOpenCard={setOpenCard} boardId={boardId} />
        )}
        {view === "table" && <TableView lists={lists} cards={filtered} onOpenCard={setOpenCard} />}
        {view === "list" && <ListView lists={lists} cards={filtered} onOpenCard={setOpenCard} />}
      </div>

      {openCard && <CardModal cardId={openCard} onClose={() => setOpenCard(null)} />}
    </div>
  );
}

function KanbanView({
  lists,
  cards,
  onOpenCard,
  boardId,
}: {
  lists: BoardList[];
  cards: Card[];
  onOpenCard: (id: string) => void;
  boardId: string;
}) {
  const [dragCardId, setDragCardId] = useState<string | null>(null);

  return (
    <div className="flex gap-3 px-6 pb-6 h-full items-start">
      {lists.map((list) => {
        const listCards = cards
          .filter((c) => c.listId === list.id)
          .sort((a, b) => a.order - b.order);
        return (
          <div
            key={list.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragCardId) {
                actions.moveCard(dragCardId, list.id, listCards.length);
                setDragCardId(null);
              }
            }}
            className="w-72 shrink-0 bg-muted/40 rounded-lg p-2 flex flex-col max-h-full"
          >
            <div className="flex items-center justify-between px-1 mb-2">
              <input
                value={list.name}
                onChange={(e) => actions.updateList(list.id, { name: e.target.value })}
                className="text-sm font-medium bg-transparent focus:outline-none flex-1"
              />
              <span className="text-xs text-muted-foreground mr-1">{listCards.length}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-0.5 hover:bg-accent rounded">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  <MenuItem destructive onClick={() => actions.deleteList(list.id)}>
                    Delete list
                  </MenuItem>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {listCards.map((c, idx) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragCardId(c.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    if (dragCardId && dragCardId !== c.id) {
                      actions.moveCard(dragCardId, list.id, idx);
                      setDragCardId(null);
                    }
                  }}
                  onClick={() => onOpenCard(c.id)}
                  className="bg-card border rounded-md p-2.5 text-sm cursor-pointer hover:border-foreground/30 shadow-sm"
                >
                  {c.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {c.labels.map((l, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: l.color }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="font-medium">{c.title}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    {c.priority && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          PRIORITY_COLORS[c.priority],
                        )}
                      >
                        {c.priority}
                      </span>
                    )}
                    {c.due && (
                      <span>
                        {new Date(c.due).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {c.checklist.length > 0 && (
                      <span>
                        ✓ {c.checklist.filter((i) => i.done).length}/{c.checklist.length}
                      </span>
                    )}
                    {c.assignee && (
                      <span className="ml-auto h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                        {c.assignee}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <QuickAddCard listId={list.id} />
              {listCards.length === 0 && (
                <div className="text-xs text-muted-foreground p-2 text-center">
                  Empty — add a card to get started
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button
        onClick={() => actions.addList(boardId)}
        className="w-72 shrink-0 h-10 rounded-lg border-2 border-dashed border-border hover:border-foreground/40 text-sm text-muted-foreground flex items-center justify-center gap-1"
      >
        <Plus className="h-4 w-4" /> Add list
      </button>
    </div>
  );
}

function QuickAddCard({ listId }: { listId: string }) {
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState("");
  if (!adding)
    return (
      <button
        onClick={() => setAdding(true)}
        className="w-full flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded px-2 py-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add card
      </button>
    );
  return (
    <div className="bg-card border rounded-md p-2">
      <textarea
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Card title..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (val.trim()) actions.addCard(listId, val.trim());
            setVal("");
          }
          if (e.key === "Escape") {
            setAdding(false);
            setVal("");
          }
        }}
        className="w-full text-sm bg-transparent focus:outline-none resize-none"
        rows={2}
      />
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => {
            if (val.trim()) {
              actions.addCard(listId, val.trim());
              setVal("");
            }
          }}
          className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
        >
          Add
        </button>
        <button
          onClick={() => {
            setAdding(false);
            setVal("");
          }}
          className="text-xs px-2 py-1 hover:bg-accent rounded"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function TableView({
  lists,
  cards,
  onOpenCard,
}: {
  lists: BoardList[];
  cards: Card[];
  onOpenCard: (id: string) => void;
}) {
  return (
    <div className="px-6 pb-6">
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-muted text-left">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">List</th>
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Due</th>
            <th className="px-3 py-2">Labels</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => {
            const list = lists.find((l) => l.id === c.listId);
            return (
              <tr
                key={c.id}
                onClick={() => onOpenCard(c.id)}
                className="border-t hover:bg-accent cursor-pointer"
              >
                <td className="px-3 py-2 font-medium">{c.title}</td>
                <td className="px-3 py-2 text-muted-foreground">{list?.name}</td>
                <td className="px-3 py-2">
                  {c.priority && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px]",
                        PRIORITY_COLORS[c.priority],
                      )}
                    >
                      {c.priority}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {c.due ? new Date(c.due).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {c.labels.map((l, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: l.color }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ListView({
  lists,
  cards,
  onOpenCard,
}: {
  lists: BoardList[];
  cards: Card[];
  onOpenCard: (id: string) => void;
}) {
  return (
    <div className="px-6 pb-6 space-y-6">
      {lists.map((list) => {
        const lc = cards.filter((c) => c.listId === list.id);
        return (
          <div key={list.id}>
            <div className="text-sm font-medium mb-2">
              {list.name} <span className="text-muted-foreground">({lc.length})</span>
            </div>
            <div className="space-y-1">
              {lc.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenCard(c.id)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 border rounded hover:bg-accent text-sm"
                >
                  <span className="flex-1">{c.title}</span>
                  {c.priority && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px]",
                        PRIORITY_COLORS[c.priority],
                      )}
                    >
                      {c.priority}
                    </span>
                  )}
                  {c.due && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.due).toLocaleDateString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
