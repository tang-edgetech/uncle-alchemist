import { notFound } from "next/navigation";
import { GameScreen } from "@/components/features/game/GameScreen";
import { allStageIds, parseStageId } from "@/lib/game/stages";

export function generateStaticParams() {
  return allStageIds().map((stage) => ({ stage }));
}

export default async function PlayPage(props: PageProps<"/play/[stage]">) {
  const { stage } = await props.params;
  if (!parseStageId(stage)) notFound();
  return <GameScreen stageId={stage} />;
}
