# Decisões e referências

## Direção atual

A pedido do usuário, a interface recupera a revisão `ce7bb1d`, inspirada no InterpretaAI. O código dessa revisão é a referência direta para painéis, tipografia, cartões e ilustração. O enquadramento na janela permanece. O nome Encaos (encaixe + caos) foi escolhido pelo usuário para a publicação.

O jogo agora limpa linhas inteiras. A regra de padrões 5 × 5 foi substituída por sete tetrominós, sacola de peças, limpeza de linhas e descida da pilha. As instruções descrevem essa mecânica.

## Engenharia

- **Vite + TypeScript + Canvas 2D:** build estático para Pages, motor independente do navegador e desenho separado dos controles.
- **Interpolação independente:** a colisão usa posições inteiras; a animação aproxima a posição visual da lógica. Uma peça nova nasce diretamente no ponto correto.
- **Feedback contido:** fragmentos e faixas mostram a limpeza, com duração e quantidade limitadas. Movimento reduzido é respeitado no CSS e nos efeitos.
- **Evidência:** testes do motor e jogadas reais em Chromium verificam a limpeza. README, capturas e vídeo acompanham o código.

## Pesquisa da revisão anterior

Estas fontes foram consultadas em 27/09/2026 durante a direção visual posteriormente rejeitada. O fundo de aurora, as órbitas e o painel técnico daquela direção não fazem parte da interface atual.

- [Uiverse — botões animados](https://uiverse.io/ui/animated-buttons).
- [21st.dev — fundos animados](https://21st.dev/blog/react-animated-background-components).
- [21st.dev — componentes](https://21st.dev/community/components).
- [MDN — técnicas para jogos web](https://developer.mozilla.org/en-US/docs/Games/Techniques).
- [Princeton Tower Defense](https://github.com/Kevin-Liu-01/Princeton-Tower-Defense) e [Novastrike](https://github.com/enyagening/novastrike): referências de jogos em Canvas.

Não foram importados snippets dessas galerias. O exercício inicial foi fornecido pelo autor do projeto, sem URL ou licença informada. Nenhuma licença de redistribuição foi adicionada.
