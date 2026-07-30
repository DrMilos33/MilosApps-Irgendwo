import type { DaylightPhase } from "./domain/types";

type AudioContextConstructor = typeof AudioContext;

export class ProceduralAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;
  private phase: DaylightPhase = "day";

  get isEnabled(): boolean {
    return this.enabled;
  }

  setPhase(phase: DaylightPhase): void {
    this.phase = phase;
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(this.volumeForPhase(), this.context.currentTime, 0.6);
    }
  }

  async enable(): Promise<void> {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    if (!AudioCtor) throw new Error("Web Audio wird von diesem Browser nicht unterstützt.");

    if (!this.context) {
      this.context = new AudioCtor();
      this.buildGraph(this.context);
    }
    await this.context.resume();
    if (this.context.state !== "running") {
      throw new Error("Der Browser hat den Klang blockiert.");
    }
    this.enabled = true;
    this.master?.gain.setTargetAtTime(this.volumeForPhase(), this.context.currentTime, 0.3);
  }

  async disable(): Promise<void> {
    this.enabled = false;
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.12);
      await this.context.suspend();
    }
  }

  async onVisibilityChange(): Promise<void> {
    if (!this.context || !this.enabled) return;
    if (document.hidden) {
      await this.context.suspend();
    } else {
      await this.context.resume();
    }
  }

  private volumeForPhase(): number {
    return this.phase === "night" || this.phase === "polar-night" ? 0.025 : 0.018;
  }

  private buildGraph(context: AudioContext): void {
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.master = master;

    const lowTone = context.createOscillator();
    const lowGain = context.createGain();
    lowTone.type = "sine";
    lowTone.frequency.value = 110;
    lowGain.gain.value = 0.16;
    lowTone.connect(lowGain).connect(master);
    lowTone.start();

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    noise.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.8;
    noiseGain.gain.value = 0.11;
    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start();
  }
}
