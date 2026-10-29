import { Suspense } from "react";
import { InterviewSessionClient } from "./interview-session-client";

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={null}>
      <InterviewSessionClient />
    </Suspense>
  );
}
