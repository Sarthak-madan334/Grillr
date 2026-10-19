import type { OAuthProvider } from "@/lib/oauth";

function ProviderIcon({ provider }: { provider: OAuthProvider }) {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center text-xs font-bold">{provider === "google" ? "G" : "GH"}</span>;
}

export function OAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const href = (provider: OAuthProvider) => `/api/auth/oauth/${provider}?next=${encodeURIComponent(next)}`;
  return <div className="grid w-full gap-3"><a href={href("google")} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-[#e9e9e1] shadow-[0_5px_14px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-[#c9f55a]/25 hover:bg-white/[0.07] hover:shadow-[0_9px_20px_rgba(0,0,0,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9f55a]/60 active:translate-y-0"><ProviderIcon provider="google" />Sign in with Google</a><a href={href("github")} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-[#e9e9e1] shadow-[0_5px_14px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-[#c9f55a]/25 hover:bg-white/[0.07] hover:shadow-[0_9px_20px_rgba(0,0,0,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9f55a]/60 active:translate-y-0"><ProviderIcon provider="github" />Sign in with GitHub</a></div>;
}
