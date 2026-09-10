"use client";

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
    <main className="login-page min-h-screen bg-[#f8f5f1] px-3 py-3 text-[#2d241d] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="login-surface mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[30px] border border-[#d8cfc6] bg-white shadow-[0_28px_100px_rgba(45,36,29,0.12)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[#2d241d] px-6 py-10 text-[#f9f5f1] sm:px-10 sm:py-12 lg:block lg:px-12 lg:py-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#cda67f]/20" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[#cda67f]/15" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#e9c8a6]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cda67f]/40 bg-[#4a392d] text-xl font-semibold text-[#f9f5f1]">G</span>
              GRILLR
            </div>
            <div className="my-auto max-w-md py-8 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5a77d]">Interview practice, with a pulse</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Practice interviews that talk back.</h1>
              <p className="mt-4 max-w-sm text-base leading-7 text-[#d9c9bb]">Build the clarity, confidence, and composure to make your next answer count.</p>
            </div>
            <p className="text-xs text-[#aa9582]">A calmer way to get interview-ready.</p>
          </div>
        </section>

        <section className="login-auth-panel relative flex min-h-full items-center justify-center overflow-hidden px-6 py-12 sm:px-12 sm:py-14 lg:px-14 lg:py-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#cda67f]/20" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[#cda67f]/15" />
          <div className="relative w-full max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d8c1aa] bg-[#f5ebe1] text-2xl font-semibold text-[#6b503d] shadow-[0_10px_24px_rgba(107,80,61,0.12)]">G</div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7658]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2d241d] sm:text-4xl">Your next answer starts here.</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6e6259]">Use your existing Google or GitHub account to continue practicing.</p>

            {message ? <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm text-rose-700">{message}</div> : null}

            <div className="mx-auto mt-8 w-full max-w-sm"><OAuthButtons next={nextPath} /></div>
            <p className="mx-auto mt-6 max-w-sm text-xs leading-5 text-[#806f62]">New to Grillr? Just sign in. We&apos;ll set up your account automatically.</p>
            <p className="mt-10 text-[11px] leading-5 text-[#a08d7e]">By continuing, you agree to our Terms and Privacy Policy.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
