import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

const port = await freePort();
const url = `http://127.0.0.1:${port}/`;
const vite = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  {
    stdio: "ignore",
    windowsHide: true,
  },
);

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (vite.exitCode !== null)
      throw new Error("O preview encerrou antes de abrir.");
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      /* O servidor ainda está iniciando. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("O preview não respondeu em seis segundos.");
}

let browser;

// Ordem I, O, T, S, Z, J: as duas últimas quedas limpam linhas consecutivas.
const comboMoves = [
  [0, 3],
  [0, 4],
  [0, 0],
  [0, -2],
  [1, -3],
  [0, 2],
];
async function playCombo(page, touch = false, delay = 0) {
  const input = async (action) => {
    if (touch) await page.locator(`[data-action="${action}"]`).tap();
    else
      await page.keyboard.press(
        { left: "KeyA", right: "KeyD", rotate: "KeyW", drop: "Space" }[action],
      );
  };
  for (const [turns, dx] of comboMoves) {
    for (let i = 0; i < turns; i++) await input("rotate");
    for (let i = 0; i < Math.abs(dx); i++)
      await input(dx < 0 ? "left" : "right");
    if (delay) await page.waitForTimeout(delay);
    await input("drop");
    if (delay) await page.waitForTimeout(delay);
  }
  assert.equal(
    await page.locator("#score").textContent(),
    "0250",
    "Bônus de combo não entrou no placar",
  );
  assert.equal(await page.locator("#combo").textContent(), "×2");
  assert.equal(await page.locator("#miniCombo").textContent(), "×2");
  assert.equal(await page.locator("#comboBonus").textContent(), "+50 EXTRA");
  assert.equal(
    await page.locator("#comboNoticeTitle").textContent(),
    "COMBO ×2",
  );
  await page.waitForFunction(() => {
    const notice = document.querySelector("#comboNotice");
    return (
      notice.classList.contains("is-visible") &&
      Number(getComputedStyle(notice).opacity) > 0.5
    );
  });
}

async function completeLine(page, touch = false) {
  const input = async (action) => {
    if (touch) await page.locator(`[data-action="${action}"]`).tap();
    else
      await page.keyboard.press(
        {
          left: "ArrowLeft",
          right: "ArrowRight",
          rotate: "ArrowUp",
          drop: "Space",
        }[action],
      );
  };
  // Sacola sem embaralhar: I + O + T + S fecham a base usando só controles reais.
  for (const [offset, rotate] of [
    [-3, false],
    [0, false],
    [3, false],
    [5, true],
  ]) {
    if (rotate) await input("rotate");
    for (let i = 0; i < Math.abs(offset); i++)
      await input(offset < 0 ? "left" : "right");
    await input("drop");
  }
  assert.equal(
    await page.locator("#score").textContent(),
    "0100",
    "Linha completa não pontuou",
  );
  assert.equal(
    await page.locator("#cleared").textContent(),
    "01",
    "Linha completa não foi contabilizada",
  );
  await page.waitForTimeout(650);
  const cleared = await page
    .locator("#gameCanvas")
    .evaluate((canvas) => [
      ...canvas.getContext("2d").getImageData(15, 585, 1, 1).data,
    ]);
  assert.deepEqual(cleared, [24, 23, 39, 255], "A linha cheia não desapareceu");
}

try {
  await waitForPreview();
  browser = await chromium.launch({ headless: true });
  const sizes = [
    [1920, 1080],
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [820, 900],
    [768, 900],
    [641, 900],
    [640, 900],
    [390, 844],
    [375, 812],
    [320, 568],
    [844, 390],
  ];
  if (process.env.UI_SCREENSHOTS === "1")
    await mkdir("docs/images", { recursive: true });

  for (const [width, height] of sizes) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await page.goto(url);
    const layout = await page.evaluate(() => {
      const bounds = (selector) => {
        const box = document.querySelector(selector).getBoundingClientRect();
        return {
          top: box.top,
          bottom: box.bottom,
          height: box.height,
          width: box.width,
          left: box.left,
          right: box.right,
        };
      };
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        cabinet: bounds(".cabinet"),
        board: bounds("#gameCanvas"),
        target: bounds(".target-panel"),
        targetCopy: bounds(".target-copy"),
        overlay: bounds(".overlay-card"),
        touch: bounds(".touch-controls"),
        next: bounds(
          window.innerWidth <= 900 ? "#mobileNextCanvas" : "#nextCanvas",
        ),
        second: bounds(
          window.innerWidth <= 900
            ? "#mobileSecondNextCanvas"
            : "#secondNextCanvas",
        ),
      };
    });
    assert.equal(layout.overflow, false, `${width}px: há rolagem horizontal`);
    assert.ok(
      layout.pageHeight <= height + 1,
      `${width}px: página maior que a janela`,
    );
    assert.ok(
      Math.abs(layout.board.height / layout.board.width - 2) < 0.025,
      `${width}px: proporção do tabuleiro distorcida`,
    );
    assert.ok(
      layout.board.top >= 0 && layout.board.bottom <= height,
      `${width}px: tabuleiro fora da janela`,
    );
    assert.deepEqual(errors, [], `${width}px: erro de JavaScript`);
    for (const preview of [layout.next, layout.second])
      assert.ok(
        preview.width > 30 &&
          preview.height > 15 &&
          preview.left >= 0 &&
          preview.right <= width &&
          preview.top >= 0 &&
          preview.bottom <= height,
        `${width}px: prévia da fila fora da janela`,
      );
    assert.ok(
      layout.targetCopy.bottom <= layout.target.bottom - 2,
      `${width}px: instrução escapa do painel`,
    );
    assert.ok(
      layout.overlay.top >= layout.board.top &&
        layout.overlay.bottom <= layout.board.bottom,
      `${width}px: abertura escapa do tabuleiro`,
    );
    if (width >= 1200)
      assert.ok(
        layout.cabinet.bottom <= height + 1,
        `${width}px: moldura fora da janela`,
      );
    if (width <= 900) {
      if (height > 430)
        assert.ok(
          layout.target.bottom < layout.board.top,
          `${width}px: alvo depois do tabuleiro`,
        );
      assert.ok(
        layout.touch.top >= 0 && layout.touch.bottom <= height + 1,
        `${width}px: controles fora da janela`,
      );
      assert.ok(
        layout.board.bottom <= layout.touch.top + 2,
        `${width}px: controles cobrem o tabuleiro`,
      );
    }
    if (
      process.env.UI_SCREENSHOTS === "1" &&
      [1440, 375, 320, 844].includes(width)
    ) {
      await page.screenshot({
        path: `docs/images/${{ 1440: "desktop", 375: "mobile", 320: "mobile-small", 844: "landscape" }[width]}.png`,
        fullPage: width === 1440,
      });
    }
    console.log(`✓ ${width} × ${height}: enquadramento e scripts`);
    await page.close();
  }

  const aliases = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const arrows = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  for (const page of [aliases, arrows]) {
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
    await page.goto(url);
    await page.locator("#overlayButton").click();
  }
  const boardImage = (page) =>
    page.locator("#gameCanvas").evaluate((canvas) => canvas.toDataURL());
  for (const [letter, arrow] of [
    ["KeyA", "ArrowLeft"],
    ["KeyD", "ArrowRight"],
    ["KeyW", "ArrowUp"],
    ["KeyS", "ArrowDown"],
  ]) {
    const before = await boardImage(aliases);
    await aliases.keyboard.press(letter);
    await arrows.keyboard.press(arrow);
    await aliases.waitForTimeout(35);
    assert.notEqual(
      await boardImage(aliases),
      before,
      `${letter} não alterou a peça`,
    );
    assert.equal(
      await boardImage(aliases),
      await boardImage(arrows),
      `${letter} difere de ${arrow}`,
    );
  }
  await aliases.close();
  await arrows.close();
  console.log("✓ W/A/S/D equivalentes às setas");

  const desktop = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await desktop.goto(url);
  await desktop.locator("#soundButton").click();
  await desktop.waitForFunction(
    () =>
      document.querySelector("#soundButton").getAttribute("aria-pressed") ===
      "true",
  );
  await desktop.locator("#soundButton").click();
  assert.equal(
    await desktop.locator("#soundButton").getAttribute("aria-pressed"),
    "false",
  );
  await desktop.locator("#fullscreenButton").click();
  await desktop.waitForFunction(() => document.fullscreenElement !== null);
  await desktop.locator("#fullscreenButton").click();
  await desktop.waitForFunction(() => document.fullscreenElement === null);
  await desktop.close();

  const reduced = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  await reduced.addInitScript(() => {
    Math.random = () => 0.999;
  });
  await reduced.goto(url);
  assert.equal(
    await reduced
      .locator(".progress-track span")
      .evaluate((node) => getComputedStyle(node).transitionDuration),
    "0s",
  );
  await reduced.locator("#overlayButton").click();
  await completeLine(reduced);
  assert.equal(
    await reduced
      .locator(".target-panel")
      .evaluate((node) => getComputedStyle(node).animationName),
    "none",
  );
  await reduced.reload();
  assert.equal(
    await reduced.locator("#highScore").textContent(),
    "0100",
    "Recorde não persistiu",
  );
  await reduced.close();
  console.log(
    "✓ limpeza por teclado, recorde, movimento reduzido, som opcional e tela cheia",
  );

  const session = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await session.addInitScript(() => {
    Math.random = () => 0;
  });
  await session.goto(url);
  const initialPreview = await session
    .locator("#nextCanvas")
    .evaluate((canvas) => canvas.toDataURL());
  const secondPreview = await session
    .locator("#secondNextCanvas")
    .evaluate((canvas) => canvas.toDataURL());
  await session.locator("#overlayButton").click();
  const pixel = () =>
    session
      .locator("#gameCanvas")
      .evaluate((canvas) => [
        ...canvas.getContext("2d").getImageData(135, 585, 1, 1).data,
      ]);
  const before = await pixel();
  await session.keyboard.press("Space");
  assert.notDeepEqual(await pixel(), before, "Espaço não soltou a peça");
  assert.equal(
    await session
      .locator("#nextCanvas")
      .evaluate((canvas) => canvas.toDataURL()),
    secondPreview,
    "A segunda peça não avançou na fila",
  );
  await session.locator("#helpButton").click();
  assert.equal(await session.locator("#stateTag").textContent(), "PAUSADO");
  await session.keyboard.press("Space");
  assert.equal(
    await session.locator("#stateTag").textContent(),
    "PAUSADO",
    "Ajuda deixou o teclado controlar a partida",
  );
  await session.keyboard.press("Escape");
  await session.locator("#overlayButton").click();
  await session.keyboard.press("KeyP");
  assert.equal(await session.locator("#stateTag").textContent(), "PAUSADO");
  await session.locator("#overlayButton").click();
  assert.equal(await session.locator("#stateTag").textContent(), "EM JOGO");
  for (
    let i = 0;
    i < 40 &&
    (await session.locator("#stateTag").textContent()) !== "GAME OVER";
    i++
  )
    await session.keyboard.press("Space");
  assert.equal(await session.locator("#stateTag").textContent(), "GAME OVER");
  await session.locator("#overlayButton").click();
  assert.equal(await session.locator("#stateTag").textContent(), "EM JOGO");
  assert.equal(await session.locator("#combo").textContent(), "—");
  assert.equal(
    await session
      .locator("#nextCanvas")
      .evaluate((canvas) => canvas.toDataURL()),
    initialPreview,
    "Reinício não renovou a fila",
  );
  await session.close();

  const mobile = await browser.newPage({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.addInitScript(() => {
    Math.random = () => 0;
  });
  await mobile.goto(url);
  await mobile.locator("#overlayButton").tap();
  const touchPixel = () =>
    mobile
      .locator("#gameCanvas")
      .evaluate((canvas) => [
        ...canvas.getContext("2d").getImageData(135, 585, 1, 1).data,
      ]);
  const touchBefore = await touchPixel();
  await mobile.locator('[data-action="drop"]').tap();
  assert.notDeepEqual(
    await touchPixel(),
    touchBefore,
    "Botão de toque não soltou a peça",
  );
  await mobile.close();
  console.log("✓ teclado, pausa, fim de jogo, reinício e toque");

  const touchLines = await browser.newPage({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  await touchLines.addInitScript(() => {
    Math.random = () => 0.999;
  });
  await touchLines.goto(url);
  await touchLines.locator("#overlayButton").tap();
  await completeLine(touchLines, true);
  await touchLines.locator("#mobilePauseButton").tap();
  assert.equal(await touchLines.locator("#stateTag").textContent(), "PAUSADO");
  await touchLines.close();
  console.log("✓ limpeza de linha e pausa pelo toque");

  for (const touch of [false, true]) {
    const page = await browser.newPage({
      viewport: touch
        ? { width: 375, height: 812 }
        : { width: 1280, height: 800 },
      isMobile: touch,
      hasTouch: touch,
    });
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
    await page.goto(url);
    if (touch) await page.locator("#overlayButton").tap();
    else await page.locator("#overlayButton").click();
    await playCombo(page, touch);
    if (process.env.UI_SCREENSHOTS === "1" && touch)
      await page.screenshot({ path: "docs/images/mobile-combo.png" });
    if (touch) await page.locator('[data-action="drop"]').tap();
    else await page.keyboard.press("Space");
    assert.equal(
      await page.locator("#combo").textContent(),
      "—",
      "Queda sem limpeza não encerrou o combo",
    );
    assert.equal(
      await page.locator("#score").textContent(),
      "0250",
      "Queda sem limpeza mudou a pontuação",
    );
    await page.close();
  }
  console.log("✓ combo ×2, bônus e encerramento por WASD e toque");

  if (process.env.UI_SCREENSHOTS === "1") {
    const showcase = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: "docs/images", size: { width: 1440, height: 900 } },
    });
    const page = await showcase.newPage();
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
    await page.goto(url);
    await page.waitForTimeout(1200);
    await page.locator("#overlayButton").click();
    // A captura usa comandos reais; nenhum estado de jogo é fabricado para o portfólio.
    await playCombo(page, false, 100);
    await page.waitForTimeout(150);
    await page.screenshot({ path: "docs/images/gameplay.png" });
    const video = page.video();
    await showcase.close();
    await video.saveAs("docs/images/gameplay.webm");
    await video.delete();
    console.log("✓ captura e vídeo de uma partida com comandos reais");
  }
} finally {
  await browser?.close();
  vite.kill();
}
