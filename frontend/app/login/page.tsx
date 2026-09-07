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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.05),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-base font-semibold text-white">
            G
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Grillr</p>
            <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          </div>
        </div>

        {message ? (
          <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-sm">
          <OAuthButtons next={nextPath} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-slate-900">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
