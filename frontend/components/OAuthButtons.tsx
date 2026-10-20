import type { OAuthProvider } from "@/lib/oauth";

function ProviderIcon({ provider }: { provider: OAuthProvider }) {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center text-xs font-bold">{provider === "google" ? "G" : "GH"}</span>;
}

export function OAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const href = (provider: OAuthProvider) => `/api/auth/oauth/${provider}?next=${encodeURIComponent(next)}`;
  return <div className="grid w-full gap-3"><a href={href("google")} className="oauth-button glass-button glass-button--primary"><ProviderIcon provider="google" />Sign in with Google</a><a href={href("github")} className="oauth-button glass-button glass-button--secondary"><ProviderIcon provider="github" />Sign in with GitHub</a></div>;
}
