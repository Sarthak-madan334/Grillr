import Image from "next/image";

interface GrillrLogoProps {
  size?: number;
  className?: string;
  decorative?: boolean;
}

/** Canonical navbar artwork, shared by every product logo. */
export function GrillrLogo({ size = 36, className = "", decorative = false }: GrillrLogoProps) {
  const artworkSize = Math.round(size * 8 / 9);
  return (
    <span
      className={`grillr-brand-mark grillr-logo relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, borderRadius: size * 11 / 36 }}
      aria-hidden={decorative || undefined}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_55%)]" />
      <Image src="/grillr-logo.svg" width={artworkSize} height={artworkSize} alt={decorative ? "" : "Grillr logo"} loading="eager" className="relative drop-shadow-[0_3px_10px_rgba(73,55,47,0.12)]" />
    </span>
  );
}

export function GrillrBrand({ size = 36, className = "", tagline = true }: { size?: number; className?: string; tagline?: boolean }) {
  return <span className={`grillr-logo-lockup ${className}`}><GrillrLogo size={size} decorative /><span className="grillr-logo-wordmark"><strong>GRILLR</strong>{tagline ? <small>INTERVIEW COACH</small> : null}</span></span>;
}
