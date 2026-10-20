"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GrillrBrand } from "@/components/GrillrLogo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center px-6 py-16"><section className="surface-card w-full max-w-lg p-8 text-center" role="alert"><div className="flex justify-center"><GrillrBrand /></div><h1 className="mt-5 text-3xl font-normal">A small pause in the conversation.</h1><p className="mt-5 text-sm leading-7 text-[var(--muted)]">Something didn’t load as expected. Try again when you’re ready.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button onClick={reset}>Try again</Button><Link href="/" className="glass-button glass-button--secondary">Back home</Link></div></section></main>;
}
