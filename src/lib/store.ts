import { useRef, useSyncExternalStore } from "react";

export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "numbered"
  | "todo"
  | "toggle"
  | "quote"
  | "divider"
  | "code"
  | "callout"
  | "image";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  children?: Block[];
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  cover?: string;
  parentId: string | null;
  blocks: Block[];
  updatedAt: number;
  favorite?: boolean;
  trashed?: boolean;
}

export interface Checklist {
  id: string;
  text: string;
  done: boolean;
}
export interface Comment {
  id: string;
  text: string;
  at: number;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  due?: number;
  assignee?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  labels: { name: string; color: string }[];
  checklist: Checklist[];
  comments: Comment[];
  order: number;
  trashed?: boolean;
}

export interface BoardList {
  id: string;
  boardId: string;
  name: string;
  order: number;
}
export interface Board {
  id: string;
  name: string;
  icon: string;
  favorite?: boolean;
  trashed?: boolean;
}

export interface CalEvent {
  id: string;
  title: string;
  start: number;
  end: number;
  allDay?: boolean;
  description?: string;
  color: string;
  linkedCardId?: string;
  linkedPageId?: string;
}

export interface Notification {
  id: string;
  text: string;
  at: number;
  read?: boolean;
  link?: string;
}

export interface State {
  workspaceName: string;
  pages: Page[];
  boards: Board[];
  lists: BoardList[];
  cards: Card[];
  events: CalEvent[];
  notifications: Notification[];
  quickNote: string;
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  recentPageIds: string[];
}

const KEY = "flowspace.v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function seed(): State {
  const now = Date.now();
  const day = 86400000;
  const p1 = uid(),
    p2 = uid(),
    p3 = uid(),
    p4 = uid();
  const b1 = uid(),
    b2 = uid();
  const l1 = uid(),
    l2 = uid(),
    l3 = uid(),
    l4 = uid(),
    l5 = uid(),
    l6 = uid();
  const c1 = uid();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  return {
    workspaceName: "My Workspace",
    theme: "light",
    sidebarCollapsed: false,
    quickNote: "",
    recentPageIds: [p1],
    notifications: [
      { id: uid(), text: "Welcome to FlowSpace! 👋", at: now },
      { id: uid(), text: "Your design review is due tomorrow", at: now - 3600000 },
    ],
    pages: [
      {
        id: p1,
        title: "Getting Started",
        icon: "🚀",
        parentId: null,
        updatedAt: now,
        blocks: [
          { id: uid(), type: "h1", text: "Welcome to FlowSpace" },
          {
            id: uid(),
            type: "paragraph",
            text: "Your all-in-one productivity workspace. Docs, tasks, and calendar — together.",
          },
          { id: uid(), type: "h2", text: "Quick tips" },
          { id: uid(), type: "bullet", text: "Press / to insert a block" },
          { id: uid(), type: "bullet", text: "Press Cmd/Ctrl+K to search" },
          { id: uid(), type: "todo", text: "Try creating a new page", checked: false },
          {
            id: uid(),
            type: "callout",
            text: "💡 Pages, boards, and calendar all share the same workspace.",
          },
        ],
      },
      {
        id: p2,
        title: "Project Notes",
        icon: "📝",
        parentId: null,
        updatedAt: now - day,
        blocks: [
          { id: uid(), type: "h1", text: "Project Notes" },
          { id: uid(), type: "paragraph", text: "Notes from our recent planning session." },
          { id: uid(), type: "h3", text: "Goals" },
          { id: uid(), type: "numbered", text: "Ship v1 by end of quarter" },
          { id: uid(), type: "numbered", text: "Onboard 100 beta users" },
        ],
      },
      {
        id: p3,
        title: "Meeting Notes",
        icon: "📅",
        parentId: p2,
        updatedAt: now - 2 * day,
        blocks: [
          { id: uid(), type: "h1", text: "Weekly Sync" },
          { id: uid(), type: "quote", text: "Always be shipping." },
          { id: uid(), type: "paragraph", text: "Discussed roadmap and priorities." },
        ],
      },
      {
        id: p4,
        title: "Ideas",
        icon: "💡",
        parentId: null,
        updatedAt: now - 3 * day,
        blocks: [
          { id: uid(), type: "h1", text: "Ideas Backlog" },
          { id: uid(), type: "bullet", text: "Mobile companion app" },
          { id: uid(), type: "bullet", text: "AI summaries" },
        ],
      },
    ],
    boards: [
      { id: b1, name: "Product Roadmap", icon: "🗺️" },
      { id: b2, name: "Marketing", icon: "📣" },
    ],
    lists: [
      { id: l1, boardId: b1, name: "To Do", order: 0 },
      { id: l2, boardId: b1, name: "In Progress", order: 1 },
      { id: l3, boardId: b1, name: "Done", order: 2 },
      { id: l4, boardId: b2, name: "Ideas", order: 0 },
      { id: l5, boardId: b2, name: "Active", order: 1 },
      { id: l6, boardId: b2, name: "Shipped", order: 2 },
    ],
    cards: [
      {
        id: c1,
        listId: l1,
        title: "Design new landing page",
        description: "Refresh hero and pricing sections.",
        due: t + 2 * day,
        priority: "high",
        assignee: "AB",
        labels: [{ name: "Design", color: "#8b5cf6" }],
        checklist: [
          { id: uid(), text: "Hero mockup", done: true },
          { id: uid(), text: "Pricing layout", done: false },
          { id: uid(), text: "Mobile review", done: false },
        ],
        comments: [],
        order: 0,
      },
      {
        id: uid(),
        listId: l1,
        title: "User research interviews",
        description: "",
        due: t + 5 * day,
        priority: "medium",
        labels: [{ name: "Research", color: "#06b6d4" }],
        checklist: [],
        comments: [],
        order: 1,
      },
      {
        id: uid(),
        listId: l2,
        title: "Implement onboarding flow",
        description: "",
        priority: "urgent",
        labels: [{ name: "Eng", color: "#10b981" }],
        checklist: [],
        comments: [],
        order: 0,
      },
      {
        id: uid(),
        listId: l3,
        title: "Set up analytics",
        description: "",
        priority: "low",
        labels: [],
        checklist: [],
        comments: [],
        order: 0,
      },
      {
        id: uid(),
        listId: l4,
        title: "Newsletter relaunch",
        description: "",
        labels: [{ name: "Content", color: "#f59e0b" }],
        checklist: [],
        comments: [],
        order: 0,
      },
      {
        id: uid(),
        listId: l5,
        title: "Launch campaign",
        description: "",
        due: t + 7 * day,
        priority: "high",
        labels: [],
        checklist: [],
        comments: [],
        order: 0,
      },
    ],
    events: [
      {
        id: uid(),
        title: "Team standup",
        start: t + 9 * 3600000,
        end: t + 9.5 * 3600000,
        color: "#3b82f6",
      },
      {
        id: uid(),
        title: "Design review",
        start: t + day + 14 * 3600000,
        end: t + day + 15 * 3600000,
        color: "#8b5cf6",
      },
      {
        id: uid(),
        title: "Lunch with Alex",
        start: t + 2 * day + 12 * 3600000,
        end: t + 2 * day + 13 * 3600000,
        color: "#10b981",
      },
      {
        id: uid(),
        title: "Product launch",
        start: t + 4 * day,
        end: t + 4 * day + day,
        allDay: true,
        color: "#f59e0b",
      },
      {
        id: uid(),
        title: "1:1 with manager",
        start: t + 5 * day + 15 * 3600000,
        end: t + 5 * day + 16 * 3600000,
        color: "#ec4899",
      },
      {
        id: uid(),
        title: "All-hands meeting",
        start: t + 7 * day + 10 * 3600000,
        end: t + 7 * day + 11 * 3600000,
        color: "#06b6d4",
      },
      {
        id: uid(),
        title: "Quarterly planning",
        start: t - 2 * day + 13 * 3600000,
        end: t - 2 * day + 16 * 3600000,
        color: "#ef4444",
      },
    ],
  };
}

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
  return s;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }
  listeners.forEach((l) => l());
}

export function setState(updater: (s: State) => State | void) {
  const draft = JSON.parse(JSON.stringify(state)) as State;
  const result = updater(draft);
  state = (result as State) ?? draft;
  persist();
}

export function getState() {
  return state;
}

export function useStore<T>(selector: (s: State) => T): T {
  const lastState = useRef<State | undefined>(undefined);
  const lastResult = useRef<T | undefined>(undefined);

  const stableSelector = useRef(selector);
  stableSelector.current = selector;

  const subscribe = useRef((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }).current;

  const getSnapshot = useRef(() => {
    if (lastState.current === state && lastResult.current !== undefined) {
      return lastResult.current as T;
    }
    const result = stableSelector.current(state);
    lastState.current = state;
    lastResult.current = result;
    return result;
  }).current;

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { uid };

// --- Actions ---
export const actions = {
  setTheme(t: "light" | "dark") {
    setState((s) => {
      s.theme = t;
    });
  },
  setWorkspaceName(n: string) {
    setState((s) => {
      s.workspaceName = n;
    });
  },
  toggleSidebar() {
    setState((s) => {
      s.sidebarCollapsed = !s.sidebarCollapsed;
    });
  },
  setQuickNote(t: string) {
    setState((s) => {
      s.quickNote = t;
    });
  },

  // Pages
  createPage(parentId: string | null = null): string {
    const id = uid();
    setState((s) => {
      s.pages.push({
        id,
        title: "Untitled",
        icon: "📄",
        parentId,
        blocks: [{ id: uid(), type: "paragraph", text: "" }],
        updatedAt: Date.now(),
      });
    });
    return id;
  },
  updatePage(id: string, patch: Partial<Page>) {
    setState((s) => {
      const p = s.pages.find((p) => p.id === id);
      if (p) Object.assign(p, patch, { updatedAt: Date.now() });
    });
  },
  updatePageBlocks(id: string, blocks: Block[]) {
    setState((s) => {
      const p = s.pages.find((p) => p.id === id);
      if (p) {
        p.blocks = blocks;
        p.updatedAt = Date.now();
      }
    });
  },
  deletePage(id: string) {
    setState((s) => {
      const p = s.pages.find((p) => p.id === id);
      if (p) p.trashed = true;
    });
  },
  restorePage(id: string) {
    setState((s) => {
      const p = s.pages.find((p) => p.id === id);
      if (p) p.trashed = false;
    });
  },
  toggleFavorite(kind: "page" | "board", id: string) {
    setState((s) => {
      const arr = kind === "page" ? s.pages : s.boards;
      const it = (arr as any[]).find((x) => x.id === id);
      if (it) it.favorite = !it.favorite;
    });
  },
  touchPage(id: string) {
    setState((s) => {
      s.recentPageIds = [id, ...s.recentPageIds.filter((x) => x !== id)].slice(0, 8);
    });
  },

  // Boards
  createBoard(): string {
    const id = uid();
    const lids = [uid(), uid(), uid()];
    setState((s) => {
      s.boards.push({ id, name: "New Board", icon: "📋" });
      ["To Do", "In Progress", "Done"].forEach((n, i) =>
        s.lists.push({ id: lids[i], boardId: id, name: n, order: i }),
      );
    });
    return id;
  },
  updateBoard(id: string, patch: Partial<Board>) {
    setState((s) => {
      const b = s.boards.find((b) => b.id === id);
      if (b) Object.assign(b, patch);
    });
  },
  deleteBoard(id: string) {
    setState((s) => {
      const b = s.boards.find((b) => b.id === id);
      if (b) b.trashed = true;
    });
  },
  addList(boardId: string, name = "New List") {
    setState((s) => {
      const order = s.lists.filter((l) => l.boardId === boardId).length;
      s.lists.push({ id: uid(), boardId, name, order });
    });
  },
  updateList(id: string, patch: Partial<BoardList>) {
    setState((s) => {
      const l = s.lists.find((l) => l.id === id);
      if (l) Object.assign(l, patch);
    });
  },
  deleteList(id: string) {
    setState((s) => {
      s.lists = s.lists.filter((l) => l.id !== id);
      s.cards = s.cards.filter((c) => c.listId !== id);
    });
  },
  addCard(listId: string, title: string) {
    setState((s) => {
      const order = s.cards.filter((c) => c.listId === listId).length;
      s.cards.push({
        id: uid(),
        listId,
        title,
        description: "",
        labels: [],
        checklist: [],
        comments: [],
        order,
      });
    });
  },
  updateCard(id: string, patch: Partial<Card>) {
    setState((s) => {
      const c = s.cards.find((c) => c.id === id);
      if (c) Object.assign(c, patch);
    });
  },
  deleteCard(id: string) {
    setState((s) => {
      const c = s.cards.find((c) => c.id === id);
      if (c) c.trashed = true;
    });
  },
  moveCard(cardId: string, toListId: string, toIndex: number) {
    setState((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      if (!card) return;
      const fromList = card.listId;
      card.listId = toListId;
      // Reorder cards in destination list
      const dest = s.cards
        .filter((c) => c.listId === toListId && c.id !== cardId)
        .sort((a, b) => a.order - b.order);
      dest.splice(toIndex, 0, card);
      dest.forEach((c, i) => (c.order = i));
      if (fromList !== toListId) {
        s.cards
          .filter((c) => c.listId === fromList)
          .sort((a, b) => a.order - b.order)
          .forEach((c, i) => (c.order = i));
      }
    });
  },

  // Events
  createEvent(e: Omit<CalEvent, "id">): string {
    const id = uid();
    setState((s) => {
      s.events.push({ ...e, id });
    });
    return id;
  },
  updateEvent(id: string, patch: Partial<CalEvent>) {
    setState((s) => {
      const e = s.events.find((e) => e.id === id);
      if (e) Object.assign(e, patch);
    });
  },
  deleteEvent(id: string) {
    setState((s) => {
      s.events = s.events.filter((e) => e.id !== id);
    });
  },

  // Notifications
  markAllRead() {
    setState((s) => {
      s.notifications.forEach((n) => (n.read = true));
    });
  },
  clearNotifications() {
    setState((s) => {
      s.notifications = [];
    });
  },
};
