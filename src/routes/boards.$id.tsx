import { createFileRoute } from "@tanstack/react-router";
import { BoardView } from "../components/BoardView";

export const Route = createFileRoute("/boards/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <BoardView boardId={id} />;
  },
});
