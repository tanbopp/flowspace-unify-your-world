import { createFileRoute } from "@tanstack/react-router";
import { useStore, actions } from "../lib/store";

export const Route = createFileRoute("/inbox")({
  component: Inbox,
});

function Inbox() {
  const notifs = useStore(s => s.notifications);
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <div className="flex gap-2">
          <button onClick={() => actions.markAllRead()} className="text-xs px-2 py-1 border rounded hover:bg-accent">Mark all read</button>
          <button onClick={() => actions.clearNotifications()} className="text-xs px-2 py-1 border rounded hover:bg-accent">Clear all</button>
        </div>
      </div>
      {notifs.length === 0 ? <div className="text-sm text-muted-foreground">No notifications</div> : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} className="border rounded p-3 text-sm">
              <div>{n.text}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(n.at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
