"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
    return <div className="mt-9 min-h-12 sm:mt-8" aria-hidden="true" />;
  }

  if (isAuthenticated) {
    return (
      <p className="mt-9 min-h-12 text-lg font-semibold text-[#201a17] sm:mt-8">
        Welcome back
      </p>
    );
  }

  return (
    <div className="mt-9 flex min-h-12 flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
      <Link href="/signup" className="w-full sm:w-auto">
        <Button className="w-full" size="lg">Create account</Button>
      </Link>
      <Link href="/dashboard" className="w-full sm:w-auto">
        <Button className="w-full" variant="secondary" size="lg">
          Explore dashboard
        </Button>
      </Link>
    </div>
  );
}
