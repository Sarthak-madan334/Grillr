import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#eadcc8]/80 bg-[rgba(255,250,244,0.58)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#e7d8c5] bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(236,220,204,0.82))] shadow-[0_10px_22px_rgba(80,59,43,0.12)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_26px_rgba(80,59,43,0.16)]">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_55%)]" />
            <svg
              viewBox="0 0 56 56"
              className="relative h-8 w-8 drop-shadow-[0_3px_10px_rgba(73,55,47,0.12)]"
              aria-label="Grillr logo"
              role="img"
            >
              <defs>
                <linearGradient id="grillr-g-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b2d27" />
                  <stop offset="100%" stopColor="#695547" />
                </linearGradient>
              </defs>

              <rect x="4" y="4" width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)" stroke="rgba(117,93,74,0.35)" />

              <path
                d="M37 13.5c-4.1-3.2-9.4-4.2-14.5-3.2-7 1.4-12.7 7.2-13.8 14.3-1.2 8.4 3.4 16.3 11.2 18.8 5.8 1.8 12.1.7 16.5-3.2"
                fill="none"
                stroke="url(#grillr-g-glow)"
                strokeWidth="4.3"
                strokeLinecap="round"
              />

              <path d="M30 28h11" stroke="url(#grillr-g-glow)" strokeWidth="3.7" strokeLinecap="round" />

              <path d="M17 24v8M22 20v16M27 17v22" stroke="#d6a97b" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />

              <circle cx="39" cy="28" r="2.4" fill="#d6a97b" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] text-[#755d4a]">GRILLR</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[#5e4d40] md:flex">
          <Link href="/dashboard" className="transition hover:text-[#201a17]">
            Dashboard
          </Link>
          <Link href="/interview/setup" className="transition hover:text-[#201a17]">
            Interview Setup
          </Link>
          <Link href="/history" className="transition hover:text-[#201a17]">
            History
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#473a2d] transition hover:bg-[#f2e5d7]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[#e7d8c5] bg-[linear-gradient(135deg,rgba(48,38,31,0.96),rgba(76,62,54,0.9))] px-4 py-2 text-sm font-medium text-[#f9f5f1] shadow-[0_12px_24px_rgba(47,36,30,0.16)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(47,36,30,0.2)]"
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}
