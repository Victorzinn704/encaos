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
const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  stdio: "ignore",
  windowsHide: true,
});

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (vite.exitCode !== null) throw new Error("O preview encerrou antes de abrir.");
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* O servidor ainda está iniciando. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("O preview não respondeu em seis segundos.");
}

let browser;

try {
  await waitForPreview();
  browser = await chromium.launch({ headless: true });
  const sizes = [[1440, 900], [1280, 800], [820, 900], [768, 900], [641, 900], [640, 900], [390, 844], [375, 812], [320, 568]];
  if (process.env.UI_SCREENSHOTS === "1") await mkdir("docs/images", { recursive: true });

  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto(url);
    const layout = await page.evaluate(() => {
      const bounds = (selector) => {
        const box = document.querySelector(selector).getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, height: box.height };
      };
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        cabinet: bounds(".cabinet"), board: bounds("#gameCanvas"),
        target: bounds(".target-panel"), touch: bounds(".touch-controls"),
      };
    });
    assert.equal(layout.overflow, false, `${width}px: há rolagem horizontal`);
    assert.deepEqual(errors, [], `${width}px: erro de JavaScript`);
    if (width >= 1200) assert.ok(layout.cabinet.bottom <= height + 1, `${width}px: moldura fora da janela`);
    if (width <= 640) {
      assert.ok(layout.target.bottom < layout.board.top, `${width}px: alvo depois do tabuleiro`);
      assert.ok(layout.touch.top >= 0 && layout.touch.bottom <= height + 1, `${width}px: controles fora da janela`);
      if (height >= 800) assert.ok(layout.board.bottom <= layout.touch.top + 2, `${width}px: controles cobrem o tabuleiro`);
      if (height < 650) {
        await page.evaluate(() => window.scrollTo(0, 180));
        const shortScreen = await page.evaluate(() => ({
          boardTop: document.querySelector("#gameCanvas").getBoundingClientRect().top,
          boardBottom: document.querySelector("#gameCanvas").getBoundingClientRect().bottom,
          dockTop: document.querySelector(".touch-controls").getBoundingClientRect().top,
        }));
        assert.ok(shortScreen.boardTop >= 0 && shortScreen.boardBottom <= shortScreen.dockTop, `${width}px: não é possível enquadrar o tabuleiro após rolar`);
      }
    }
    if (process.env.UI_SCREENSHOTS === "1" && (width === 1440 || width === 375)) {
      await page.screenshot({ path: `docs/images/${width === 1440 ? "desktop" : "mobile"}.png`, fullPage: width === 1440 });
    }
    console.log(`✓ ${width} × ${height}: enquadramento e scripts`);
    await page.close();
  }

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktop.addInitScript(() => { Math.random = () => 0; });
  await desktop.goto(url);
  await desktop.locator("#overlayButton").click();
  const pixel = () => desktop.locator("#gameCanvas").evaluate((canvas) => [...canvas.getContext("2d").getImageData(135, 585, 1, 1).data]);
  const before = await pixel();
  await desktop.keyboard.press("Space");
  assert.notDeepEqual(await pixel(), before, "Espaço não soltou a peça");
  await desktop.keyboard.press("KeyP");
  assert.equal(await desktop.locator("#stateTag").textContent(), "PAUSADO");
  await desktop.locator("#overlayButton").click();
  assert.equal(await desktop.locator("#stateTag").textContent(), "EM JOGO");
  for (let i = 0; i < 19; i++) await desktop.keyboard.press("Space");
  assert.equal(await desktop.locator("#stateTag").textContent(), "GAME OVER");
  await desktop.locator("#overlayButton").click();
  assert.equal(await desktop.locator("#stateTag").textContent(), "EM JOGO");
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await mobile.addInitScript(() => { Math.random = () => 0; });
  await mobile.goto(url);
  await mobile.locator("#overlayButton").tap();
  const touchPixel = () => mobile.locator("#gameCanvas").evaluate((canvas) => [...canvas.getContext("2d").getImageData(135, 585, 1, 1).data]);
  const touchBefore = await touchPixel();
  await mobile.locator('[data-action="drop"]').tap();
  assert.notDeepEqual(await touchPixel(), touchBefore, "Botão de toque não soltou a peça");
  await mobile.close();
  console.log("✓ teclado, pausa, fim de jogo, reinício e toque");
} finally {
  await browser?.close();
  vite.kill();
}
