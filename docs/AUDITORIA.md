# Auditoria: linhas e interface restaurada

Data: 27/09/2026. Validação local em Chromium sobre o build estático.

## Correção das regras

A versão anterior só removia um desenho completo dentro de uma janela 5 × 5. Uma linha cheia não era eliminada. O motor agora usa sete peças de quatro blocos e limpa todas as linhas completas quando a peça trava.

As linhas acima descem juntas. Os espaços vazios dentro delas permanecem vazios; os blocos não caem individualmente. Limpar 1, 2, 3 ou 4 linhas vale 100, 300, 500 ou 800 pontos multiplicados pelo nível. Dez linhas avançam o nível. A sacola entrega os sete formatos sem repetição antes de renovar.

Objetivo, ajuda, contador, progresso e mensagens foram atualizados. O recorde por linhas tem uma chave própria; os registros do modo de padrões não são apagados.

## Restauração visual

HTML, estilos, cores dos blocos e favicon foram recuperados de `ce7bb1d`, a revisão anterior inspirada no InterpretaAI. Foram mantidos o nome SYNTIL e os ajustes de enquadramento na janela. Os painéis voltaram a ser verde-lima e creme, com a tipografia, cartões e ilustração de blocos anteriores.

A interface futurista e o fundo animado da revisão seguinte foram retirados. O feedback agora acompanha ações da partida: movimento das peças, queda e limpeza de linhas. [Desktop](images/desktop.png), [celular](images/mobile.png) e [vídeo com uma linha eliminada](images/gameplay.webm).

## Evidência das regras

Sete testes verificam:

- bordas, colisão e independência das linhas;
- rotação sem mutação e ajuste perto da parede;
- limpeza simultânea de linhas separadas e descida dos blocos acima;
- preservação de linhas incompletas e pontuação somente ao travar;
- quatro linhas eliminadas, pontuação e avanço de nível;
- sete formatos de quatro blocos sem repetição na sacola;
- fim de jogo e bloqueio de ações fora da partida.

O teste no navegador fecha uma linha com **I + O + T + S** usando comandos reais. Confere o contador, os 100 pontos e uma casa que estava ocupada e ficou vazia. Esse fluxo é executado por teclado e por toque. O vídeo registra a mesma jogada.

## Interface

Dimensões: **1920 × 1080, 1440 × 900, 1280 × 800, 1024 × 768, 820 × 900, 768 × 900, 641 × 900, 640 × 900, 390 × 844, 375 × 812, 320 × 568 e 844 × 390**.

O script verifica proporção 1:2, ausência de rolagem da página, tabuleiro e controles dentro da janela, instrução dentro do cartão e abertura dentro do tabuleiro. Também exercita ajuda e pausa, reinício, recorde após recarregar, som opcional, tela cheia e movimento reduzido.

```bash
npm test
npm run format:check
npm run build
npm run test:ui
```

## Limites

Os testes de navegador usam Chromium. Aparelhos reais, Safari, Firefox, consumo de bateria e uma representação completa do tabuleiro para leitores de tela ainda precisam de validação. O jogo não implementa todas as regras de competições de Tetris, como o sistema oficial de rotação, hold e contagem de T-spins.

O workflow de Pages está preparado. Não houve publicação pública nesta revisão; origem/licença do exercício inicial e remoto continuam pendentes.
