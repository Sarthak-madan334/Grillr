import { TopNav } from "@/components/layout/top-nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#241d1a]">
      <TopNav />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <header className="max-w-2xl border-b border-[#e7d8c5] pb-12 sm:pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a5f48]">
            Grillr
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-[#201a17] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 text-sm font-medium text-[#7a5f48]">
            Effective date: September 5, 2026
          </p>
          <p className="mt-8 max-w-xl text-base leading-8 text-[#5e4d40] sm:text-lg">
            Grillr handles the data created during interview practice with care.
            This policy explains what we collect, why we use it, and the choices
            you have over your information.
          </p>
        </header>

        <ol className="m-0 list-none p-0">
          <li className="grid gap-3 border-b border-[#e7d8c5] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#a27c5b]">
              01
            </p>
            <section aria-labelledby="information-we-collect">
              <h2
                id="information-we-collect"
                className="text-2xl font-semibold tracking-[-0.01em] text-[#201a17]"
              >
                Information we collect
              </h2>
              <p className="mt-5 leading-7 text-[#5e4d40]">
                Grillr is an AI-powered mock interview tool. To run practice
                sessions and provide feedback, we collect:
              </p>
              <ul className="mt-5 space-y-4 leading-7 text-[#5e4d40]">
                <li>
                  <strong className="font-semibold text-[#3d3028]">
                    Account information:
                  </strong>{" "}
                  your name and email address when you create an account.
                </li>
                <li>
                  <strong className="font-semibold text-[#3d3028]">
                    Interview audio and responses:
                  </strong>{" "}
                  your spoken answers during a session, so we can analyze speech
                  and generate feedback.
                </li>
                <li>
                  <strong className="font-semibold text-[#3d3028]">
                    Session activity:
                  </strong>{" "}
                  questions asked, generated follow-ups, and progress across
                  sessions.
                </li>
              </ul>
              <aside
                className="mt-8 flex gap-3 border-l-2 border-[#b8916d] bg-[#f7eee4] px-4 py-4 text-sm leading-6 text-[#4d3b2e]"
                aria-label="Privacy reassurance"
              >
                <svg
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#8f6b4d]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3 19 6v5c0 4.6-2.9 8.2-7 10-4.1-1.8-7-5.4-7-10V6l7-3Z" />
                  <rect x="9" y="10" width="6" height="5" rx="1" />
                  <path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10" />
                </svg>
                <p>
                  We do not collect passwords in plain text, payment card
                  details, or audio from outside an active practice session.
                </p>
              </aside>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[#e7d8c5] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#a27c5b]">
              02
            </p>
            <section aria-labelledby="how-we-use-your-data">
              <h2
                id="how-we-use-your-data"
                className="text-2xl font-semibold tracking-[-0.01em] text-[#201a17]"
              >
                How we use your data
              </h2>
              <p className="mt-5 leading-7 text-[#5e4d40]">
                The information we collect is used only to power Grillr&apos;s
                core features:
              </p>
              <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[#5e4d40] marker:text-[#b8916d]">
                <li>Analyze speech for pace, clarity, and confidence.</li>
                <li>Generate follow-up questions based on your answers.</li>
                <li>Produce feedback after each session.</li>
                <li>
                  Track progress across retries so you can see improvement over
                  time.
                </li>
              </ul>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[#e7d8c5] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#a27c5b]">
              03
            </p>
            <section aria-labelledby="data-processing">
              <h2
                id="data-processing"
                className="text-2xl font-semibold tracking-[-0.01em] text-[#201a17]"
              >
                Data processing and third parties
              </h2>
              <p className="mt-5 leading-7 text-[#5e4d40]">
                Interview audio and transcripts may be processed through
                Grillr&apos;s AI provider API to generate feedback and follow-up
                questions. Grillr does not sell data or share recordings or
                transcripts with advertisers or data brokers.
              </p>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[#e7d8c5] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#a27c5b]">
              04
            </p>
            <section aria-labelledby="storage-retention-controls">
              <h2
                id="storage-retention-controls"
                className="text-2xl font-semibold tracking-[-0.01em] text-[#201a17]"
              >
                Data storage, retention, and your controls
              </h2>
              <p className="mt-5 leading-7 text-[#5e4d40]">
                Recordings and transcripts are kept only as long as necessary
                for feedback and progress tracking. You can:
              </p>
              <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[#5e4d40] marker:text-[#b8916d]">
                <li>Delete individual session recordings.</li>
                <li>Request a full export of your data.</li>
                <li>
                  Delete your account, including recordings, transcripts, and
                  personal information.
                </li>
              </ul>
            </section>
          </li>

          <li className="grid gap-3 py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#a27c5b]">
              05
            </p>
            <section aria-labelledby="contact-us">
              <h2
                id="contact-us"
                className="text-2xl font-semibold tracking-[-0.01em] text-[#201a17]"
              >
                Contact us
              </h2>
              <p className="mt-5 leading-7 text-[#5e4d40]">
                Questions about this policy, or requests to access, correct,
                export, or delete your data, can be sent to:
              </p>
              <a
                href="mailto:sarthakmadan88@gmail.com"
                className="mt-5 inline-block break-all text-base font-semibold text-[#6f5139] underline decoration-[#c9a984] decoration-2 underline-offset-4 transition hover:text-[#201a17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b4d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fffaf4]"
                aria-label="Email Grillr privacy support at sarthakmadan88@gmail.com"
              >
                sarthakmadan88@gmail.com
              </a>
            </section>
          </li>
        </ol>
      </article>
    </main>
  );
}
