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
    <div className="landing-cta-row">
      <Link href="/signup" className="landing-button landing-button-primary">
        Create your free account <ArrowIcon />
      </Link>
      <Link href="/dashboard" className="landing-button landing-button-secondary">
        Explore Grillr
      </Link>
    </div>
  );
}
