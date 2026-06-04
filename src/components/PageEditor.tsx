import { useEffect, useRef, useState } from "react";
import { useStore, actions, uid, type Block, type BlockType } from "../lib/store";
import { Link } from "@tanstack/react-router";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { GripVertical, Plus, Star, Image as ImageIcon } from "lucide-react";

const BLOCK_OPTIONS: { type: BlockType; label: string; hint: string }[] = [
  { type: "paragraph", label: "Text", hint: "Plain paragraph" },
  { type: "h1", label: "Heading 1", hint: "Big heading" },
  { type: "h2", label: "Heading 2", hint: "Medium heading" },
  { type: "h3", label: "Heading 3", hint: "Small heading" },
  { type: "bullet", label: "Bullet list", hint: "• item" },
  { type: "numbered", label: "Numbered list", hint: "1. item" },
  { type: "todo", label: "To-do", hint: "Checkbox" },
  { type: "toggle", label: "Toggle", hint: "Collapsible" },
  { type: "quote", label: "Quote", hint: "Emphasize text" },
  { type: "divider", label: "Divider", hint: "Horizontal line" },
  { type: "code", label: "Code", hint: "Monospace block" },
  { type: "callout", label: "Callout", hint: "Highlighted box" },
  { type: "image", label: "Image", hint: "Image embed (URL)" },
];

const EMOJI_SET = ["📄","📝","📚","💡","🚀","🎯","✨","🔥","⭐","📊","📈","🗂️","📌","🧠","🎨","🛠️","🧪","☕","🌍","💬"];

export function PageEditor({ pageId }: { pageId: string }) {
  const page = useStore(s => s.pages.find(p => p.id === pageId));
  const allPages = useStore(s => s.pages);

  useEffect(() => { if (page) actions.touchPage(page.id); }, [page?.id]);

  if (!page) return <div className="p-8 text-muted-foreground">Page not found.</div>;

  const subPages = allPages.filter(p => p.parentId === page.id && !p.trashed);
  const backlinks: typeof allPages = []; // Could scan blocks for refs; simplified

  return (
    <div className="max-w-3xl mx-auto px-12 py-10">
      {page.cover && (
        <div className="h-40 -mx-12 mb-6 rounded-b-lg" style={{ background: page.cover }} />
      )}
      <div className="flex items-center gap-2 mb-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-5xl leading-none hover:bg-accent rounded p-1">{page.icon}</button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_SET.map(e => (
                <button key={e} onClick={() => actions.updatePage(page.id, { icon: e })} className="text-xl hover:bg-accent rounded p-1">{e}</button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-1" />
        <button onClick={() => actions.toggleFavorite("page", page.id)} className="p-1.5 rounded hover:bg-accent">
          <Star className={cn("h-4 w-4", page.favorite && "fill-yellow-400 text-yellow-400")} />
        </button>
        <button onClick={() => {
          const colors = ["linear-gradient(135deg,#a78bfa,#ec4899)","linear-gradient(135deg,#60a5fa,#34d399)","linear-gradient(135deg,#fb923c,#f59e0b)","linear-gradient(135deg,#f472b6,#a78bfa)"];
          actions.updatePage(page.id, { cover: colors[Math.floor(Math.random() * colors.length)] });
        }} className="p-1.5 rounded hover:bg-accent text-xs flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> Cover
        </button>
      </div>

      <input
        value={page.title}
        onChange={e => actions.updatePage(page.id, { title: e.target.value })}
        placeholder="Untitled"
        className="w-full text-4xl font-bold bg-transparent focus:outline-none placeholder:text-muted-foreground/40 mb-1"
      />
      <div className="text-xs text-muted-foreground mb-6">Last edited {new Date(page.updatedAt).toLocaleString()}</div>

      <Editor blocks={page.blocks} onChange={b => actions.updatePageBlocks(page.id, b)} />

      {subPages.length > 0 && (
        <div className="mt-10 pt-4 border-t">
          <div className="text-xs uppercase text-muted-foreground font-medium mb-2">Sub-pages</div>
          <div className="space-y-1">
            {subPages.map(sp => (
              <Link key={sp.id} to="/pages/$id" params={{ id: sp.id }} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent">
                <span>{sp.icon}</span><span>{sp.title || "Untitled"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {backlinks.length > 0 && (
        <div className="mt-8 pt-4 border-t">
          <div className="text-xs uppercase text-muted-foreground font-medium mb-2">Backlinks</div>
        </div>
      )}
    </div>
  );
}

function Editor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const [slashOpen, setSlashOpen] = useState<{ blockId: string; query: string } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const updateBlock = (id: string, patch: Partial<Block>) => onChange(blocks.map(b => b.id === id ? { ...b, ...patch } : b));
  const insertAfter = (id: string, type: BlockType = "paragraph") => {
    const idx = blocks.findIndex(b => b.id === id);
    const nb: Block = { id: uid(), type, text: "" };
    const next = [...blocks]; next.splice(idx + 1, 0, nb); onChange(next);
    setTimeout(() => focusBlock(nb.id), 10);
    return nb.id;
  };
  const removeBlock = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (blocks.length === 1) return;
    const next = blocks.filter(b => b.id !== id); onChange(next);
    const prev = blocks[idx - 1];
    if (prev) setTimeout(() => focusBlock(prev.id, true), 10);
  };
  const changeType = (id: string, type: BlockType) => updateBlock(id, { type });

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = blocks.findIndex(b => b.id === dragId);
    const to = blocks.findIndex(b => b.id === targetId);
    const next = [...blocks]; const [m] = next.splice(from, 1); next.splice(to, 0, m); onChange(next);
    setDragId(null);
  };

  return (
    <div className="space-y-0.5">
      {blocks.map(b => (
        <BlockRow
          key={b.id} block={b}
          onUpdate={(patch) => updateBlock(b.id, patch)}
          onEnter={() => insertAfter(b.id)}
          onBackspaceEmpty={() => removeBlock(b.id)}
          onSlash={(q) => setSlashOpen({ blockId: b.id, query: q })}
          onSlashClose={() => setSlashOpen(null)}
          onChangeType={(t) => changeType(b.id, t)}
          slashOpen={slashOpen?.blockId === b.id}
          slashQuery={slashOpen?.blockId === b.id ? slashOpen.query : ""}
          onDragStart={() => setDragId(b.id)}
          onDropOn={() => onDrop(b.id)}
        />
      ))}
      <button onClick={() => {
        const nb: Block = { id: uid(), type: "paragraph", text: "" };
        onChange([...blocks, nb]);
        setTimeout(() => focusBlock(nb.id), 10);
      }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-2">
        <Plus className="h-3.5 w-3.5" /> Add block
      </button>
    </div>
  );
}

function focusBlock(id: string, atEnd = false) {
  const el = document.querySelector(`[data-block-id="${id}"] [contenteditable]`) as HTMLElement | null;
  if (el) {
    el.focus();
    if (atEnd) {
      const range = document.createRange(); range.selectNodeContents(el); range.collapse(false);
      const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range);
    }
  }
}

function BlockRow({ block, onUpdate, onEnter, onBackspaceEmpty, onSlash, onSlashClose, onChangeType, slashOpen, slashQuery, onDragStart, onDropOn }: {
  block: Block; onUpdate: (p: Partial<Block>) => void; onEnter: () => void; onBackspaceEmpty: () => void;
  onSlash: (q: string) => void; onSlashClose: () => void; onChangeType: (t: BlockType) => void;
  slashOpen: boolean; slashQuery: string; onDragStart: () => void; onDropOn: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== block.text) ref.current.innerText = block.text;
  }, [block.text]);

  const handleInput = () => {
    const text = ref.current?.innerText ?? "";
    onUpdate({ text });
    // Slash detection
    if (text.startsWith("/")) onSlash(text.slice(1));
    else if (slashOpen) onSlashClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (slashOpen) return;
      onEnter();
    } else if (e.key === "Backspace" && (ref.current?.innerText ?? "") === "") {
      e.preventDefault(); onBackspaceEmpty();
    } else if (e.key === "Escape" && slashOpen) {
      onSlashClose();
    }
  };

  const pickFromSlash = (t: BlockType) => {
    onChangeType(t); onUpdate({ text: "" });
    if (ref.current) ref.current.innerText = "";
    onSlashClose();
    setTimeout(() => ref.current?.focus(), 10);
  };

  const filteredOpts = BLOCK_OPTIONS.filter(o => o.label.toLowerCase().includes(slashQuery.toLowerCase()));

  // Renderers
  if (block.type === "divider") {
    return (
      <div data-block-id={block.id} className="group flex items-center gap-1 py-2" draggable onDragStart={onDragStart} onDragOver={e => e.preventDefault()} onDrop={onDropOn}>
        <Handle />
        <hr className="flex-1 border-border" />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div data-block-id={block.id} className="group flex items-start gap-1 py-1" draggable onDragStart={onDragStart} onDragOver={e => e.preventDefault()} onDrop={onDropOn}>
        <Handle />
        <div className="flex-1">
          {block.text ? (
            <img src={block.text} alt="" className="max-w-full rounded-md" onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : (
            <input
              autoFocus
              placeholder="Paste image URL and press Enter"
              className="w-full px-2 py-1.5 text-sm border rounded bg-muted/40"
              onKeyDown={(e) => { if (e.key === "Enter") onUpdate({ text: (e.target as HTMLInputElement).value }); }}
            />
          )}
        </div>
      </div>
    );
  }

  const editor = (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={block.type === "paragraph" ? "Type '/' for commands" : ""}
      onInput={handleInput}
      onKeyDown={handleKey}
      className={cn("flex-1 outline-none min-h-[1.5em] py-0.5", blockClass(block.type))}
    />
  );

  return (
    <div data-block-id={block.id} className="group relative flex items-start gap-1" draggable onDragStart={onDragStart} onDragOver={e => e.preventDefault()} onDrop={onDropOn}>
      <Handle />
      {block.type === "todo" && (
        <input type="checkbox" checked={!!block.checked} onChange={e => onUpdate({ checked: e.target.checked })} className="mt-2" />
      )}
      {block.type === "bullet" && <span className="mt-1.5 text-lg leading-none">•</span>}
      {block.type === "numbered" && <span className="mt-1 text-sm">1.</span>}
      {block.type === "toggle" && <span className="mt-2 text-xs">▸</span>}
      {block.type === "quote" && <div className="mt-1 w-1 self-stretch bg-foreground/40 rounded" />}
      {block.type === "callout" && <div className="mt-1.5 text-lg">💡</div>}

      <Popover open={slashOpen} onOpenChange={(o) => !o && onSlashClose()}>
        <PopoverTrigger asChild><div className="flex-1">{editor}</div></PopoverTrigger>
        <PopoverContent className="w-64 p-1 max-h-64 overflow-auto" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="text-[11px] uppercase text-muted-foreground px-2 py-1">Blocks</div>
          {filteredOpts.map(o => (
            <button key={o.type} onClick={() => pickFromSlash(o.type)} className="w-full text-left flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent">
              <span>{o.label}</span><span className="text-xs text-muted-foreground">{o.hint}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Handle() {
  return <span className="opacity-0 group-hover:opacity-50 cursor-grab pt-1.5"><GripVertical className="h-3.5 w-3.5" /></span>;
}

function blockClass(t: BlockType) {
  switch (t) {
    case "h1": return "text-3xl font-bold mt-4";
    case "h2": return "text-2xl font-bold mt-3";
    case "h3": return "text-xl font-semibold mt-2";
    case "quote": return "italic text-muted-foreground pl-3";
    case "code": return "font-mono text-sm bg-muted rounded px-2 py-1.5 whitespace-pre-wrap";
    case "callout": return "bg-accent rounded px-2 py-1.5";
    case "todo": return "";
    default: return "";
  }
}
