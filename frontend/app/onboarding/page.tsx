import Link from "next/link";
import { GrillrBrand } from "@/components/GrillrLogo";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 py-12">
      <section className="w-full max-w-xl rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-soft)] sm:p-12">
        <div className="flex justify-center"><GrillrBrand /></div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Your workspace is ready
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
          Choose an interview setup when you are ready to begin practicing.
        </p>
        <Link
          href="/interview/setup"
          className="glass-button glass-button--primary mt-8"
        >
          Start an interview
        </Link>
      </section>
    </main>
  );
}
