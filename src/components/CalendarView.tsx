import { useMemo, useState } from "react";
import { useStore, actions, type CalEvent } from "../lib/store";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "../lib/utils";

type View = "month" | "week" | "day" | "agenda";

const EVENT_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];

export function CalendarView() {
  const events = useStore(s => s.events);
  const cards = useStore(s => s.cards.filter(c => !c.trashed && c.due));
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [editing, setEditing] = useState<string | null>(null);

  const taskEvents: CalEvent[] = useMemo(() => cards.map(c => ({
    id: `task-${c.id}`, title: `📋 ${c.title}`, start: c.due!, end: c.due! + 30 * 60000, color: "#64748b",
  })), [cards]);
  const allEvents = [...events, ...taskEvents];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-3 flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold flex-1">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h1>
        <button onClick={() => setCursor(new Date(new Date().setHours(0,0,0,0)))} className="text-xs px-3 py-1.5 border rounded-md hover:bg-accent">Today</button>
        <div className="flex">
          <button onClick={() => shift(cursor, view, -1, setCursor)} className="p-1.5 border rounded-l-md hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => shift(cursor, view, 1, setCursor)} className="p-1.5 border-y border-r rounded-r-md hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="flex border rounded-md overflow-hidden">
          {(["month","week","day","agenda"] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={cn("px-3 py-1.5 text-xs capitalize", view === v ? "bg-accent" : "hover:bg-accent")}>{v}</button>
          ))}
        </div>
        <button onClick={() => {
          const start = new Date(cursor); start.setHours(9, 0, 0, 0);
          const id = actions.createEvent({ title: "New event", start: start.getTime(), end: start.getTime() + 3600000, color: EVENT_COLORS[Math.floor(Math.random()*EVENT_COLORS.length)] });
          setEditing(id);
        }} className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md"><Plus className="h-3.5 w-3.5" />Event</button>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6">
        {view === "month" && <MonthView cursor={cursor} events={allEvents} onEventClick={(id) => events.find(e => e.id === id) && setEditing(id)} onDayClick={(d) => {
          const start = new Date(d); start.setHours(9, 0, 0, 0);
          const id = actions.createEvent({ title: "New event", start: start.getTime(), end: start.getTime() + 3600000, color: EVENT_COLORS[Math.floor(Math.random()*EVENT_COLORS.length)] });
          setEditing(id);
        }} />}
        {view === "week" && <WeekView cursor={cursor} events={allEvents} onEventClick={(id) => events.find(e => e.id === id) && setEditing(id)} />}
        {view === "day" && <DayView cursor={cursor} events={allEvents} onEventClick={(id) => events.find(e => e.id === id) && setEditing(id)} />}
        {view === "agenda" && <AgendaView cursor={cursor} events={allEvents} onEventClick={(id) => events.find(e => e.id === id) && setEditing(id)} />}
      </div>

      {editing && <EventModal eventId={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function shift(cursor: Date, view: View, dir: number, set: (d: Date) => void) {
  const d = new Date(cursor);
  if (view === "month") d.setMonth(d.getMonth() + dir);
  else if (view === "week") d.setDate(d.getDate() + dir * 7);
  else d.setDate(d.getDate() + dir);
  set(d);
}

function MonthView({ cursor, events, onEventClick, onDayClick }: { cursor: Date; events: CalEvent[]; onEventClick: (id: string) => void; onDayClick: (d: Date) => void }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  const cells: Date[] = [];
  for (let i = 0; i < startDay; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i - startDay + 1));
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
  while (cells.length % 7 !== 0) cells.push(new Date(cells[cells.length - 1].getTime() + 86400000));

  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-muted text-xs font-medium">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="px-2 py-1.5 border-r last:border-r-0">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = d.getTime() === today.getTime();
          const dayEvents = events.filter(e => sameDay(new Date(e.start), d));
          return (
            <div key={i}
              onClick={() => onDayClick(d)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  const ev = events.find(e => e.id === dragId);
                  if (ev && !ev.id.startsWith("task-")) {
                    const ds = new Date(ev.start);
                    const newStart = new Date(d); newStart.setHours(ds.getHours(), ds.getMinutes(), 0, 0);
                    const delta = newStart.getTime() - ev.start;
                    actions.updateEvent(ev.id, { start: ev.start + delta, end: ev.end + delta });
                  }
                  setDragId(null);
                }
              }}
              className={cn("border-r border-b last:border-r-0 min-h-[88px] p-1 text-xs cursor-pointer hover:bg-accent/40", !inMonth && "text-muted-foreground/50 bg-muted/20")}>
              <div className={cn("inline-flex items-center justify-center h-6 w-6 rounded-full mb-1", isToday && "bg-primary text-primary-foreground font-semibold")}>{d.getDate()}</div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(e => (
                  <div key={e.id} draggable={!e.id.startsWith("task-")} onDragStart={(ev) => { ev.stopPropagation(); setDragId(e.id); }}
                    onClick={(ev) => { ev.stopPropagation(); onEventClick(e.id); }}
                    className="truncate px-1.5 py-0.5 rounded text-white text-[11px]" style={{ background: e.color }}>{e.title}</div>
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, events, onEventClick }: { cursor: Date; events: CalEvent[]; onEventClick: (id: string) => void }) {
  const start = new Date(cursor); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * 86400000));
  return <DayGrid days={days} events={events} onEventClick={onEventClick} />;
}

function DayView({ cursor, events, onEventClick }: { cursor: Date; events: CalEvent[]; onEventClick: (id: string) => void }) {
  return <DayGrid days={[cursor]} events={events} onEventClick={onEventClick} />;
}

function DayGrid({ days, events, onEventClick }: { days: Date[]; events: CalEvent[]; onEventClick: (id: string) => void }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
        <div className="border-r border-b bg-muted" />
        {days.map(d => (
          <div key={d.toISOString()} className="border-r border-b last:border-r-0 bg-muted text-xs font-medium p-2 text-center">
            {d.toLocaleDateString(undefined, { weekday: "short" })} {d.getDate()}
          </div>
        ))}
        {hours.map(h => (
          <>
            <div key={`h-${h}`} className="border-r border-b text-[10px] text-muted-foreground p-1 text-right">{h}:00</div>
            {days.map((d, di) => {
              const slotStart = new Date(d); slotStart.setHours(h, 0, 0, 0);
              const slotEnd = new Date(d); slotEnd.setHours(h+1, 0, 0, 0);
              const slotEvents = events.filter(e => {
                const es = new Date(e.start); return sameDay(es, d) && es.getHours() === h;
              });
              return (
                <div key={`c-${h}-${di}`} className="border-r border-b last:border-r-0 min-h-[44px] p-0.5 hover:bg-accent/30 relative">
                  {slotEvents.map(e => (
                    <div key={e.id} onClick={() => onEventClick(e.id)} className="text-[11px] px-1.5 py-0.5 rounded text-white truncate cursor-pointer mb-0.5" style={{ background: e.color }}>{e.title}</div>
                  ))}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function AgendaView({ cursor, events, onEventClick }: { cursor: Date; events: CalEvent[]; onEventClick: (id: string) => void }) {
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getTime();
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59).getTime();
  const list = events.filter(e => e.start >= monthStart && e.start <= monthEnd).sort((a, b) => a.start - b.start);
  return (
    <div className="space-y-1">
      {list.length === 0 && <div className="text-sm text-muted-foreground p-4">No events this month</div>}
      {list.map(e => (
        <button key={e.id} onClick={() => onEventClick(e.id)} className="w-full text-left flex items-center gap-3 px-3 py-2 border rounded hover:bg-accent text-sm">
          <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />
          <span className="font-medium flex-1">{e.title}</span>
          <span className="text-xs text-muted-foreground">{new Date(e.start).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </button>
      ))}
    </div>
  );
}

function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

function EventModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const ev = useStore(s => s.events.find(e => e.id === eventId));
  if (!ev) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <input value={ev.title} onChange={e => actions.updateEvent(ev.id, { title: e.target.value })} className="text-lg font-semibold bg-transparent focus:outline-none w-full" />
        <div className="space-y-3 mt-4 text-sm">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Start</label>
            <input type="datetime-local" value={toLocal(ev.start)} onChange={e => actions.updateEvent(ev.id, { start: new Date(e.target.value).getTime() })} className="w-full border rounded px-2 py-1 bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">End</label>
            <input type="datetime-local" value={toLocal(ev.end)} onChange={e => actions.updateEvent(ev.id, { end: new Date(e.target.value).getTime() })} className="w-full border rounded px-2 py-1 bg-background" />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!ev.allDay} onChange={e => actions.updateEvent(ev.id, { allDay: e.target.checked })} />All-day</label>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Description</label>
            <textarea value={ev.description ?? ""} onChange={e => actions.updateEvent(ev.id, { description: e.target.value })} rows={3} className="w-full border rounded px-2 py-1 bg-background resize-y" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Color</label>
            <div className="flex gap-1.5">
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => actions.updateEvent(ev.id, { color: c })} className={cn("h-6 w-6 rounded-full border-2", ev.color === c ? "border-foreground" : "border-transparent")} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button onClick={() => { actions.deleteEvent(ev.id); onClose(); }} className="w-full flex items-center justify-center gap-1 text-xs text-destructive border border-destructive/30 rounded px-2 py-1.5 hover:bg-destructive/10"><Trash2 className="h-3 w-3" />Delete event</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function toLocal(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
