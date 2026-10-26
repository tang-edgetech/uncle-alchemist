import { notFound } from "next/navigation";
import { StageListScreen } from "@/components/features/stages/StageListScreen";
import { WORLDS } from "@/lib/game/stages";

export function generateStaticParams() {
  return WORLDS.map((world) => ({ world: String(world.id) }));
}

export default async function WorldPage(props: PageProps<"/stages/[world]">) {
  const { world } = await props.params;
  const worldId = Number(world);
  if (!WORLDS.some((candidate) => candidate.id === worldId)) notFound();
  return <StageListScreen worldId={worldId} />;
}
