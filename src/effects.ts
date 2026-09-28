import type { Piece } from "./game";
export const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
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
  private flash: { rows: number[]; life: number } | null = null;
  get active(): boolean {
    return (
      this.particles.length > 0 || this.trail !== null || this.flash !== null
    );
  }
  reset(): void {
    this.particles = [];
    this.trail = null;
    this.flash = null;
  }
  impact(piece: Piece, landingY: number): void {
    if (motionPreference.matches) return;
    this.trail = {
      x: piece.x * 30,
      top: piece.y * 30,
      bottom: (landingY + piece.cells.length) * 30,
      width: piece.cells[0]!.length * 30,
      life: 180,
    };
    this.burst(
      (piece.x + piece.cells[0]!.length / 2) * 30,
      (landingY + piece.cells.length) * 30 - 3,
      12,
    );
  }
  clear(rows: number[]): void {
    if (motionPreference.matches) return;
    this.flash = { rows: [...rows], life: 240 };
    rows.forEach((y) => {
      for (let x = 0; x < 10; x++) this.burst(x * 30 + 15, y * 30 + 15, 3);
    });
  }
  private burst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const life = 220 + Math.random() * 280;
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 150,
        vy: -30 - Math.random() * 130,
        life,
        total: life,
      });
    }
    // O limite evita acumular efeitos quando várias linhas são limpas em sequência.
    this.particles = this.particles.slice(-100);
  }
  draw(ctx: CanvasRenderingContext2D, dt: number): void {
    if (motionPreference.matches) {
      this.reset();
      return;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (this.flash) {
      this.flash.life -= dt;
      ctx.fillStyle = "#d8ff45";
      ctx.globalAlpha = Math.max(0, this.flash.life / 240) * 0.45;
      this.flash.rows.forEach((row) => ctx.fillRect(0, row * 30, 300, 30));
      if (this.flash.life <= 0) this.flash = null;
    }
    if (this.trail) {
      const t = this.trail;
      t.life -= dt;
      const gradient = ctx.createLinearGradient(0, t.top, 0, t.bottom);
      gradient.addColorStop(0, "#d8ff4500");
      gradient.addColorStop(1, "#d8ff4530");
      ctx.fillStyle = gradient;
      ctx.globalAlpha = Math.max(0, t.life / 180);
      ctx.fillRect(t.x + 3, t.top, t.width - 6, t.bottom - t.top);
      if (t.life <= 0) this.trail = null;
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.x += (p.vx * dt) / 1000;
      p.y += (p.vy * dt) / 1000;
      p.vy += dt * 0.22;
      ctx.globalAlpha = Math.max(0, p.life / p.total);
      ctx.fillStyle = "#bea8ff";
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    ctx.restore();
  }
}
