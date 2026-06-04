import { createFileRoute } from "@tanstack/react-router";
import { PageEditor } from "../components/PageEditor";

export const Route = createFileRoute("/pages/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <PageEditor pageId={id} />;
  },
});
