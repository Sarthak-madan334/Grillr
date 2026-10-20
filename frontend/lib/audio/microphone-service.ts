export type AudioChunkHandler = (data: Blob) => void;

export class MicrophoneService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  async requestPermission(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      this.releaseMicrophone();
      return false;
    }
  }

  getStream() {
    return this.stream;
  }

  startRecording(onDataAvailable: AudioChunkHandler): boolean {
    if (!this.stream || typeof MediaRecorder === "undefined") return false;
    if (this.isRecording()) return false;
    const recorder = new MediaRecorder(this.stream);
    this.mediaRecorder = recorder;
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) onDataAvailable(event.data);
    });
    recorder.start(100);
    return true;
  }

  stopRecording(onStopped?: () => void) {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      const recorder = this.mediaRecorder;
      recorder.addEventListener("stop", () => {
        if (this.mediaRecorder === recorder) this.mediaRecorder = null;
        onStopped?.();
      }, { once: true });
      this.mediaRecorder.stop();
    } else {
      onStopped?.();
    }
  }

  releaseMicrophone() {
    this.stopRecording();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (!this.mediaRecorder?.state || this.mediaRecorder.state === "inactive") this.mediaRecorder = null;
  }

  isRecording() {
    return this.mediaRecorder?.state === "recording";
  }
}

export const microphoneService = new MicrophoneService();
