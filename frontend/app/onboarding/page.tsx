import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-6 py-12">
      <section className="w-full max-w-xl rounded-[32px] border border-[#e7d8c5] bg-white p-8 text-center shadow-[0_24px_80px_rgba(45,36,29,0.08)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b6f55]">
          Grillr
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#2d241d]">
          Your workspace is ready
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6f6257]">
          Choose an interview setup when you are ready to begin practicing.
        </p>
        <Link
          href="/interview/setup"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#2d241d] px-6 text-sm font-medium text-white transition hover:bg-[#1f1915]"
        >
          Start an interview
        </Link>
      </section>
    </main>
  );
}
