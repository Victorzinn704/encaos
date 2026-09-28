# SYNTIL

**Decifre o padrão. Encontre seu próximo movimento.**

Puzzle de precisão para navegador, desenvolvido a partir de um exercício de blocos e padrões de programação. A nova identidade combina _syntax_ e _tile_. SYNTIL é o nome escolhido para esta adaptação; a busca inicial não encontrou um jogo com esse nome, mas não constitui verificação de marca.

![Arena SYNTIL em desktop](docs/images/desktop.png)

[Ver a partida](docs/images/gameplay.png) · [Vídeo com animações](docs/images/gameplay.webm) · [Interface móvel](docs/images/mobile.png)

## O desafio

Reproduza o sinal alvo em qualquer janela **5 × 5** do tabuleiro. Cada padrão vale **100 pontos** e limpa somente a área resolvida. Cinco padrões avançam o nível. Blocos escuros ocupam espaço físico, mas contam como vazio na comparação; a sombra mostra onde a peça vai pousar.

| Controle | Ação               |
| -------- | ------------------ |
| ← / →    | Mover              |
| ↑        | Girar              |
| ↓        | Descer             |
| Espaço   | Queda imediata     |
| P        | Pausar / continuar |
| Enter    | Iniciar            |

No celular, os cinco botões ficam abaixo da arena, dentro da janela. A ajuda explica as regras sem perder a partida. O som é opcional e começa desligado.

## Engenharia demonstrada

- **Regras independentes do DOM:** colisão, rotação, encaixe, progressão e pontuação testáveis isoladamente.
- **Movimento separado da regra:** a posição lógica decide a colisão; interpolação visual e partículas oferecem feedback sem alterar o resultado.
- **Um relógio de animação:** `requestAnimationFrame` conduz gravidade, ambiente e efeitos. O DOM só é atualizado após ações; o relógio visível muda a cada segundo.
- **Efeitos com custo limitado:** 38 partículas no ambiente, no máximo 100 partículas de impacto, escala de pixels do fundo limitada a 2. O tabuleiro só é redesenhado durante ações, transições ou efeitos.
- **Preferências e foco:** movimento reduzido respeitado; aba oculta pausa a partida e o trabalho visual; abrir ajuda pausa o jogo; os diálogos usam foco e Escape nativos.
- **Entrega estática:** TypeScript + Vite compilam HTML/CSS/JS para Pages; Canvas 2D e Web Audio são APIs do navegador. Sem serviços, fontes remotas ou biblioteca visual em runtime.
- **Evidência reproduzível:** Vitest verifica o motor; Playwright exercita o build e o enquadramento em 12 tamanhos. CI inclui formatação, testes e build antes de publicar.

Esses são recursos verificáveis no código e nos testes. Taxa de quadros, consumo de bateria e dificuldade ainda precisam de medições em aparelhos e partidas reais.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run format:check
npm run build
npx playwright install chromium
npm run test:ui
```

Para atualizar capturas e vídeo, rode `npm run test:ui` com `UI_SCREENSHOTS=1`. Em PowerShell: `$env:UI_SCREENSHOTS='1'` antes do comando. Para formatar: `npm run format`.

## Organização

| Arquivo                            | Responsabilidade                                |
| ---------------------------------- | ----------------------------------------------- |
| `src/game.ts`                      | Motor e estado, sem navegador                   |
| `src/patterns.ts`                  | Os sete padrões do exercício original           |
| `src/render.ts`                    | Desenho do tabuleiro e prévias                  |
| `src/effects.ts`                   | Ambiente, trilhas e partículas                  |
| `src/audio.ts`                     | Síntese dos sons opcionais                      |
| `src/main.ts`                      | Comandos, foco, pausa e coordenação             |
| `src/style.css` / `src/motion.css` | Enquadramento e animações                       |
| `tests/game.test.ts`               | Testes das regras                               |
| `scripts/check-ui.mjs`             | Geometria, fluxos, movimento reduzido e captura |

[Auditoria](docs/AUDITORIA.md) · [Decisões e referências](docs/REFERENCIAS.md) · [Próximas etapas](docs/ROADMAP.md)

## Git e GitHub Pages

O histórico usa commits em português. Melhorias entram em branches curtas, por exemplo `feat/syntil-arena`, e são integradas à `main` com um merge que registra a entrega.

O repositório local ainda não tem remoto. A publicação pública depende da confirmação da origem/licença do código inicial recebido. Após essa revisão:

1. Crie um repositório vazio `syntil`.
2. Configure o remoto e envie:

   ```bash
   git remote add origin https://github.com/SEU-USUARIO/syntil.git
   git push -u origin main
   ```

3. Em **Settings → Pages**, selecione **GitHub Actions**.
4. O workflow publica `dist` após os testes. URL esperada: `https://SEU-USUARIO.github.io/syntil/`.

O build usa caminhos relativos para funcionar sob o caminho do repositório. Nenhum deploy público foi executado nesta revisão.
