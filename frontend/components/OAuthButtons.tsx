import type { OAuthProvider } from "@/lib/oauth";

function ProviderIcon({ provider }: { provider: OAuthProvider }) {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center text-xs font-bold">{provider === "google" ? "G" : "GH"}</span>;
}

export function OAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const href = (provider: OAuthProvider) => `/api/auth/oauth/${provider}?next=${encodeURIComponent(next)}`;
  return <div className="grid w-full gap-3"><a href={href("google")} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-5 text-sm font-medium text-[#1d1d1f] transition hover:-translate-y-0.5 hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9c7d5d]/50"><ProviderIcon provider="google" />Sign in with Google</a><a href={href("github")} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-5 text-sm font-medium text-[#1d1d1f] transition hover:-translate-y-0.5 hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9c7d5d]/50"><ProviderIcon provider="github" />Sign in with GitHub</a></div>;
}
