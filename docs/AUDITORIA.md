# Auditoria do SYNTIL

Data: 27/09/2026. Escopo: implementação local e build estático servido em Chromium.

## Correções desta revisão

O nome herdado do exercício foi substituído por SYNTIL. A moldura centralizada deu lugar a uma aplicação de **100dvh**, com barra de ações, missão, arena, desempenho e rodapé. No celular, alvo, placar rápido, tabuleiro e comandos cabem juntos na janela, incluindo 320 × 568; a solução anterior exigia rolagem nesse tamanho.

O visual usa azul e violeta sobre grafite, marca vetorial própria e tipografia do sistema. O ambiente tem partículas, aurora em CSS, órbitas e um emblema animado. Movimentos da peça são interpolados; quedas produzem trilha, partículas e feedback breve. O som opcional é sintetizado sem baixar arquivos.

## Verificação do enquadramento

O script lê `getBoundingClientRect()` e `scrollHeight`, verificando:

- ausência de rolagem horizontal e vertical da página;
- tabuleiro dentro da janela e proporção 1:2 preservada;
- comandos de toque visíveis, sem cobrir o tabuleiro;
- alvo acima do tabuleiro em retrato;
- ausência de erros de JavaScript/console durante a abertura.

Dimensões: **1920 × 1080, 1440 × 900, 1280 × 800, 1024 × 768, 820 × 900, 768 × 900, 641 × 900, 640 × 900, 390 × 844, 375 × 812, 320 × 568 e 844 × 390**. As duas últimas cobrem celular pequeno e paisagem.

[Captura desktop](images/desktop.png) · [Captura móvel](images/mobile.png) · [Partida real](images/gameplay.png) · [Vídeo](images/gameplay.webm)

## Fluxos e regras

Os cinco testes do motor cobrem colisão, rotação sem mutação, ocupação/vazio do padrão, limpeza da área, pontuação, nível e fim de jogo. A suíte de navegador cobre iniciar, soltar por teclado, abrir ajuda pausando, impedir comandos enquanto a ajuda está aberta, pausa manual, retomar, perder, reiniciar e soltar por toque.

Também confirma que o ambiente muda antes de iniciar; com `prefers-reduced-motion`, o fundo permanece estático e a animação CSS fica desligada. O painel do projeto abre e fecha, o botão de som alterna o estado e tela cheia entra e sai em Chromium. A gravação utiliza entradas de teclado reais, sem preencher artificialmente o tabuleiro.

## Qualidade e desempenho

```bash
npm test
npm run format:check
npm run build
npm run test:ui
npm audit --audit-level=moderate
```

Um único loop coordena o tempo. Partículas são limitadas, efeitos são descartados ao terminar e nós de áudio são desconectados. A interface não é atualizada inteira a cada quadro. Ao ocultar a aba, a partida pausa e o trabalho de desenho é suspenso; as animações CSS também pausam.

O tamanho do bundle é informado pelo build. Esses cuidados não comprovam uma taxa de quadros universal: não houve benchmark de GPU, bateria ou aparelhos móveis reais.

## Limites

- Dificuldade e distribuição de peças ainda dependem de testes com jogadores.
- Canvas tem rótulos e instruções, mas ainda não fornece uma representação completa da partida para leitores de tela.
- Web Audio e tela cheia dependem do suporte do navegador; áudio começa desligado e tela cheia trata falhas.
- A suíte utiliza Chromium; Firefox, Safari e aparelhos reais ainda estão no roadmap.
- Workflow de Pages preparado, sem remoto ou deploy público nesta revisão; origem/licença do exercício inicial ainda precisam ser confirmadas.
