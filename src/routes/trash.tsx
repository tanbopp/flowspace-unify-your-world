import { createFileRoute } from "@tanstack/react-router";
import { Trash } from "../components/Trash";

export const Route = createFileRoute("/trash")({
  component: Trash,
});
