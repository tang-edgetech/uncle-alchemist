import type { CSSProperties } from "react";
import type { ElementArt, MedallionMetal } from "@/lib/game/types";

interface MetalSpec {
  rim: string;
  base: string;
  edge: string;
}

const METALS: Record<MedallionMetal, MetalSpec> = {
  bronze: {
    rim: "linear-gradient(150deg, #F6CFA6 0%, #CF8A57 24%, #8E4E25 56%, #5C2F14 78%, #D99A68 100%)",
    base: "#3A1E0A",
    edge: "rgba(70,30,8,0.7)",
  },
  silver: {
    rim: "linear-gradient(150deg, #FFFFFF 0%, #DDE2EA 24%, #9BA4B2 56%, #5E6775 78%, #E8ECF2 100%)",
    base: "#363C46",
    edge: "rgba(40,46,56,0.7)",
  },
  gold: {
    rim: "linear-gradient(150deg, #FFF0B8 0%, #F2C55C 22%, #B9822C 55%, #7A4F17 78%, #E9B858 100%)",
    base: "#4A2F0C",
    edge: "rgba(70,40,5,0.65)",
  },
};

interface MedallionProps {
  art: ElementArt;
  metal?: MedallionMetal;
  flat?: boolean;
  className?: string;
}

export function Medallion({ art, metal = "bronze", flat = false, className = "" }: MedallionProps) {
  const spec = METALS[metal];
  const ink = art.pale ? art.lo : "#FFFFFF";
  const shade = art.pale ? "rgba(255,255,255,0.75)" : art.lo;

  const rimStyle: CSSProperties = {
    background: spec.rim,
    padding: "8cqw",
    boxShadow: flat
      ? `0 2cqw 0 ${spec.base}, inset 0 1.5cqw 1cqw rgba(255,255,255,0.6)`
      : `0 5cqw 0 ${spec.base}, 0 9cqw 14cqw rgba(0,0,0,0.45), inset 0 1.5cqw 1cqw rgba(255,255,255,0.6), inset 0 -1.5cqw 1.5cqw rgba(0,0,0,0.3)`,
  };

  const enamelStyle: CSSProperties = {
    border: `1.6cqw solid ${spec.edge}`,
    background: art.sheen ?? `radial-gradient(circle at 40% 30%, ${art.hi} 0%, ${art.color} 50%, ${art.lo} 100%)`,
    boxShadow: "inset 0 4cqw 8cqw rgba(0,0,0,0.45), inset 0 -2.5cqw 3cqw rgba(255,255,255,0.2)",
  };

  return (
    <div className={`aspect-square w-full [container-type:inline-size] ${className}`} aria-hidden="true">
      <div className="relative box-border h-full w-full rounded-full" style={rimStyle}>
        <div className="relative box-border flex h-full w-full items-center justify-center overflow-hidden rounded-full" style={enamelStyle}>
          <span
            className="absolute left-[14%] top-[6%] h-[36%] w-[72%]"
            style={{ borderRadius: "50% 50% 45% 45%", background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0))" }}
          />
          <svg viewBox="0 0 48 48" className="relative h-[56%] w-[56%] overflow-visible">
            {art.accents?.map((accent, index) => (
              <path key={index} d={accent.d} fill="none" stroke={accent.color} strokeWidth={accent.width} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            <path d={art.icon} transform="translate(0 2)" fill="none" stroke={shade} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
            <path d={art.icon} fill="none" stroke={ink} strokeWidth={3.6} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
