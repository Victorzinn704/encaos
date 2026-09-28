# ENCAOS

**Organize a queda.**

[Jogar agora](https://victorzinn704.github.io/encaos/)

Jogo de blocos para navegador, com sete tetrominós e limpeza de linhas. A interface anterior inspirada no InterpretaAI foi restaurada: missão verde-lima, placar creme e cartões sobre um tabuleiro escuro. Encaos combina **encaixe + caos**.

![Arena ENCAOS em desktop](docs/images/desktop.png)

[Ver a partida](docs/images/gameplay.png) · [Vídeo com combo](docs/images/gameplay.webm) · [Interface móvel](docs/images/mobile.png)

## O desafio

Preencha as **dez casas de uma linha**. Ela desaparece e as linhas acima descem, preservando seus espaços vazios. A sombra mostra onde a peça vai pousar. Cada sacola entrega os sete formatos uma vez antes de renovar.

| Linhas limpas na mesma queda | Pontos × nível |
| ---------------------------- | -------------- |
| 1                            | 100            |
| 2                            | 300            |
| 3                            | 500            |
| 4                            | 800            |

Dez linhas limpas avançam o nível e aumentam a velocidade. O recorde é salvo no navegador. Ao jogar no mesmo endereço, o Encaos recupera o recorde do nome anterior; a mudança para outro domínio não transfere esse armazenamento.

**Combos:** limpar linhas em quedas consecutivas prolonga a sequência. A segunda limpeza dá **+50 × nível**, a terceira **+100 × nível**, e assim por diante. A primeira começa a sequência sem bônus. Uma peça que trava sem limpar linhas encerra o combo; mover, girar e pausar preservam a sequência. O bônus aparece no placar, no aviso da arena e no som opcional.

As **duas próximas peças** aparecem em ordem, tanto no desktop quanto no celular, e avançam quando a peça atual trava.

| Controle       | Ação               |
| -------------- | ------------------ |
| A / D ou ← / → | Mover              |
| W ou ↑         | Girar              |
| S ou ↓         | Descer             |
| Espaço         | Queda imediata     |
| P              | Pausar / continuar |
| Enter          | Iniciar            |

No celular, os cinco botões ficam abaixo da arena, dentro da janela. A ajuda explica as regras sem perder a partida. O som é opcional e começa desligado.

## Engenharia demonstrada

- **Regras independentes do DOM:** colisão, rotação, encaixe, progressão e pontuação testáveis isoladamente.
- **Fila e combos no motor:** a sequência de peças mantém duas prévias e respeita a sacola de sete formatos; o bônus é calculado com o nível da jogada que limpou as linhas.
- **Movimento separado da regra:** a posição lógica decide a colisão; interpolação visual e partículas oferecem feedback sem alterar o resultado.
- **Um relógio de animação:** `requestAnimationFrame` conduz gravidade, interpolação e efeitos. Textos são atualizados quando mudam; a prévia só é redesenhada ao trocar a próxima peça.
- **Feedback de limpeza:** faixas e fragmentos mostram as linhas eliminadas, com no máximo 100 partículas. O tabuleiro é redesenhado durante ações, transições ou efeitos.
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

| Arquivo                | Responsabilidade                                |
| ---------------------- | ----------------------------------------------- |
| `src/game.ts`          | Motor e estado, sem navegador                   |
| `src/render.ts`        | Desenho do tabuleiro e prévias                  |
| `src/effects.ts`       | Trilhas, limpeza de linhas e partículas         |
| `src/audio.ts`         | Síntese dos sons opcionais                      |
| `src/main.ts`          | Comandos, foco, pausa e coordenação             |
| `src/style.css`        | Interface restaurada, enquadramento e animações |
| `tests/game.test.ts`   | Testes das regras                               |
| `scripts/check-ui.mjs` | Geometria, fluxos, movimento reduzido e captura |

[Auditoria](docs/AUDITORIA.md) · [Decisões e referências](docs/REFERENCIAS.md) · [Próximas etapas](docs/ROADMAP.md)

## Git e GitHub Pages

O histórico usa commits em português. Melhorias entram em branches curtas, por exemplo `feat/wasd-fila-combos`, e são integradas à `main` com um merge que registra a entrega. A direção visual restaurada vem de `ce7bb1d`.

Repositório: [Victorzinn704/encaos](https://github.com/Victorzinn704/encaos).

Jogo: [victorzinn704.github.io/encaos](https://victorzinn704.github.io/encaos/).

Cada envio à `main` executa formatação, testes das regras, build e testes da interface antes do deploy. A publicação usa **GitHub Actions**, configurada em **Settings → Pages**. O build usa caminhos relativos para funcionar sob `/encaos/`.

## Origem e referências

O projeto começou a partir de um exercício de blocos fornecido pelo autor do projeto, com o título Stack Overflown. O motor e a interface foram remodelados no histórico deste repositório. A URL e a licença do exercício inicial não foram informadas; este repositório não declara uma licença de redistribuição. As referências visuais estão documentadas em [Decisões e referências](docs/REFERENCIAS.md).
