# Auditoria técnica e visual

Data: 27/09/2026. Escopo: código local e interface renderizada em Chromium, antes e depois do redesenho.

## Diagnóstico inicial

O jogo funcionava, mas a organização da tela prejudicava a partida. O tabuleiro ficava isolado em uma coluna alta, enquanto alvo, pontuação e controles apareciam depois dele no celular. O visual usava cartões escuros de peso parecido, com pouca relação entre a ação principal e o feedback.

| Janela | Antes | Depois |
| --- | --- | --- |
| 1440 × 900 | Tabuleiro de 347 a 945 px; página com 1.215 px de altura | Tabuleiro de 163 a 759 px; moldura inteira de 50 a 851 px |
| 1280 × 800 | Tabuleiro de 347 a 945 px | Tabuleiro de 148 a 672 px; moldura inteira de 30 a 770 px |
| 375 × 812 | Alvo começava em 1.226 px; controles em 1.841 px | Alvo de 67 a 178 px; tabuleiro de 276 a 732 px; controles fixos de 741 a 804 px |
| 320 × 568 | Alvo começava em 1.116 px; controles em 1.733 px | Alvo de 67 a 178 px; controles fixos na janela; o tabuleiro completo aparece após uma rolagem curta |

Os valores foram lidos de `getBoundingClientRect()` e `scrollHeight` nas mesmas dimensões, com a aplicação servida localmente. A altura total da página móvel continua maior que a janela porque o placar detalhado e a legenda do teclado ficam abaixo da área de jogo. Isso mantém o alvo e os comandos essenciais perto do tabuleiro.

## Direção visual aplicada

- O jogo ocupa uma moldura única: missão e padrão à esquerda, tabuleiro ao centro, placar e próxima peça à direita.
- O lima e a moldura arredondada retomam a energia visual do ProjetoQR; o contraste entre painel de missão e ação principal vem da hierarquia observada no protótipo do InterpretaAI.
- O desenho próprio do jogo aparece nos blocos de marca, na peça decorativa, na prévia do alvo e no tabuleiro.
- O celular mostra alvo e placar rápido antes do tabuleiro, com comandos de toque fixos. Em 320 × 568 px, a página rola para permitir ver a base do tabuleiro sem perder os comandos.
- Os tipos usam fontes do sistema, sem requisições de fonte externa em tempo de execução.

## Validação executada

```bash
npm test
npm run build
npm run test:ui
npm audit --audit-level=moderate
```

Os testes de regras cobrem colisão, rotação, comparação do padrão, bloco `void`, pontuação, nível e fim de jogo. O teste de interface percorre nove tamanhos entre 320 × 568 e 1440 × 900 px, verifica ausência de rolagem horizontal e erros de console, confirma enquadramento nas janelas principais e exercita início, queda, pausa, retomada, fim, reinício e toque. As capturas finais estão em [desktop](images/desktop.png) e [celular](images/mobile.png).

## Limites da evidência

- A inspeção automatizada não substitui uma sessão com jogadores para medir clareza das regras e dificuldade dos padrões.
- O tabuleiro é desenhado em canvas; uma descrição textual completa de cada célula para leitores de tela ainda precisa ser projetada.
- O tamanho 320 × 568 px exige rolagem curta durante a partida; o dock permanece visível.
- O repositório está preparado para GitHub Pages, mas a publicação pública depende da confirmação da origem/licença do código inicial fornecido pelo usuário.
