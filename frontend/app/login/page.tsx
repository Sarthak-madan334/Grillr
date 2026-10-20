"use client";

import Link from "next/link";
import { OAuthButtons } from "@/components/OAuthButtons";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function oauthErrorMessage(code: string | null) {
  const messages: Record<string, string> = {
    cancelled: "Sign-in was cancelled. You can try again.",
    invalid_callback: "The sign-in response was invalid. Please try again.",
    exchange_failed: "We could not complete sign-in with the provider. Please try again.",
    account_sync_failed: "Your provider sign-in succeeded, but we could not prepare your Grillr account.",
    provider_unavailable: "The authentication provider is unavailable. Please try again later.",
    unsupported_provider: "That sign-in provider is not supported.",
  };
  return messages[code ?? ""] ?? "";
}

function LoginContent() {
  const searchParams = useSearchParams();
  const message = oauthErrorMessage(searchParams.get("oauth_error"));
  const requestedNext = searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  return (
    <main className="login-page min-h-screen bg-[var(--surface)] px-3 py-3 text-[var(--foreground)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="login-surface mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[var(--surface)] px-6 py-10 text-[var(--foreground)] sm:px-10 sm:py-12 lg:block lg:px-12 lg:py-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[var(--border)]" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[var(--border)]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[var(--muted)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xl font-semibold text-[var(--foreground)]">G</span>
              GRILLR
            </div>
            <div className="my-auto max-w-md py-8 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Interview practice, with a pulse</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Practice interviews that talk back.</h1>
              <p className="mt-4 max-w-sm text-base leading-7 text-[var(--muted)]">Build the clarity, confidence, and composure to make your next answer count.</p>
            </div>
            <p className="text-xs text-[var(--muted)]">A calmer way to get interview-ready.</p>
          </div>
        </section>

        <section className="login-auth-panel relative flex min-h-full items-center justify-center overflow-hidden px-6 py-12 sm:px-12 sm:py-14 lg:px-14 lg:py-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[var(--border)]" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[var(--border)]" />
          <div className="relative w-full max-w-md text-center">
            <Link href="/" className="auth-home">← Back to Grillr</Link>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-2xl font-semibold text-[var(--muted)] shadow-[var(--shadow-soft)]">G</div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">Your next answer starts here.</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">Use your existing Google or GitHub account to continue practicing.</p>

            {message ? <div role="alert" className="mt-6 rounded-2xl border border-[var(--error)] bg-[var(--error-surface)] px-4 py-3 text-left text-sm text-[var(--error)]">{message}</div> : null}

            <div className="mx-auto mt-8 w-full max-w-sm"><OAuthButtons next={nextPath} /></div>
            <p className="mx-auto mt-6 max-w-sm text-xs leading-5 text-[var(--muted)]">New to Grillr? Just sign in. We&apos;ll set up your account automatically.</p>
            <p className="mt-10 text-[11px] leading-5 text-[var(--muted)]">By continuing, you agree to our Terms and Privacy Policy.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="auth-skeleton" role="status" aria-label="Loading sign-in"><div /><div /><div /></div>}><LoginContent /></Suspense>;
}
