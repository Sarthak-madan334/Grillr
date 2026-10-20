"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { ArrowIcon } from "@/components/landing/ArrowIcon";

export function HomeCTA() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="landing-cta-row"><Link href="/dashboard" className="landing-button landing-button-primary">Open your practice space <ArrowIcon /></Link></div>;
  }

  if (isAuthenticated) {
    return (
      <div className="landing-cta-row">
        <Link href="/interview/setup" className="landing-button landing-button-primary">
          Continue practicing <ArrowIcon />
        </Link>
        <Link href="/dashboard" className="landing-button landing-button-secondary">
          Your dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="landing-cta-row">
        <Link href="/signup" className="landing-button landing-button-primary">
          Create your account <ArrowIcon />
        </Link>
        <a href="#how-it-works" className="landing-button glass-button--ghost">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></svg>
          See how it works
        </a>
      </div>
      <Link href="/dashboard" className="hero-explore">Explore Grillr <span className="ml-2" aria-hidden="true">↗</span></Link>
    </>
  );
}
