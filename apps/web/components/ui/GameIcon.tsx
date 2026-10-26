const ICONS = {
  pause: "M9 6 V18 M15 6 V18",
  play: "M8 5 L19 12 L8 19 Z",
  reset: "M4 12 A8 8 0 1 0 7 5.8 M4 4 V9 H9",
  undo: "M9 14 L4 9 L9 4 M4 9 H14 A6 6 0 0 1 14 21 H10",
  erase: "M7 20 H20 M4.5 14.5 L13 6 L19 12 L11.5 19.5 H8 Z M9 10 L15 16",
  notes: "M5 19 L6 14 L16 4 L20 8 L10 18 Z M14 6 L18 10",
  back: "M15 5 L8 12 L15 19",
  star: "M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 13.9 L17.9 20.5 L12 17.2 L6.1 20.5 L7.4 13.9 L2.5 9.4 L9.1 8.6 Z",
  globe: "M12 3 A9 9 0 1 0 12.01 3 M3 12 H21 M12 3 C8 8 8 16 12 21 M12 3 C16 8 16 16 12 21",
  lock: "M7 11 V8 A5 5 0 0 1 17 8 V11 M5 11 H19 V20 H5 Z",
  book: "M12 6 C10 4.5 7 4 4 4.5 V18.5 C7 18 10 18.5 12 20 C14 18.5 17 18 20 18.5 V4.5 C17 4 14 4.5 12 6 Z M12 6 V20",
} as const;

export type GameIconName = keyof typeof ICONS;

interface GameIconProps {
  name: GameIconName;
  className?: string;
  filled?: boolean;
}

export function GameIcon({ name, className = "h-6 w-6", filled = false }: GameIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d={ICONS[name]}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
