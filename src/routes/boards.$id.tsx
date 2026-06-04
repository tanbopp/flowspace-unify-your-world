import { createFileRoute } from "@tanstack/react-router";
import { BoardView } from "../components/BoardView";

function BoardsIdComponent() {
  const { id } = Route.useParams();
  return <BoardView boardId={id} />;
}

export const Route = createFileRoute("/boards/$id")({
  component: BoardsIdComponent,
});
