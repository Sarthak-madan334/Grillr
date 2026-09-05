import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e7d8c5]/80 bg-[rgba(255,250,244,0.42)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-[#755d4a] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 Grillr. Practice with purpose.</p>
        <Link href="/privacy" className="transition hover:text-[#201a17] hover:underline">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
