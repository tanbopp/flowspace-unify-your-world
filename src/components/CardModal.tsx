import { useState } from "react";
import { useStore, actions, uid } from "../lib/store";
import { Dialog, DialogContent } from "./ui/dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

const LABEL_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6"];

export function CardModal({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const card = useStore(s => s.cards.find(c => c.id === cardId));
  const lists = useStore(s => s.lists);
  const [newComment, setNewComment] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newLabel, setNewLabel] = useState("");

  if (!card) return null;
  const list = lists.find(l => l.id === card.listId);
  const checkDone = card.checklist.filter(i => i.done).length;
  const checkPct = card.checklist.length ? Math.round((checkDone / card.checklist.length) * 100) : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <input
          value={card.title}
          onChange={e => actions.updateCard(card.id, { title: e.target.value })}
          className="text-xl font-semibold bg-transparent focus:outline-none w-full"
        />
        <div className="text-xs text-muted-foreground">in list {list?.name}</div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-6 mt-4">
          <div className="space-y-5">
            <Section title="Description">
              <textarea
                value={card.description}
                onChange={e => actions.updateCard(card.id, { description: e.target.value })}
                placeholder="Add a more detailed description..."
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </Section>

            <Section title={`Checklist (${checkDone}/${card.checklist.length})`}>
              {card.checklist.length > 0 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2"><div className="h-full bg-primary transition-all" style={{ width: `${checkPct}%` }} /></div>
              )}
              <div className="space-y-1">
                {card.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input type="checkbox" checked={item.done} onChange={e => actions.updateCard(card.id, { checklist: card.checklist.map(i => i.id === item.id ? { ...i, done: e.target.checked } : i) })} />
                    <span className={cn("text-sm flex-1", item.done && "line-through text-muted-foreground")}>{item.text}</span>
                    <button onClick={() => actions.updateCard(card.id, { checklist: card.checklist.filter(i => i.id !== item.id) })} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && newCheckItem.trim()) { actions.updateCard(card.id, { checklist: [...card.checklist, { id: uid(), text: newCheckItem.trim(), done: false }] }); setNewCheckItem(""); } }}
                  placeholder="Add an item..."
                  className="flex-1 px-2 py-1 text-sm border rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </Section>

            <Section title="Comments">
              <div className="space-y-2 mb-2">
                {card.comments.map(c => (
                  <div key={c.id} className="text-sm bg-muted/40 rounded p-2">
                    <div>{c.text}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{new Date(c.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2}
                className="w-full px-2 py-1 text-sm border rounded resize-none bg-transparent focus:outline-none focus:ring-1 focus:ring-ring" />
              <button onClick={() => { if (newComment.trim()) { actions.updateCard(card.id, { comments: [...card.comments, { id: uid(), text: newComment.trim(), at: Date.now() }] }); setNewComment(""); } }}
                className="mt-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Comment</button>
            </Section>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">List</div>
              <select value={card.listId} onChange={e => actions.updateCard(card.id, { listId: e.target.value })} className="w-full border rounded px-2 py-1 bg-background">
                {lists.filter(l => l.boardId === list?.boardId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Priority</div>
              <select value={card.priority ?? ""} onChange={e => actions.updateCard(card.id, { priority: (e.target.value || undefined) as any })} className="w-full border rounded px-2 py-1 bg-background">
                <option value="">None</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Due date</div>
              <input type="datetime-local" value={card.due ? toLocalInput(card.due) : ""} onChange={e => actions.updateCard(card.id, { due: e.target.value ? new Date(e.target.value).getTime() : undefined })} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Assignee</div>
              <input value={card.assignee ?? ""} onChange={e => actions.updateCard(card.id, { assignee: e.target.value || undefined })} placeholder="Initials" maxLength={3} className="w-full border rounded px-2 py-1 bg-background uppercase" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Labels</div>
              <div className="flex flex-wrap gap-1 mb-1">
                {card.labels.map((l, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full text-white flex items-center gap-1" style={{ background: l.color }}>
                    {l.name}
                    <button onClick={() => actions.updateCard(card.id, { labels: card.labels.filter((_, idx) => idx !== i) })}><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label name"
                  onKeyDown={e => { if (e.key === "Enter" && newLabel.trim()) { actions.updateCard(card.id, { labels: [...card.labels, { name: newLabel.trim(), color: LABEL_COLORS[card.labels.length % LABEL_COLORS.length] }] }); setNewLabel(""); } }}
                  className="flex-1 border rounded px-2 py-1 text-xs bg-background" />
              </div>
            </div>
            <button onClick={() => { actions.deleteCard(card.id); onClose(); }} className="w-full flex items-center justify-center gap-1 text-xs text-destructive border border-destructive/30 rounded px-2 py-1.5 hover:bg-destructive/10"><Trash2 className="h-3 w-3" />Delete card</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="text-xs uppercase text-muted-foreground font-medium mb-2">{title}</div>{children}</div>;
}

function toLocalInput(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
