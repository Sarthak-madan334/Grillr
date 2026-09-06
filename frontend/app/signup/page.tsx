"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeSignupValues, validateSignupForm, type SignupFormErrors, type SignupFormValues } from "@/lib/auth";

const initialValues: SignupFormValues = { firstName: "", lastName: "", email: "", password: "" };

export default function SignupPage() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [message, setMessage] = useState("");
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeSignupValues(values);
    const nextErrors = validateSignupForm(normalized);
    setErrors(nextErrors);
    setMessage("");
    setConfirmationRequired(false);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: normalized.firstName,
          last_name: normalized.lastName,
          email: normalized.email,
          password: normalized.password,
        }),
      });
      const data = await response.json() as { error?: { message?: string }; requires_email_confirmation?: boolean };
      if (!response.ok) {
        setMessage(data.error?.message ?? "We could not create your account. Please try again.");
        return;
      }
      if (data.requires_email_confirmation) {
        setConfirmationRequired(true);
        setMessage("Check your inbox to confirm your email address before signing in.");
        setValues((current) => ({ ...current, password: "" }));
        return;
      }
      router.push("/onboarding");
    } catch {
      setMessage("We could not reach the authentication service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.05),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-12">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-base font-semibold text-white">
            G
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Grillr</p>
            <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
          </div>
        </div>

        {message ? (
          <div role={confirmationRequired ? "status" : "alert"} className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${confirmationRequired ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {message}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                First name
              </label>
              <Input id="firstName" placeholder="Ari" value={values.firstName} onChange={(event) => setValues({ ...values, firstName: event.target.value })} disabled={isSubmitting} aria-invalid={Boolean(errors.firstName)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                Last name
              </label>
              <Input id="lastName" placeholder="Miller" value={values.lastName} onChange={(event) => setValues({ ...values, lastName: event.target.value })} disabled={isSubmitting} aria-invalid={Boolean(errors.lastName)} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} disabled={isSubmitting} aria-invalid={Boolean(errors.email)} />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input id="password" type="password" placeholder="Create a strong password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} disabled={isSubmitting} aria-invalid={Boolean(errors.password)} />
          </div>

          <Button className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
