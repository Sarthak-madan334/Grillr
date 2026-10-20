import { TopNav } from "@/components/layout/top-nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <TopNav />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <header className="max-w-2xl border-b border-[var(--border)] pb-12 sm:pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Grillr / Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 text-sm font-medium text-[var(--muted)]">Effective date: September 5, 2026</p>
          <p className="mt-8 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Grillr handles the data created during interview practice with care. This policy explains what we collect, why we use it, and the choices you have over your information.
          </p>
        </header>

        <ol className="m-0 list-none p-0">
          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">01</p>
            <section aria-labelledby="information-we-collect">
              <h2 id="information-we-collect" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Information we collect</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Grillr is an AI-powered mock interview tool. To run practice sessions and provide feedback, we collect:</p>
              <ul className="mt-5 space-y-4 leading-7 text-[var(--muted)]">
                <li><strong className="font-semibold text-[var(--foreground)]">Account information:</strong> your name and email address when you create an account.</li>
                <li><strong className="font-semibold text-[var(--foreground)]">Interview audio and responses:</strong> your spoken answers during a session, so we can analyze speech and generate feedback.</li>
                <li><strong className="font-semibold text-[var(--foreground)]">Session activity:</strong> questions asked, generated follow-ups, and progress across sessions.</li>
              </ul>
              <aside className="mt-8 flex gap-3 border-l-2 border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]" aria-label="Privacy reassurance">
                <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3 19 6v5c0 4.6-2.9 8.2-7 10-4.1-1.8-7-5.4-7-10V6l7-3Z" />
                  <rect x="9" y="10" width="6" height="5" rx="1" />
                  <path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10" />
                </svg>
                <p>We do not collect passwords in plain text, payment card details, or audio from outside an active practice session.</p>
              </aside>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">02</p>
            <section aria-labelledby="how-we-use-your-data">
              <h2 id="how-we-use-your-data" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">How we use your data</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">The information we collect is used only to power Grillr&apos;s core features:</p>
              <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[var(--muted)] marker:text-[var(--muted)]">
                <li>Analyze speech for pace, clarity, and confidence.</li>
                <li>Generate follow-up questions based on your answers.</li>
                <li>Produce feedback after each session.</li>
                <li>Track progress across retries so you can see improvement over time.</li>
              </ul>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">03</p>
            <section aria-labelledby="data-processing">
              <h2 id="data-processing" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Data processing and third parties</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Interview audio and transcripts may be processed through Grillr&apos;s AI provider API to generate feedback and follow-up questions. Grillr does not sell data or share recordings or transcripts with advertisers or data brokers.</p>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">04</p>
            <section aria-labelledby="storage-retention-controls">
              <h2 id="storage-retention-controls" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Data storage, retention, and your controls</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Recordings and transcripts are kept only as long as necessary for feedback and progress tracking. You can:</p>
              <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[var(--muted)] marker:text-[var(--muted)]">
                <li>Delete individual session recordings.</li>
                <li>Request a full export of your data.</li>
                <li>Delete your account, including recordings, transcripts, and personal information.</li>
              </ul>
            </section>
          </li>

          <li className="grid gap-3 py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">05</p>
            <section aria-labelledby="contact-us">
              <h2 id="contact-us" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Contact us</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Questions about this policy, or requests to access, correct, export, or delete your data, can be sent to:</p>
              <a href="mailto:thegrillrai@gmail.com" className="mt-5 inline-block break-all text-base font-semibold text-[var(--foreground)] underline decoration-[var(--border)] decoration-2 underline-offset-4 transition hover:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-white" aria-label="Email Grillr privacy support at thegrillrai@gmail.com">thegrillrai@gmail.com</a>
            </section>
          </li>
        </ol>
      </article>
    </main>
  );
}
