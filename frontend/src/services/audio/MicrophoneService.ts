export class MicrophoneService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private onDataAvailableCallback: ((data: Blob) => void) | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied or error:', error);
      return false;
    }
  }

  startRecording(onDataAvailable: (data: Blob) => void) {
    if (!this.stream) {
      console.error('Microphone stream not available. Call requestPermission first.');
      return;
    }

    this.onDataAvailableCallback = onDataAvailable;
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.onDataAvailableCallback) {
        this.onDataAvailableCallback(event.data);
      }
    };

    this.mediaRecorder.start(100); // 100ms chunks
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    // Note: this doesn't release the microphone, just stops recording.
    // If we want to release it completely, we should stop the tracks in the stream.
  }

  releaseMicrophone() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export const microphoneService = new MicrophoneService();
