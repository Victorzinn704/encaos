import type { Piece } from "./game";
export const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");

// O fundo e os efeitos usam o relógio da partida, sem criar outros loops.
export class AmbientField {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dots = Array.from({ length: 38 }, () => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.006 + Math.random() * 0.012,
    size: 0.5 + Math.random() * 1.2,
  }));
  private drawn = false;
  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas do ambiente indisponível.");
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    motionPreference.addEventListener("change", () => {
      this.drawn = false;
    });
  }
  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const scale = Math.min(devicePixelRatio, 2);
    this.canvas.width = this.width * scale;
    this.canvas.height = this.height * scale;
    this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    this.drawn = false;
  }
  draw(dt: number): void {
    if (motionPreference.matches && this.drawn) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const dot of this.dots) {
      if (!motionPreference.matches)
        dot.y = (dot.y - (dot.speed * dt) / 1000 + 1) % 1;
      const x = dot.x * this.width,
        y = dot.y * this.height;
      this.ctx.fillStyle = "#8cb9f2";
      this.ctx.globalAlpha = 0.18 + dot.size * 0.15;
      this.ctx.beginPath();
      this.ctx.arc(x, y, dot.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 0.07;
      this.ctx.fillRect(x, y + 6, 0.6, 25);
    }
    this.ctx.globalAlpha = 1;
    this.drawn = true;
  }
}
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  total: number;
};
export class BoardEffects {
  private particles: Particle[] = [];
  private trail: {
    x: number;
    top: number;
    bottom: number;
    width: number;
    life: number;
  } | null = null;
  get active(): boolean {
    return this.particles.length > 0 || this.trail !== null;
  }
  reset(): void {
    this.particles = [];
    this.trail = null;
  }
  impact(piece: Piece, landingY: number): void {
    if (motionPreference.matches) return;
    this.trail = {
      x: piece.x * 30,
      top: piece.y * 30,
      bottom: (landingY + piece.cells.length) * 30,
      width: piece.cells[0]!.length * 30,
      life: 230,
    };
    this.burst(
      (piece.x + piece.cells[0]!.length / 2) * 30,
      (landingY + piece.cells.length) * 30 - 3,
      18,
    );
  }
  celebrate(): void {
    if (!motionPreference.matches) this.burst(150, 300, 45);
  }
  private burst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const life = 300 + Math.random() * 450;
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 160,
        vy: -30 - Math.random() * 160,
        life,
        total: life,
      });
    }
    // O limite mantém o custo previsível mesmo com quedas consecutivas.
    this.particles = this.particles.slice(-100);
  }
  draw(ctx: CanvasRenderingContext2D, dt: number): void {
    if (motionPreference.matches) {
      this.reset();
      return;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (this.trail) {
      const t = this.trail;
      t.life -= dt;
      const gradient = ctx.createLinearGradient(0, t.top, 0, t.bottom);
      gradient.addColorStop(0, "#9dd8ff00");
      gradient.addColorStop(1, "#9dd8ff60");
      ctx.fillStyle = gradient;
      ctx.globalAlpha = Math.max(0, t.life / 230);
      ctx.fillRect(t.x + 3, t.top, t.width - 6, t.bottom - t.top);
      if (t.life <= 0) this.trail = null;
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.x += (p.vx * dt) / 1000;
      p.y += (p.vy * dt) / 1000;
      p.vy += dt * 0.22;
      ctx.globalAlpha = Math.max(0, p.life / p.total);
      ctx.fillStyle = "#b4d9ff";
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    ctx.restore();
  }
}
