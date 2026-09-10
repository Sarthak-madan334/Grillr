"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-client";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/interview/setup", label: "Practice" },
    { href: "/history", label: "History" },
    { href: "/ai-core", label: "AI Core" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "there";
  const greetingName = displayName.length > 12 ? `${displayName.slice(0, 12).trimEnd()}…` : displayName;
  const greetingInitial = (displayName?.[0] ?? "G").toUpperCase();

  useEffect(() => {
    if (!isMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    await signOut();
    setIsMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="grillr-nav-shell sticky top-0 z-30">
      <div className="grillr-nav mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Grillr home" className="grillr-brand group flex min-w-0 items-center gap-2.5">
          <div className="grillr-brand-mark relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[11px]">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_55%)]" />
            <svg viewBox="0 0 56 56" className="relative h-8 w-8 drop-shadow-[0_3px_10px_rgba(73,55,47,0.12)]" aria-label="Grillr logo" role="img">
              <defs>
                <linearGradient id="grillr-g-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#b8d1ff" />
                </linearGradient>
              </defs>

              <rect x="4" y="4" width="48" height="48" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.24)" />

              <path
                d="M37 13.5c-4.1-3.2-9.4-4.2-14.5-3.2-7 1.4-12.7 7.2-13.8 14.3-1.2 8.4 3.4 16.3 11.2 18.8 5.8 1.8 12.1.7 16.5-3.2"
                fill="none"
                stroke="url(#grillr-g-glow)"
                strokeWidth="4.3"
                strokeLinecap="round"
              />

              <path d="M30 28h11" stroke="url(#grillr-g-glow)" strokeWidth="3.7" strokeLinecap="round" />
              <path d="M17 24v8M22 20v16M27 17v22" stroke="#f4b860" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
              <circle cx="39" cy="28" r="2.4" fill="#f4b860" />
            </svg>
          </div>

          <div className="max-[359px]:hidden">
            <div className="grillr-brand-name">GRILLR</div>
            <div className="grillr-brand-tagline">INTERVIEW COACH</div>
          </div>
        </Link>

        <nav className="grillr-nav-links hidden items-center md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`grillr-nav-link ${isActive(item.href) ? "is-active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="flex min-w-0 max-w-[12rem] items-center gap-2 rounded-full border border-[#d7e0ee] bg-white/80 px-2.5 py-1.5 shadow-[0_2px_10px_rgba(16,35,63,0.03)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[10px] font-bold text-[#365bb4]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[11px] font-semibold text-[#4b5d77]">Welcome back, {greetingName}</span>
            </div>
          ) : null}

          {isAuthenticated ? (
            <button type="button" onClick={handleSignOut} className="grillr-nav-action grillr-nav-action-muted">
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="grillr-nav-signin hidden sm:inline-flex">
                Sign in
              </Link>
              <Link href="/signup" className="grillr-nav-signin hidden sm:inline-flex">
                Create account
              </Link>
            </>
          )}
        </div>

        <div ref={menuRef} className="relative flex items-center gap-2 md:hidden">
          {isAuthenticated && user ? (
            <div className="flex max-w-[8rem] min-w-0 items-center gap-1.5 rounded-full border border-[#d7e0ee] bg-white/80 px-2 py-1 shadow-[0_2px_10px_rgba(16,35,63,0.03)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[9px] font-bold text-[#365bb4]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[10px] font-semibold text-[#4b5d77]">{greetingName}</span>
            </div>
          ) : null}

          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grillr-menu-button"
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            {isMenuOpen ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          {isMenuOpen ? (
            <nav id="mobile-navigation-menu" aria-label="Mobile navigation" className="grillr-mobile-menu absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-2rem))]">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={`grillr-mobile-link ${isActive(item.href) ? "is-active" : ""}`}>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="my-3 border-t border-[#e7d8c5]" />

              <div className="space-y-1">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void handleSignOut();
                    }}
                    className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#e7d8c5] bg-white px-3 text-sm font-medium text-[#473a2d] transition hover:bg-[#f2e5d7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-inset motion-reduce:transition-none"
                  >
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#473a2d] transition hover:bg-[#f2e5d7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-inset motion-reduce:transition-none">
                      Sign in
                    </Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl border border-[#e7d8c5] bg-[linear-gradient(135deg,rgba(48,38,31,0.96),rgba(76,62,54,0.9))] px-3 text-sm font-medium text-[#f9f5f1] shadow-[0_8px_18px_rgba(47,36,30,0.14)] transition hover:shadow-[0_10px_22px_rgba(47,36,30,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf4] motion-reduce:transition-none">
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
