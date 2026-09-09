export type PlaybackState = "idle" | "playing" | "paused";

export interface PlaybackSnapshot {
  state: PlaybackState;
  generationId: string | null;
  currentTime: number;
  duration: number;
}

type AudioFactory = () => HTMLAudioElement | null;

export class AudioPlaybackController {
  private readonly audio: HTMLAudioElement | null;
  private generationId: string | null = null;
  private listeners = new Set<(snapshot: PlaybackSnapshot) => void>();

  constructor(createAudio: AudioFactory = () => (typeof window === "undefined" ? null : new Audio())) {
    this.audio = createAudio();
    if (!this.audio) return;
    this.audio.preload = "auto";
    this.audio.addEventListener("timeupdate", () => this.emit());
    this.audio.addEventListener("loadedmetadata", () => this.emit());
    this.audio.addEventListener("play", () => this.emit());
    this.audio.addEventListener("pause", () => this.emit());
    this.audio.addEventListener("ended", () => {
      this.stop();
    });
  }

  subscribe(listener: (snapshot: PlaybackSnapshot) => void) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async play(url: string, generationId: string): Promise<void> {
    if (!this.audio) return;
    this.stop();
    this.generationId = generationId;
    this.audio.src = url;
    await this.audio.play();
    this.emit();
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.emit();
  }

  stop(generationId?: string) {
    if (generationId && generationId !== this.generationId) return;
    if (!this.audio) {
      this.generationId = null;
      this.emit();
      return;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.removeAttribute("src");
    this.audio.load();
    this.generationId = null;
    this.emit();
  }

  accepts(generationId: string) {
    return generationId === this.generationId;
  }

  snapshot(): PlaybackSnapshot {
    return {
      state: this.generationId === null ? "idle" : this.audio?.paused ? "paused" : "playing",
      generationId: this.generationId,
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio && Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
    };
  }

  dispose() {
    this.stop();
    this.listeners.clear();
  }

  private emit() {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}