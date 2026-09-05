import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
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

        <form className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                First name
              </label>
              <Input id="firstName" placeholder="Ari" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                Last name
              </label>
              <Input id="lastName" placeholder="Miller" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input id="password" type="password" placeholder="Create a strong password" />
          </div>

          <Button className="w-full" size="lg">
            Create account
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
