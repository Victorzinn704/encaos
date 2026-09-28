type Cue = "start" | "move" | "rotate" | "drop" | "clear" | "combo" | "over";
const tones: Record<Cue, number[]> = {
  start: [220, 330, 440],
  move: [180],
  rotate: [330, 440],
  drop: [120, 65],
  clear: [440, 554, 659, 880],
  combo: [523, 659, 784, 1046],
  over: [220, 165, 110],
};
// O contexto só é criado após uma ação explícita, com som desligado por padrão.
export class GameAudio {
  private context: AudioContext | null = null;
  enabled = false;
  async toggle(): Promise<boolean> {
    if (this.enabled) {
      this.enabled = false;
      return false;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.enabled = true;
      this.play("start");
    } catch {
      this.enabled = false;
    }
    return this.enabled;
  }
  play(cue: Cue): void {
    if (!this.enabled || !this.context || document.hidden) return;
    const ctx = this.context;
    tones[cue].forEach((frequency, i) => {
      const start = ctx.currentTime + i * 0.065,
        oscillator = ctx.createOscillator(),
        volume = ctx.createGain();
      oscillator.type = cue === "drop" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      volume.gain.setValueAtTime(0, start);
      volume.gain.linearRampToValueAtTime(0.045, start + 0.008);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      oscillator.connect(volume);
      volume.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.15);
      oscillator.onended = () => {
        oscillator.disconnect();
        volume.disconnect();
      };
    });
  }
}
