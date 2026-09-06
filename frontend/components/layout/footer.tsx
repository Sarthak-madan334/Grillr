import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#d2d2d7] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[#424245] sm:justify-start sm:gap-x-6">
            <li>
              <Link
                href="/#how-it-works"
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#1d1d1f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
              >
                About / How it works
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/Sarthak-madan334/Grillr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#1d1d1f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:sarthakmadan88@gmail.com"
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#1d1d1f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
              >
                Contact / Feedback
              </a>
            </li>
            <li>
              <Link
                href="/privacy"
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium transition hover:text-[#1d1d1f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#d2d2d7]/70 pt-5 text-xs text-[#6e6e73] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d2d2d7] bg-white text-xs font-semibold text-[#1d1d1f]"
            >
              G
            </span>
            <p>© 2026 Grillr. Practice with purpose.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
