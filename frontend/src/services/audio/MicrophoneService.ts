export class MicrophoneService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private onDataAvailableCallback: ((data: Blob) => void) | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private detectionFrame: number | null = null;
  private speechActive = false;

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

  startVoiceDetection(onSpeechStart: () => void, onSpeechStop: () => void) {
    if (!this.stream) return;
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.audioContext.createMediaStreamSource(this.stream).connect(this.analyser);
    const samples = new Uint8Array(this.analyser.fftSize);
    let quietFrames = 0;

    const detect = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(samples);
      const level = samples.reduce((sum, value) => sum + Math.abs(value - 128), 0) / samples.length;
      if (level > 6) {
        quietFrames = 0;
        if (!this.speechActive) {
          this.speechActive = true;
          onSpeechStart();
        }
      } else if (this.speechActive && ++quietFrames > 12) {
        this.speechActive = false;
        quietFrames = 0;
        onSpeechStop();
      }
      this.detectionFrame = window.requestAnimationFrame(detect);
    };
    detect();
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    // Note: this doesn't release the microphone, just stops recording.
    // If we want to release it completely, we should stop the tracks in the stream.
  }

  releaseMicrophone() {
    if (this.detectionFrame !== null) window.cancelAnimationFrame(this.detectionFrame);
    this.detectionFrame = null;
    void this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
    this.speechActive = false;
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
