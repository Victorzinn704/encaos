import "./style.css";
import { act, createGame, dropInterval, type Game } from "./game";
import { drawBoard, drawNext, drawPattern, patternNumber } from "./render";

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Elemento obrigatório ausente: ${id}`);
  return found as T;
}

const boardCanvas = element<HTMLCanvasElement>("gameCanvas");
const patternCanvas = element<HTMLCanvasElement>("patternCanvas");
const nextCanvas = element<HTMLCanvasElement>("nextCanvas");
const boardCtx = boardCanvas.getContext("2d");
const patternCtx = patternCanvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");
if (!boardCtx || !patternCtx || !nextCtx) throw new Error("Canvas 2D indisponível neste navegador.");

let game: Game = createGame();
let lastTime = 0;
let elapsed = 0;
let dirty = true;
let highScore = readHighScore();
let lastShownScore = 0;

function readHighScore(): number {
  try {
    const saved = Number(localStorage.getItem("stackOverflownHighScore"));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(): void {
  if (game.score <= highScore) return;
  highScore = game.score;
  try { localStorage.setItem("stackOverflownHighScore", String(highScore)); } catch { /* Jogo segue sem armazenamento local. */ }
}

function showOverlay(kicker: string, title: string, description: string, button: string): void {
  element("overlayKicker").textContent = kicker;
  element("overlayTitle").textContent = title;
  element("overlayText").textContent = description;
  element("overlayButton").firstChild!.textContent = `${button} `;
  element("overlay").classList.remove("hidden");
}

function render(): void {
  if (!dirty) return;
  dirty = false;
  drawBoard(boardCtx!, game);
  drawPattern(patternCtx!, game.target);
  drawNext(nextCtx!, game.next);
  element("score").textContent = String(game.score).padStart(4, "0");
  element("miniScore").textContent = String(game.score).padStart(4, "0");
  element("level").textContent = String(game.level).padStart(2, "0");
  element("miniLevel").textContent = String(game.level).padStart(2, "0");
  element("cleared").textContent = String(game.cleared).padStart(2, "0");
  element("highScore").textContent = String(highScore).padStart(4, "0");
  element("progressText").textContent = `${game.cleared % 5} / 5`;
  element<HTMLElement>("progressFill").style.width = `${(game.cleared % 5) * 20}%`;
  element("patternName").textContent = game.target.name;
  element("patternIndex").textContent = patternNumber(game.target);
  element("statusText").textContent = game.message;
  const labels = { ready: "AGUARDANDO", playing: "EM JOGO", paused: "PAUSADO", over: "GAME OVER" };
  element("stateTag").textContent = labels[game.phase];
  element("stateTag").className = `state-tag state-${game.phase}`;
  const pause = element<HTMLButtonElement>("pauseButton");
  pause.disabled = game.phase === "ready" || game.phase === "over";
  pause.innerHTML = game.phase === "paused" ? "Continuar <span>▶</span>" : "Pausar <span>⏸</span>";
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.disabled = game.phase !== "playing";
  });
  if (game.score > lastShownScore) {
    const cabinet = document.querySelector<HTMLElement>(".cabinet")!;
    cabinet.classList.remove("celebrate");
    void cabinet.offsetWidth;
    cabinet.classList.add("celebrate");
    window.setTimeout(() => cabinet.classList.remove("celebrate"), 650);
  }
  lastShownScore = game.score;
  if (game.phase === "over") {
    showOverlay("EXECUÇÃO ENCERRADA", "Stack overflow!", `Você fez ${game.score} pontos e resolveu ${game.cleared} padrões.`, "Jogar novamente");
  }
}

function startOrRestart(): void {
  if (game.phase === "over") game = createGame();
  game.phase = "playing";
  game.message = "Encaixe os blocos para completar o alvo.";
  element("overlay").classList.add("hidden");
  element<HTMLButtonElement>("overlayButton").blur();
  elapsed = 0;
  lastTime = 0;
  dirty = true;
  render();
}

function togglePause(): void {
  if (game.phase === "playing") {
    game.phase = "paused";
    game.message = "Jogo pausado.";
    showOverlay("TEMPO CONGELADO", "Pausa", "Seu tabuleiro está esperando. Continue quando quiser.", "Continuar");
  } else if (game.phase === "paused") {
    game.phase = "playing";
    game.message = "De volta ao jogo.";
    element("overlay").classList.add("hidden");
    element<HTMLButtonElement>("overlayButton").blur();
    lastTime = 0;
  }
  dirty = true;
  render();
}

function perform(action: "left" | "right" | "rotate" | "down" | "drop"): void {
  if (act(game, action)) {
    if (action === "down" || action === "drop") elapsed = 0;
    saveHighScore();
    dirty = true;
    render();
  }
}

const keys: Record<string, "left" | "right" | "rotate" | "down" | "drop"> = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rotate", ArrowDown: "down", Space: "drop",
};

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLButtonElement && (event.code === "Space" || event.code === "Enter")) return;
  if (event.code === "KeyP" || event.key.toLowerCase() === "p") {
    event.preventDefault(); togglePause(); return;
  }
  if ((event.code === "Enter" || event.code === "Space") && game.phase !== "playing") {
    event.preventDefault();
    if (game.phase === "paused") togglePause(); else startOrRestart();
    return;
  }
  const action = keys[event.code];
  if (action && game.phase === "playing") {
    event.preventDefault();
    perform(action);
  }
});

element("overlayButton").addEventListener("click", () => {
  if (game.phase === "paused") togglePause(); else startOrRestart();
});
element<HTMLButtonElement>("pauseButton").addEventListener("click", (event) => {
  togglePause();
  (event.currentTarget as HTMLButtonElement).blur();
});
document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    perform(button.dataset.action as "left" | "right" | "rotate" | "down" | "drop");
  });
  button.addEventListener("click", (event) => {
    if (event.detail === 0) perform(button.dataset.action as "left" | "right" | "rotate" | "down" | "drop");
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && game.phase === "playing") togglePause();
  lastTime = 0;
});

function loop(time: number): void {
  if (game.phase === "playing") {
    if (lastTime) elapsed += Math.min(time - lastTime, 100);
    if (elapsed >= dropInterval(game.level)) {
      elapsed = 0;
      perform("down");
    }
  }
  lastTime = time;
  requestAnimationFrame(loop);
}

render();
requestAnimationFrame(loop);
