"use client";


function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4"><path fill="#4285F4" d="M21.35 12.22c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z" /><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.7Z" /><path fill="#FBBC05" d="M6.54 13.79A5.85 5.85 0 0 1 6.24 12c0-.62.11-1.23.3-1.79V7.69H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.06 1.03 4.31l3.24-2.52Z" /><path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z" /></svg>;
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M12 .7a11.3 11.3 0 0 0-3.58 22.02c.57.1.78-.25.78-.55v-2.13c-3.17.69-3.84-1.34-3.84-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.53-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.12 1.17a10.82 10.82 0 0 1 5.68 0c2.16-1.48 3.12-1.17 3.12-1.17.62 1.58.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.39-2.67 5.35-5.21 5.64.41.36.78 1.06.78 2.14v3.11c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" /></svg>;
}

export default function LoginPage() {
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

        <p className="text-sm leading-6 text-slate-600">Continue securely with your preferred provider.</p>
        <div className="mt-7 grid gap-3"><button type="button" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"><GoogleIcon />Sign in with Google</button><button type="button" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"><GithubIcon />Sign in with GitHub</button></div>
      </div>
    </main>
  );
}
