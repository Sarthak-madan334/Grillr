import { GrillrBrand } from "@/components/GrillrLogo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-wordmark" aria-label="Grillr home"><GrillrBrand /></Link>
          <p>Practice. Reflect. Grow.</p>
        </div>
        <nav className="site-footer-explore" aria-label="Footer navigation">
          <Link href="/#landing-title">About</Link>
          <Link href="/#how-it-works">How it works</Link>
          <a href="https://github.com/Sarthak-madan334/Grillr" target="_blank" rel="noreferrer">Repository <span aria-hidden="true">↗</span></a>
          <Link href="/interview/setup">Start practicing</Link>
          <Link href="/privacy">Privacy policy</Link>
        </nav>
      </div>
      <div className="site-footer-bottom"><span>© 2026 Grillr</span><span>A little more ready.</span></div>
    </footer>
  );
}
