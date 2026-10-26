import { Fragment, type ReactNode } from "react";

export interface Stat {
  label: string;
  value: ReactNode;
  alert?: boolean;
}

export function StatPill({ stats }: { stats: Stat[] }) {
  return (
    <div className="rounded-full bg-gold p-[3px] shadow-[0_3px_0_#4A2F0C]">
      <div className="flex items-center gap-3 rounded-full bg-[linear-gradient(180deg,#5A3A22,#3E2615)] px-4 py-1.5 text-cream">
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && <span className="h-7 w-px bg-[#8C5A1C]" />}
            <span className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-mid">{stat.label}</span>
              <span className={`font-display text-lg font-bold tabular-nums ${stat.alert ? "text-[#FF7A6B]" : ""}`}>{stat.value}</span>
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
