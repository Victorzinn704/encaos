# Auditoria: linhas, controles e combos

Data: 27/09/2026. Validação local em Chromium sobre o build estático.

## Correção das regras

A versão anterior só removia um desenho completo dentro de uma janela 5 × 5. Uma linha cheia não era eliminada. O motor agora usa sete peças de quatro blocos e limpa todas as linhas completas quando a peça trava.

As linhas acima descem juntas. Os espaços vazios dentro delas permanecem vazios; os blocos não caem individualmente. Limpar 1, 2, 3 ou 4 linhas vale 100, 300, 500 ou 800 pontos multiplicados pelo nível. Dez linhas avançam o nível. A sacola entrega os sete formatos sem repetição antes de renovar.

Objetivo, ajuda, contador, progresso e mensagens foram atualizados. O recorde por linhas tem uma chave própria; os registros do modo de padrões não são apagados.

## Controles, fila e combo

W/A/S/D equivalem a girar, mover à esquerda, descer e mover à direita. As setas continuam disponíveis. Segurar W não causa rotações repetidas, e atalhos com Ctrl, Alt ou Meta não são consumidos pelo jogo.

A fila guarda duas peças, mostradas em ordem no desktop e no celular. Ao travar, a primeira vira a peça atual, a segunda avança e uma nova peça entra no fim da fila.

O combo conta peças consecutivas que limpam linhas. A primeira limpeza inicia ×1 sem bônus; ×2 acrescenta 50 pontos × nível, ×3 acrescenta 100 × nível. Uma peça travada sem limpeza zera a sequência. Movimentos, rotação e pausa não a encerram. O bônus usa o nível anterior ao eventual avanço dessa mesma jogada.

O indicador aparece no placar e no placar móvel. Um aviso temporário e o som opcional acompanham o encaixe. A animação do aviso respeita movimento reduzido.

## Restauração visual

HTML, estilos, cores dos blocos e favicon foram recuperados de `ce7bb1d`, a revisão anterior inspirada no InterpretaAI. Os ajustes de enquadramento na janela foram preservados. O nome atual, Encaos, foi escolhido pelo usuário após essa restauração. Os painéis voltaram a ser verde-lima e creme, com a tipografia, cartões e ilustração de blocos anteriores.

A interface futurista e o fundo animado da revisão seguinte foram retirados. O feedback acompanha ações da partida: movimento das peças, queda e limpeza de linhas. [Desktop](images/desktop.png), [celular](images/mobile.png), [combo no celular](images/mobile-combo.png) e [vídeo com combo ×2](images/gameplay.webm).

## Evidência das regras

Dez testes verificam:

- bordas, colisão e independência das linhas;
- rotação sem mutação e ajuste perto da parede;
- limpeza simultânea de linhas separadas e descida dos blocos acima;
- preservação de linhas incompletas e pontuação somente ao travar;
- quatro linhas eliminadas, pontuação e avanço de nível;
- sete formatos de quatro blocos sem repetição na sacola;
- fim de jogo e bloqueio de ações fora da partida.
- ordem das duas prévias durante 14 peças, incluindo renovação da sacola;
- bônus, avanço e encerramento do combo, preservação durante movimentos e pausa;
- pontuação de combo na jogada que avança o nível.

O teste no navegador fecha uma linha com **I + O + T + S** usando comandos reais e verifica o contador, os 100 pontos e a casa que ficou vazia. Outro fluxo joga **I, O, T, S, Z e J**, com limpezas nas duas últimas quedas: o placar soma 250 pontos, o combo mostra ×2 e o bônus mostra +50. A queda seguinte sem limpeza encerra a sequência. Os dois fluxos rodam por teclado e por toque; o vídeo registra o combo sem fabricar estado do tabuleiro.

Uma comparação de imagens do tabuleiro confirma que W/A/S/D produzem os mesmos movimentos que as quatro setas. O teste também verifica que a segunda prévia avança para a primeira e que reiniciar renova a fila e zera o combo.

## Interface

Dimensões: **1920 × 1080, 1440 × 900, 1280 × 800, 1024 × 768, 820 × 900, 768 × 900, 641 × 900, 640 × 900, 390 × 844, 375 × 812, 320 × 568 e 844 × 390**.

O script verifica proporção 1:2, ausência de rolagem da página, tabuleiro, duas prévias e controles dentro da janela, instrução dentro do cartão e abertura dentro do tabuleiro. Também exercita ajuda e pausa, reinício, recorde após recarregar, som opcional, tela cheia e movimento reduzido.

```bash
npm test
npm run format:check
npm run build
npm run test:ui
```

## Limites

Os testes de navegador usam Chromium. Aparelhos reais, Safari, Firefox, consumo de bateria e uma representação completa do tabuleiro para leitores de tela ainda precisam de validação. O jogo não implementa todas as regras de competições de Tetris, como o sistema oficial de rotação, hold e contagem de T-spins.

O workflow de Pages executa estes testes antes do deploy. O repositório público e o endereço do jogo estão no README. A URL e a licença do exercício inicial não foram informadas; nenhuma licença de redistribuição foi adicionada.
