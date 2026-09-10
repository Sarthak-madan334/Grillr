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
    <header className="sticky top-0 z-50 border-b border-[#d7c8ba] bg-[#0f1720]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Grillr home" className="group flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ba7a4b,#f0cf9c)] shadow-[0_12px_28px_rgba(186,122,75,0.35)] transition-transform duration-200 group-hover:-rotate-6">
            <span className="text-lg font-black tracking-[-0.08em] text-[#111827]">G</span>
          </div>
          <div className="max-[359px]:hidden">
            <div className="text-[11px] font-black tracking-[0.24em] text-[#f6f2ed]">GRILLR</div>
            <div className="mt-1 text-[7px] font-semibold tracking-[0.22em] text-[#b9c3cf]">INTERVIEW COACH</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-white/7 text-[#f5efe9]"
                  : "text-[#bac4d2] hover:bg-white/5 hover:text-[#f8f5f2]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="flex min-w-0 max-w-[12rem] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3e4d4] text-[10px] font-bold text-[#7a4f30]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[11px] font-semibold text-[#e6edf5]">
                {greetingName}
              </span>
            </div>
          ) : null}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-[#d7c8ba] bg-white/5 px-3.5 py-2 text-sm font-medium text-[#f5efe9] transition hover:bg-white/10"
            >
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-[#dfe7f0] transition hover:text-white">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-full border border-[#d7c8ba] bg-white/5 px-3.5 py-2 text-sm font-medium text-[#f5efe9] transition hover:bg-white/10">
                Create account
              </Link>
            </>
          )}
        </div>

        <div ref={menuRef} className="relative flex items-center gap-2 md:hidden">
          {isAuthenticated && user ? (
            <div className="flex max-w-[8rem] min-w-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f3e4d4] text-[9px] font-bold text-[#7a4f30]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[10px] font-semibold text-[#dce5ee]">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#f5efe9]"
          >
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
            <nav id="mobile-navigation-menu" aria-label="Mobile navigation" className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-2rem))] rounded-[22px] border border-white/10 bg-[#121b24] p-3 shadow-[0_25px_60px_rgba(15,23,32,0.45)]">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive(item.href) ? "bg-white/8 text-white" : "text-[#d0d8e1] hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="my-3 border-t border-white/10" />
              <div className="space-y-2">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void handleSignOut();
                    }}
                    className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#d7c8ba] bg-white/5 px-3 text-sm font-medium text-[#f5efe9]"
                  >
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#e4ebf6]">
                      Sign in
                    </Link>
                    <Link href="/signup" onClick={closeMenu} className="flex min-h-11 items-center justify-center rounded-xl border border-[#d7c8ba] bg-[#ba7a4b] px-3 text-sm font-medium text-[#fffaf5]">
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
