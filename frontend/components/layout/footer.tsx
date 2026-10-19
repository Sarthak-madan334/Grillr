import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-wordmark" aria-label="Grillr home">
            <span className="site-footer-mark" aria-hidden="true">G</span>
            <span>grillr<span className="site-footer-period">.</span></span>
          </Link>
          <p>A little practice for the<br />moments that matter.</p>
        </div>

        <nav className="site-footer-explore" aria-label="Footer navigation">
          <span className="site-footer-label">Explore</span>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/interview/setup">Start practicing</Link>
          <Link href="/privacy">Privacy policy</Link>
          <a href="https://github.com/Sarthak-madan334/Grillr" target="_blank" rel="noreferrer">
            Project repository <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <div className="site-footer-note">
          <span className="site-footer-note-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 18.5V6m0 12.5h6.5a4 4 0 0 0 4-4V9m0 0 3-3m-3 3-3-3M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="5" cy="5" r="1.5" fill="currentColor" />
              <circle cx="5" cy="19" r="1.5" fill="currentColor" />
              <circle cx="16" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <p>Built for the work<br />behind the big moment.</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© 2026 Grillr</span>
        <span>Practice with purpose.</span>
      </div>
    </footer>
  );
}
