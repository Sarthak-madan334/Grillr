import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";

export default function NotFound() {
  return <main className="min-h-screen"><TopNav /><section className="mx-auto max-w-xl px-6 py-24 text-center"><p className="eyebrow justify-center">GRILLR / 404</p><h1 className="mt-6 text-4xl font-normal">Let’s find your way back.</h1><p className="mt-5 text-sm leading-7 text-[var(--muted)]">This page isn’t here, but your next practice session is just a step away.</p><Link href="/" className="glass-button glass-button--primary mt-8">Back to Grillr</Link></section></main>;
}
