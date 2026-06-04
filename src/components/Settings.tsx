import { useStore, actions } from "../lib/store";

export function Settings() {
  const theme = useStore(s => s.theme);
  const wsName = useStore(s => s.workspaceName);

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Section title="Workspace">
        <Field label="Workspace name">
          <input value={wsName} onChange={e => actions.setWorkspaceName(e.target.value)} className="w-full border rounded px-3 py-1.5 bg-background" />
        </Field>
      </Section>

      <Section title="Appearance">
        <Field label="Theme">
          <div className="flex gap-2">
            {(["light","dark"] as const).map(t => (
              <button key={t} onClick={() => actions.setTheme(t)} className={`px-3 py-1.5 text-sm rounded border ${theme === t ? "bg-accent" : ""}`}>{t}</button>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Keyboard shortcuts">
        <ul className="text-sm space-y-1.5">
          <Shortcut keys="⌘/Ctrl + K" desc="Open command palette / search" />
          <Shortcut keys="/" desc="Open block menu in editor" />
          <Shortcut keys="Enter" desc="New block / new card" />
          <Shortcut keys="Esc" desc="Close menus and modals" />
        </ul>
      </Section>

      <Section title="Data">
        <button onClick={() => { if (confirm("Reset all data? This cannot be undone.")) { localStorage.removeItem("flowspace.v1"); location.reload(); } }} className="text-sm text-destructive border border-destructive/30 px-3 py-1.5 rounded hover:bg-destructive/10">Reset workspace</button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="text-sm font-medium mb-3">{title}</h2><div className="border rounded-lg p-4 space-y-3">{children}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground mb-1">{label}</div>{children}</div>;
}
function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return <li className="flex justify-between"><span>{desc}</span><kbd className="text-xs bg-muted px-1.5 py-0.5 rounded border">{keys}</kbd></li>;
}
