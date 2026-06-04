import { Link, useNavigate } from "@tanstack/react-router";
import { useStore, actions } from "../lib/store";
import { FileText, Calendar, CheckSquare } from "lucide-react";

export function Dashboard() {
  const pages = useStore((s) => s.pages.filter((p) => !p.trashed));
  const recentIds = useStore((s) => s.recentPageIds);
  const cards = useStore((s) => s.cards.filter((c) => !c.trashed && !isDone(c.listId, s.lists)));
  const events = useStore((s) => s.events);
  const note = useStore((s) => s.quickNote);
  const wsName = useStore((s) => s.workspaceName);
  const lists = useStore((s) => s.lists);
  const navigate = useNavigate();

  const recent = recentIds
    .map((id) => pages.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 5) as typeof pages;
  const tasks = [...cards].sort((a, b) => (a.due ?? Infinity) - (b.due ?? Infinity)).slice(0, 8);
  const upcoming = [...events]
    .filter((e) => e.end >= Date.now())
    .sort((a, b) => a.start - b.start)
    .slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <header>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h1 className="text-3xl font-semibold mt-1">Good day, welcome to {wsName}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Recent pages" icon={<FileText className="h-4 w-4" />}>
          {recent.length === 0 ? (
            <Empty msg="No recent pages" />
          ) : (
            recent.map((p) => (
              <Link
                key={p.id}
                to="/pages/$id"
                params={{ id: p.id }}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
              >
                <span>{p.icon}</span>
                <span className="truncate">{p.title || "Untitled"}</span>
              </Link>
            ))
          )}
        </Card>

        <Card title="My tasks" icon={<CheckSquare className="h-4 w-4" />}>
          {tasks.length === 0 ? (
            <Empty msg="No tasks yet" />
          ) : (
            tasks.map((c) => {
              const list = lists.find((l) => l.id === c.listId);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    list && navigate({ to: "/boards/$id", params: { id: list.boardId } })
                  }
                  className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
                >
                  <span className="truncate">{c.title}</span>
                  {c.due && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(c.due).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </Card>

        <Card title="Upcoming events" icon={<Calendar className="h-4 w-4" />}>
          {upcoming.length === 0 ? (
            <Empty msg="Nothing on the calendar" />
          ) : (
            upcoming.map((e) => (
              <Link
                key={e.id}
                to="/calendar"
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: e.color }} />
                <span className="truncate flex-1">{e.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(e.start).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))
          )}
        </Card>

        <Card title="Quick note">
          <textarea
            value={note}
            onChange={(e) => actions.setQuickNote(e.target.value)}
            placeholder="Jot something down..."
            className="w-full h-32 px-2 py-1.5 text-sm bg-transparent border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Card>
      </div>
    </div>
  );
}

function isDone(listId: string, lists: { id: string; name: string }[]) {
  const l = lists.find((l) => l.id === listId);
  return l ? /done|complete|shipped/i.test(l.name) : false;
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        {icon}
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-xs text-muted-foreground py-2">{msg}</div>;
}
