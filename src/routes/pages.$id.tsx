import { createFileRoute } from "@tanstack/react-router";
import { PageEditor } from "../components/PageEditor";

function PagesIdComponent() {
  const { id } = Route.useParams();
  return <PageEditor pageId={id} />;
}

export const Route = createFileRoute("/pages/$id")({
  component: PagesIdComponent,
});
