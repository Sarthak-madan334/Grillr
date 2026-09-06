import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <TopNav />

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <header className="max-w-3xl border-b border-[#e5e5e5] pb-12 sm:pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#525252]">Grillr / Legal</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#111111] sm:text-6xl">Privacy Policy</h1>
          <p className="mt-6 text-sm font-medium text-[#737373]">Effective September 2026</p>
        </header>

        <article className="max-w-4xl divide-y divide-[#e5e5e5]">
          <section className="grid gap-5 py-12 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-16" aria-labelledby="section-purpose">
            <p className="font-mono text-sm font-medium tracking-[0.12em] text-[#737373]" aria-hidden="true">01</p>
            <div>
              <h2 id="section-purpose" className="text-2xl font-semibold tracking-[-0.02em] text-[#171717] sm:text-3xl">Our approach</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#404040]">
                Grillr is designed to help you practice interviews. We only use information needed to provide the practice experience, improve the product, and keep your account secure.
              </p>
            </div>
          </section>

          <section className="grid gap-5 py-12 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-16" aria-labelledby="section-choices">
            <p className="font-mono text-sm font-medium tracking-[0.12em] text-[#737373]" aria-hidden="true">02</p>
            <div>
              <h2 id="section-choices" className="text-2xl font-semibold tracking-[-0.02em] text-[#171717] sm:text-3xl">Your choices</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#404040]">
                You can contact the Grillr team to ask about your information, request corrections, or request account deletion.
              </p>
            </div>
          </section>

          <section className="grid gap-5 py-12 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-16" aria-labelledby="section-contact">
            <p className="font-mono text-sm font-medium tracking-[0.12em] text-[#737373]" aria-hidden="true">03</p>
            <div>
              <h2 id="section-contact" className="text-2xl font-semibold tracking-[-0.02em] text-[#171717] sm:text-3xl">Contact Grillr</h2>
              <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#737373]">Privacy questions</p>
              <a
                href="mailto:thegrillrai@gmail.com"
                className="mt-3 inline-block break-all text-lg font-semibold text-[#171717] underline decoration-[#a3a3a3] underline-offset-4 transition-colors hover:text-[#525252] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-4 sm:text-xl"
              >
                thegrillrai@gmail.com
              </a>
            </div>
          </section>
        </article>

        <div className="mt-2 border-t border-[#e5e5e5] pt-8">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#404040] underline decoration-[#a3a3a3] underline-offset-4 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-4">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
