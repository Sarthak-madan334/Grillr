"use client";

import { GrillrLogo } from "@/components/GrillrLogo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-client";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  activeOnHome?: boolean;
};

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navItems: NavItem[] = pathname === "/"
    ? [
        { href: "/#landing-title", label: "About", activeOnHome: true },
        { href: "/#how-it-works", label: "How it works" },
        { href: "https://github.com/Sarthak-madan334/Grillr", label: "Repository", external: true },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/interview/setup", label: "Practice" },
        { href: "/history", label: "History" },
        { href: "/ai-core", label: "AI Core" },
      ];

  const isActive = (href: string, activeOnHome = false) =>
    (activeOnHome && pathname === "/") || pathname === href || pathname.startsWith(`${href}/`);

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

  function closeMenu() {
    setIsMenuOpen(false);
  }

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
          <GrillrLogo />
          <div className="max-[359px]:hidden">
            <div className="grillr-brand-name">GRILLR</div>
            <div className="grillr-brand-tagline">INTERVIEW COACH</div>
          </div>
        </Link>

        <nav className="grillr-nav-links hidden items-center md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const className = `grillr-nav-link ${isActive(item.href, item.activeOnHome) ? "is-active" : ""}`;
            return item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={className}>
                {item.label}<span className="grillr-nav-external" aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="flex min-w-0 max-w-[12rem] items-center gap-2 rounded-full border border-[#d7e0ee] bg-white/80 px-2.5 py-1.5 shadow-[0_2px_10px_rgba(16,35,63,0.03)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[10px] font-bold text-[#365bb4]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[11px] font-semibold text-[#4b5d77]">
                Welcome back, {greetingName}
              </span>
            </div>
          ) : null}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="grillr-nav-action grillr-nav-action-muted"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="grillr-nav-signin hidden sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="grillr-nav-signin grillr-nav-signup hidden sm:inline-flex"
              >
                Get started <span className="grillr-nav-cta-arrow" aria-hidden="true">→</span>
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
              <span className="min-w-0 truncate text-[10px] font-semibold text-[#4b5d77]">
                {greetingName}
              </span>
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
                {navItems.map((item) => {
                  const className = `grillr-mobile-link ${isActive(item.href, item.activeOnHome) ? "is-active" : ""}`;
                  return item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noreferrer" onClick={closeMenu} className={className}>
                      {item.label}<span aria-hidden="true"> ↗</span>
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} onClick={closeMenu} className={className}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="my-3 border-t border-[#e7d8c5]" />
              <div className="space-y-1">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void handleSignOut();
                    }}
                    className="grillr-mobile-auth grillr-mobile-auth-button"
                  >
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="grillr-mobile-auth">
                      Sign in
                    </Link>
                    <Link href="/signup" onClick={closeMenu} className="grillr-mobile-auth grillr-mobile-auth-primary">
                      Get started <span aria-hidden="true">→</span>
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
