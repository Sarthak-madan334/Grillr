import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e7d8c5]/80 bg-[rgba(255,250,244,0.42)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[#5e4d40] sm:justify-start sm:gap-x-6">
            <li>
              <Link href="/#how-it-works" className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#201a17] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf4] motion-reduce:transition-none">
                About / How it works
              </Link>
            </li>
            <li>
              <a href="https://github.com/Sarthak-madan334/Grillr" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#201a17] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf4] motion-reduce:transition-none">
                GitHub
              </a>
            </li>
            <li>
              <a href="mailto:sarthakmadan88@gmail.com" className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#201a17] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf4] motion-reduce:transition-none">
                Contact / Feedback
              </a>
            </li>
            <li>
              <Link href="/privacy" className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#201a17] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf4] motion-reduce:transition-none">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#e7d8c5]/70 pt-5 text-xs text-[#8b735f] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7d8c5] bg-[#f8eee4] text-xs font-semibold text-[#5f4939]">G</span>
            <p>© 2026 Grillr. Practice with purpose.</p>
          </div>
          <Link href="/privacy" className="text-[#2563eb] transition hover:text-[#1d4ed8] hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
