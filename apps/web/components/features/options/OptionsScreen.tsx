"use client";

import { useRouter } from "next/navigation";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { useT } from "@/lib/i18n/translate";
import { OptionsPanel } from "./OptionsPanel";

export function OptionsScreen() {
  const t = useT();
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col gap-6 px-4 pb-10 pt-4">
      <div className="flex w-full items-center">
        <RoundIconButton icon="back" label={t("common.back")} onClick={() => router.push("/")} />
      </div>
      <h1 className="text-center font-display text-4xl font-bold text-gold-light text-gold-shadow">{t("options.title")}</h1>
      <GoldFrame innerClassName="p-4">
        <OptionsPanel allowReset />
      </GoldFrame>
    </main>
  );
}
