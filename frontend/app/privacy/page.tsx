import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-[#e7d8c5]/80 bg-[rgba(255,255,255,0.46)] p-6 shadow-[0_20px_60px_rgba(120,92,68,0.08)] backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a5f48]">Grillr</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#201a17]">Privacy Policy</h1>
          <p className="mt-6 leading-7 text-[#5e4d40]">
            Grillr is designed to help you practice interviews. We only use information needed to provide the practice experience, improve the product, and keep your account secure.
          </p>
          <p className="mt-4 leading-7 text-[#5e4d40]">
            You can contact the Grillr team to ask about your information, request corrections, or request account deletion.
          </p>
          <Link href="/" className="mt-8 inline-block text-sm font-semibold text-[#755d4a] transition hover:text-[#201a17] hover:underline">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
