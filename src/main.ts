import "./style.css";
import { act, createGame, dropInterval, ghostY, type Game } from "./game";
import { drawBoard, drawNext } from "./render";
import { BoardEffects, motionPreference } from "./effects";
import { GameAudio } from "./audio";

const elements = new Map<string, HTMLElement>();
function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = elements.get(id) ?? document.getElementById(id);
  if (!found) throw new Error(`Elemento obrigatório ausente: ${id}`);
  elements.set(id, found);
  return found as T;
}
function text(id: string, value: string): void {
  const node = element(id);
  if (node.textContent !== value) node.textContent = value;
}
function context(id: string): CanvasRenderingContext2D {
  const ctx = element<HTMLCanvasElement>(id).getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível neste navegador.");
  return ctx;
}
const boardCtx = context("gameCanvas"),
  nextCtx = context("nextCanvas"),
  secondNextCtx = context("secondNextCanvas"),
  mobileNextCtx = context("mobileNextCanvas"),
  mobileSecondNextCtx = context("mobileSecondNextCanvas");
const effects = new BoardEffects(),
  audio = new GameAudio();
const actionButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-action]"),
);
const dialogs = Array.from(
  document.querySelectorAll<HTMLDialogElement>("dialog"),
);
let game: Game = createGame();
let renderedNext: Game["next"] | undefined;
let visual = { ...game.current };
let lastTime = 0,
  elapsed = 0;
let highScore = readHighScore();
let celebrateTimer: number | undefined;
let comboTimer: number | undefined;

function readHighScore(): number {
  try {
    // Recupera o recorde do nome anterior quando ainda não há um registro do Encaos.
    const saved = Number(
      localStorage.getItem("encaos.lines.highScore") ??
        localStorage.getItem("syntil.lines.highScore"),
    );
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}
function saveHighScore(): void {
  if (game.score <= highScore) return;
  highScore = game.score;
  try {
    localStorage.setItem("encaos.lines.highScore", String(highScore));
  } catch {
    /* A partida segue sem armazenamento. */
  }
}
function showOverlay(
  kicker: string,
  title: string,
  description: string,
  button: string,
): void {
  element("overlayKicker").textContent = kicker;
  element("overlayTitle").textContent = title;
  element("overlayText").textContent = description;
  element("overlayButton").firstChild!.textContent = `${button} `;
  element("overlay").classList.remove("hidden");
}
function renderUI(): void {
  document.body.dataset.phase = game.phase;
  // A prévia muda só ao nascer uma peça, não a cada movimento.
  if (renderedNext !== game.next) {
    drawNext(nextCtx, game.next[0]);
    drawNext(secondNextCtx, game.next[1]);
    drawNext(mobileNextCtx, game.next[0]);
    drawNext(mobileSecondNextCtx, game.next[1]);
    renderedNext = game.next;
  }
  for (const id of ["score", "miniScore"])
    text(id, String(game.score).padStart(4, "0"));
  for (const id of ["level", "miniLevel"])
    text(id, String(game.level).padStart(2, "0"));
  text("cleared", String(game.cleared).padStart(2, "0"));
  text("highScore", String(highScore).padStart(4, "0"));
  text("combo", game.combo > 0 ? `×${game.combo}` : "—");
  text("miniCombo", game.combo > 0 ? `×${game.combo}` : "—");
  text(
    "comboBonus",
    game.comboBonus ? `+${game.comboBonus} EXTRA` : "LIMPE LINHAS SEGUIDAS",
  );
  element("comboStatus").classList.toggle("has-combo", game.combo > 1);
  text("progressText", `${game.cleared % 10} / 10`);
  element("progressFill").style.width = `${(game.cleared % 10) * 10}%`;
  text("statusText", game.message);
  const labels = {
    ready: "AGUARDANDO",
    playing: "EM JOGO",
    paused: "PAUSADO",
    over: "GAME OVER",
  };
  text("stateTag", labels[game.phase]);
  element("stateTag").className = `state-tag state-${game.phase}`;
  const pause = element<HTMLButtonElement>("pauseButton");
  pause.disabled = game.phase === "ready" || game.phase === "over";
  const pauseContent =
    game.phase === "paused"
      ? 'Continuar <span aria-hidden="true">▷</span>'
      : 'Pausar <span aria-hidden="true">Ⅱ</span>';
  if (pause.innerHTML !== pauseContent) pause.innerHTML = pauseContent;
  const mobilePause = element<HTMLButtonElement>("mobilePauseButton");
  mobilePause.disabled = pause.disabled;
  text("mobilePauseButton", game.phase === "paused" ? "Continuar" : "Pausar");
  actionButtons.forEach((button) => {
    button.disabled = game.phase !== "playing";
  });
  if (game.phase === "over")
    showOverlay(
      "PARTIDA ENCERRADA",
      "Chegou ao topo.",
      `Você fez ${game.score} pontos e limpou ${game.cleared} linhas.`,
      "Jogar novamente",
    );
  drawBoard(boardCtx, game, visual);
  if (game.phase !== "playing") hideComboNotice();
}
function startOrRestart(): void {
  if (game.phase === "over") {
    game = createGame();
    effects.reset();
  }
  hideComboNotice();
  game.phase = "playing";
  game.message = "Complete linhas de ponta a ponta.";
  visual = { ...game.current };
  element("overlay").classList.add("hidden");
  element<HTMLButtonElement>("overlayButton").blur();
  elapsed = 0;
  lastTime = 0;
  audio.play("start");
  renderUI();
}
function togglePause(): void {
  hideComboNotice();
  if (game.phase === "playing") {
    game.phase = "paused";
    game.message = "Jogo pausado.";
    showOverlay(
      "TEMPO CONGELADO",
      "Pausa",
      "Seu tabuleiro está esperando. Continue quando quiser.",
      "Continuar",
    );
  } else if (game.phase === "paused") {
    game.phase = "playing";
    game.message = "De volta à partida.";
    element("overlay").classList.add("hidden");
    element<HTMLButtonElement>("overlayButton").blur();
    lastTime = 0;
  }
  renderUI();
}
type Action = "left" | "right" | "rotate" | "down" | "drop";
function hideComboNotice(): void {
  clearTimeout(comboTimer);
  element("comboNotice").classList.remove("is-visible");
}
function showComboNotice(): void {
  const notice = element("comboNotice");
  const title =
    game.combo > 1
      ? `COMBO ×${game.combo}`
      : game.lastClear.length === 1
        ? "LINHA LIMPA!"
        : `${game.lastClear.length} LINHAS!`;
  text("comboNoticeTitle", title);
  text(
    "comboNoticeBonus",
    game.comboBonus ? `+${game.comboBonus} DE BÔNUS` : "BOM ENCAIXE",
  );
  hideComboNotice();
  void notice.offsetWidth;
  notice.classList.add("is-visible");
  comboTimer = window.setTimeout(
    () => notice.classList.remove("is-visible"),
    1100,
  );
}
function perform(action: Action, userAction = true): void {
  const previousPiece = game.current;
  const previous = { ...previousPiece },
    previousScore = game.score;
  const landing = action === "drop" ? ghostY(game) : previous.y;
  if (!act(game, action)) return;
  if (action === "down" || action === "drop") elapsed = 0;
  // Uma peça nova aparece no ponto real; somente deslocamentos da mesma peça são interpolados.
  if (game.current !== previousPiece) visual = { ...game.current };
  if (action === "drop") {
    effects.impact(previous, landing);
  }
  if (game.score > previousScore) {
    effects.clear(game.lastClear);
    audio.play(game.combo > 1 ? "combo" : "clear");
    if (game.phase === "playing") showComboNotice();
    document.querySelector(".cabinet")!.classList.add("celebrate");
    clearTimeout(celebrateTimer);
    celebrateTimer = window.setTimeout(
      () => document.querySelector(".cabinet")!.classList.remove("celebrate"),
      700,
    );
  } else if (game.phase === "over") audio.play("over");
  else if (userAction)
    audio.play(
      action === "drop" ? "drop" : action === "rotate" ? "rotate" : "move",
    );
  if (game.current !== previousPiece && !game.lastClear.length)
    hideComboNotice();
  saveHighScore();
  renderUI();
}
const keys: Record<string, Action> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "rotate",
  ArrowDown: "down",
  KeyA: "left",
  KeyD: "right",
  KeyW: "rotate",
  KeyS: "down",
  Space: "drop",
};
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // Segurar a tecla não deve disparar várias quedas, rotações ou trocas de pausa.
  if (
    event.repeat &&
    ["Space", "ArrowUp", "KeyW", "KeyP", "Enter"].includes(event.code)
  )
    return;
  if (
    dialogs.some((dialog) => dialog.open) ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  )
    return;
  if (
    event.target instanceof HTMLButtonElement &&
    (event.code === "Space" || event.code === "Enter")
  )
    return;
  if (event.code === "KeyP") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (
    (event.code === "Enter" || event.code === "Space") &&
    game.phase !== "playing"
  ) {
    event.preventDefault();
    if (game.phase === "paused") togglePause();
    else startOrRestart();
    return;
  }
  const action = keys[event.code];
  if (action && game.phase === "playing") {
    event.preventDefault();
    perform(action);
  }
});
element("overlayButton").addEventListener("click", () => {
  if (game.phase === "paused") togglePause();
  else startOrRestart();
});
element("pauseButton").addEventListener("click", (event) => {
  togglePause();
  (event.currentTarget as HTMLButtonElement).blur();
});
element("mobilePauseButton").addEventListener("click", (event) => {
  togglePause();
  (event.currentTarget as HTMLButtonElement).blur();
});
actionButtons.forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    perform(button.dataset.action as Action);
  });
  button.addEventListener("click", (event) => {
    if (event.detail === 0) perform(button.dataset.action as Action);
  });
});
element("helpButton").addEventListener("click", () => {
  if (game.phase === "playing") togglePause();
  element<HTMLDialogElement>("helpDialog").showModal();
});
dialogs.forEach((dialog) => {
  dialog
    .querySelector("[data-close-dialog]")!
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
});
element("soundButton").addEventListener("click", async () => {
  const enabled = await audio.toggle(),
    button = element<HTMLButtonElement>("soundButton");
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute("aria-label", enabled ? "Desativar som" : "Ativar som");
  button.blur();
});
element("fullscreenButton").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    element("statusText").textContent =
      "Tela cheia indisponível neste navegador.";
  }
  element<HTMLButtonElement>("fullscreenButton").blur();
});
document.addEventListener("fullscreenchange", () =>
  element("fullscreenButton").setAttribute(
    "aria-label",
    document.fullscreenElement ? "Sair da tela cheia" : "Entrar em tela cheia",
  ),
);
document.addEventListener("visibilitychange", () => {
  document.body.dataset.hidden = String(document.hidden);
  if (document.hidden && game.phase === "playing") togglePause();
  lastTime = 0;
});

function loop(time: number): void {
  const dt = lastTime ? Math.min(time - lastTime, 100) : 0;
  lastTime = time;
  if (!document.hidden) {
    if (game.phase === "playing") {
      elapsed += dt;
      if (elapsed >= dropInterval(game.level)) perform("down", false);
    }
    const moving =
      Math.abs(visual.x - game.current.x) +
        Math.abs(visual.y - game.current.y) >
      0.005;
    if (moving || effects.active) {
      const blend = motionPreference.matches ? 1 : 1 - Math.exp(-dt / 38);
      visual.x += (game.current.x - visual.x) * blend;
      visual.y += (game.current.y - visual.y) * blend;
      if (
        Math.abs(visual.x - game.current.x) +
          Math.abs(visual.y - game.current.y) <=
        0.005
      ) {
        visual.x = game.current.x;
        visual.y = game.current.y;
      }
      drawBoard(boardCtx, game, visual);
      effects.draw(boardCtx, dt);
    }
  }
  requestAnimationFrame(loop);
}
renderUI();
requestAnimationFrame(loop);
