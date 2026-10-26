import { GameIcon, type GameIconName } from "./GameIcon";

interface RoundIconButtonProps {
  icon: GameIconName;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
}

export function RoundIconButton({ icon, label, onClick, active = false, disabled = false, showLabel = false }: RoundIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className="group flex flex-col items-center gap-1 disabled:opacity-45"
    >
      <span className="rounded-full bg-gold p-[3px] shadow-[0_3px_0_#4A2F0C,0_8px_14px_rgba(0,0,0,0.35)] transition-transform group-active:translate-y-[2px] group-active:shadow-[0_1px_0_#4A2F0C]">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.25)] ${
            active ? "bg-[linear-gradient(180deg,#FFE07A,#E0A93F)] text-wood-dark" : "bg-[linear-gradient(180deg,#F2A73B,#C2741A)] text-white"
          }`}
        >
          <GameIcon name={icon} className="h-6 w-6" filled={icon === "play"} />
        </span>
      </span>
      {showLabel && <span className="text-xs font-bold text-cream">{label}</span>}
    </button>
  );
}
