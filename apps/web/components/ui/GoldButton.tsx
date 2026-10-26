import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

interface GoldButtonBaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
}

interface GoldButtonActionProps extends GoldButtonBaseProps {
  onClick?: () => void;
  href?: undefined;
}

interface GoldButtonLinkProps extends GoldButtonBaseProps {
  href: string;
  onClick?: undefined;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[linear-gradient(180deg,#F05A2A,#B8340F)] text-white",
  secondary: "bg-[linear-gradient(180deg,#1F6E6A,#124845)] text-cream",
};

export function GoldButton(props: GoldButtonActionProps | GoldButtonLinkProps) {
  const { children, variant = "primary", className = "", disabled = false } = props;
  const shell = `group inline-flex rounded-full bg-gold p-[4px] shadow-[0_4px_0_#4A2F0C,0_10px_18px_rgba(0,0,0,0.4)] transition-transform active:translate-y-[3px] active:shadow-[0_1px_0_#4A2F0C] ${
    disabled ? "pointer-events-none opacity-55 saturate-50" : "hover:-translate-y-[1px]"
  } ${className}`;
  const face = `flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 font-display text-lg font-semibold shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.2)] ${VARIANTS[variant]}`;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={shell} aria-disabled={disabled}>
        <span className={face}>{children}</span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={props.onClick} disabled={disabled} className={shell}>
      <span className={face}>{children}</span>
    </button>
  );
}
