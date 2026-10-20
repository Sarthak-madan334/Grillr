"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/landing/ArrowIcon";

export function HomeCTA() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
      .then((data) => {
        if (!active) return;
        setIsAuthenticated(Boolean(data.authenticated));
        setHasLoaded(true);
      })
      .catch(() => {
        if (active) setHasLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!hasLoaded) {
    return <div className="landing-cta-placeholder" aria-hidden="true" />;
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
