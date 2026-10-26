import { GameIcon } from "./GameIcon";

const SLOTS = [0, 1, 2];

interface StarRowProps {
  count: number;
  className?: string;
}

export function StarRow({ count, className = "h-4 w-4" }: StarRowProps) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {SLOTS.map((slot) => (
        <GameIcon key={slot} name="star" filled className={`${className} ${slot < count ? "text-[#FFC93C]" : "text-black/35"}`} />
      ))}
    </span>
  );
}
