"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeLoginValues, validateLoginForm, type LoginFormErrors, type LoginFormValues } from "@/lib/auth";

const initialValues: LoginFormValues = { email: "", password: "" };

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeLoginValues(values);
    const nextErrors = validateLoginForm(normalized);
    setErrors(nextErrors);
    setMessage("");

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized.email, password: normalized.password }),
      });
      const data = (await response.json()) as { error?: { message?: string }; detail?: { message?: string } };

      if (!response.ok) {
        setMessage(data.error?.message ?? data.detail?.message ?? "Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("We could not reach the authentication service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

        <form className="space-y-5" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} disabled={isSubmitting} aria-invalid={Boolean(errors.email)} />
            {errors.email ? <p className="text-sm text-rose-600">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} disabled={isSubmitting} aria-invalid={Boolean(errors.password)} />
            {errors.password ? <p className="text-sm text-rose-600">{errors.password}</p> : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" />
              Remember me
            </label>
            <Link href="/" className="text-slate-700 hover:text-slate-950">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

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
