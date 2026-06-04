import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "../../lib/store";

export const Route = createFileRoute("/pages/")({
  component: PagesIndex,
});

function PagesIndex() {
  const pages = useStore((s) => s.pages.filter((p) => !p.trashed && !p.parentId));
  const navigate = useNavigate();
  useEffect(() => {
    if (pages[0]) navigate({ to: "/pages/$id", params: { id: pages[0].id } });
  }, [pages, navigate]);
  return <div className="p-8 text-muted-foreground">No pages yet.</div>;
}
