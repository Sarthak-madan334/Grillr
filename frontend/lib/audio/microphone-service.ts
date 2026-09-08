export type AudioChunkHandler = (data: Blob) => void;

export class MicrophoneService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private onDataAvailableCallback: AudioChunkHandler | null = null;

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
    this.onDataAvailableCallback = onDataAvailable;
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) this.onDataAvailableCallback?.(event.data);
    });
    this.mediaRecorder.start(100);
    return true;
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.addEventListener("stop", () => {
        this.mediaRecorder = null;
        this.onDataAvailableCallback = null;
      }, { once: true });
      this.mediaRecorder.stop();
    } else {
      this.onDataAvailableCallback = null;
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
