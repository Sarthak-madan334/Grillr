import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#d2d2d7] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-[#6e6e73] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d2d2d7] bg-white text-xs font-semibold text-[#1d1d1f]">G</span>
          <p>© 2026 Grillr. Practice with purpose.</p>
        </div>
        <Link href="/privacy" className="text-[#2563eb] transition hover:text-[#1d4ed8] hover:underline">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
