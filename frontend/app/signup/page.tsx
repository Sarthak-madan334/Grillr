"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeSignupValues, validateSignupForm, type SignupFormErrors, type SignupFormValues } from "@/lib/auth";

const initialValues: SignupFormValues = { firstName: "", lastName: "", email: "", password: "" };

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4"><path fill="#4285F4" d="M21.35 12.22c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z" /><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.7Z" /><path fill="#FBBC05" d="M6.54 13.79A5.85 5.85 0 0 1 6.24 12c0-.62.11-1.23.3-1.79V7.69H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.06 1.03 4.31l3.24-2.52Z" /><path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z" /></svg>;
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M12 .7a11.3 11.3 0 0 0-3.58 22.02c.57.1.78-.25.78-.55v-2.13c-3.17.69-3.84-1.34-3.84-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.53-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.12 1.17a10.82 10.82 0 0 1 5.68 0c2.16-1.48 3.12-1.17 3.12-1.17.62 1.58.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.39-2.67 5.35-5.21 5.64.41.36.78 1.06.78 2.14v3.11c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" /></svg>;
}

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
    <main className="min-h-screen bg-white px-3 py-3 text-[#1d1d1f] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[30px] border border-[#d2d2d7] bg-white shadow-[0_28px_100px_rgba(0,0,0,0.1)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-[#2d241d] px-6 py-10 text-[#f9f5f1] sm:px-10 sm:py-12 lg:px-12 lg:py-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#cda67f]/20" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[#cda67f]/15" />
          <div className="relative flex h-full flex-col">
            <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#e9c8a6]"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cda67f]/40 bg-[#4a392d]"><svg viewBox="0 0 56 56" aria-label="Grillr logo" role="img" className="h-8 w-8"><defs><linearGradient id="signup-grillr-g-glow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f9f5f1" /><stop offset="100%" stopColor="#d6a97b" /></linearGradient></defs><rect x="4" y="4" width="48" height="48" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(205,166,127,0.35)" /><path d="M37 13.5c-4.1-3.2-9.4-4.2-14.5-3.2-7 1.4-12.7 7.2-13.8 14.3-1.2 8.4 3.4 16.3 11.2 18.8 5.8 1.8 12.1.7 16.5-3.2" fill="none" stroke="url(#signup-grillr-g-glow)" strokeLinecap="round" strokeWidth="4.3" /><path d="M30 28h11" stroke="url(#signup-grillr-g-glow)" strokeLinecap="round" strokeWidth="3.7" /><path d="M17 24v8M22 20v16M27 17v22" stroke="#d6a97b" strokeLinecap="round" strokeWidth="2.4" /><circle cx="39" cy="28" r="2.4" fill="#d6a97b" /></svg></span>GRILLR</Link>
            <div className="my-auto max-w-md py-8 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5a77d]">Interview practice, with a pulse</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Practice interviews that talk back.</h1>
              <p className="mt-4 max-w-sm text-base leading-7 text-[#d9c9bb]">Build the clarity, confidence, and composure to make your next answer count.</p>
              <ul className="mt-7 space-y-3">{["Real-time AI-generated follow-up questions", "Live speech analysis for pace and clarity", "Honest, structured feedback after each session", "Retry-based coaching that tracks improvement"].map((feature) => <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[#eee3d9]"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#cda67f] text-xs font-bold text-[#2d241d]">✓</span>{feature}</li>)}</ul>
            </div>
            <p className="text-xs text-[#aa9582]">A calmer way to get interview-ready.</p>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-12 sm:py-10 lg:px-14 lg:py-8">
          <div className="flex justify-end text-sm text-[#6e6e73]">Already a member?<Link href="/login" className="ml-1 font-semibold text-[#2563eb] hover:underline">Sign in</Link></div>
          <div className="mx-auto mt-6 max-w-md lg:mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Get started</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1f]">Create your account</h2>
            <p className="mt-2 text-sm leading-6 text-[#6e6e73]">Your next stronger answer starts here.</p>
            <div className="mt-5 grid gap-2"><button type="button" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white text-sm font-medium text-[#1d1d1f] transition hover:-translate-y-0.5 hover:bg-[#f5f5f7]"><GoogleIcon />Continue with Google</button><button type="button" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white text-sm font-medium text-[#1d1d1f] transition hover:-translate-y-0.5 hover:bg-[#f5f5f7]"><GithubIcon />Continue with GitHub</button></div>
            <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#6e6e73]"><span className="h-px flex-1 bg-[#d2d2d7]" />or<span className="h-px flex-1 bg-[#d2d2d7]" /></div>
            {message ? <div role={confirmationRequired ? "status" : "alert"} className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${confirmationRequired ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{message}</div> : null}
            <form className="space-y-3" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><label htmlFor="firstName" className="text-sm font-medium text-[#424245]">First name</label><Input className="py-2.5" id="firstName" placeholder="Ari" value={values.firstName} onChange={(event) => setValues((current) => ({ ...current, firstName: event.target.value }))} disabled={isSubmitting} aria-invalid={Boolean(errors.firstName)} /></div><div className="space-y-1.5"><label htmlFor="lastName" className="text-sm font-medium text-[#424245]">Last name</label><Input className="py-2.5" id="lastName" placeholder="Miller" value={values.lastName} onChange={(event) => setValues((current) => ({ ...current, lastName: event.target.value }))} disabled={isSubmitting} aria-invalid={Boolean(errors.lastName)} /></div></div><div className="space-y-1.5"><label htmlFor="email" className="text-sm font-medium text-[#424245]">Email</label><Input className="py-2.5" id="email" type="email" placeholder="you@example.com" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} disabled={isSubmitting} aria-invalid={Boolean(errors.email)} /></div><div className="space-y-1.5"><label htmlFor="password" className="text-sm font-medium text-[#424245]">Password</label><Input className="py-2.5" id="password" type="password" placeholder="Create a strong password" value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} disabled={isSubmitting} aria-invalid={Boolean(errors.password)} /></div><Button type="submit" className="w-full" size="md" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</Button></form>
          </div>
        </section>
      </div>
    </main>
  );
}
