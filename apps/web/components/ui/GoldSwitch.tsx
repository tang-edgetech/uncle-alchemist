interface GoldSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
  describedBy?: string;
}

export function GoldSwitch({ checked, onChange, labelledBy, describedBy }: GoldSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className="shrink-0 rounded-full bg-gold p-[3px] shadow-[0_2px_0_#4A2F0C] outline-none focus-visible:ring-2 focus-visible:ring-[#FFE07A]"
    >
      <span
        className={`relative flex h-8 w-14 items-center rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-colors ${
          checked ? "bg-[#1F6E6A]" : "bg-[#3A2414]"
        }`}
      >
        <span
          className={`absolute h-6 w-6 rounded-full bg-[radial-gradient(circle_at_40%_30%,#FFF6D8,#E7B455_60%,#8C5A1C)] shadow-[0_2px_3px_rgba(0,0,0,0.5)] transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
