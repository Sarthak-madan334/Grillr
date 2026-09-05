import { VoiceInterviewPanel } from "@/components/live-interview/VoiceInterviewPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020817_60%)] px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <VoiceInterviewPanel />
      </div>
    </main>
  );
}
