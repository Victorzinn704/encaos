# Roadmap de melhorias

Critérios organizados pelo impacto na partida. A seção **Entregue** descreve somente o que foi implementado e verificado localmente.

## Entregue nesta revisão

| Melhoria | Evidência |
| --- | --- |
| Novo enquadramento, paleta e hierarquia | Capturas em `docs/images/` e medidas em `AUDITORIA.md` |
| Alvo e placar rápido antes do tabuleiro no celular | Teste de geometria em 390, 375 e 320 px |
| Controles de toque fixos e teclado | Teste de queda, pausa, retomada e reinício em Chromium |
| Feedback de nível e padrão resolvido | Indicador de progresso, mensagem de estado e animação com respeito a movimento reduzido |
| Regressão visual básica no CI | `npm run test:ui` antes da etapa de publicação |

## Próximas etapas

| Prioridade | Trabalho | Critério de aceite |
| --- | --- | --- |
| P0 | Medir a dificuldade real dos sete padrões | Registrar partidas de teste, taxa de acerto e tempo até o fim; ajustar peças ou padrões com base nesses dados |
| P0 | Explicar a mecânica durante a primeira partida | Uma pessoa nova consegue identificar alvo, bloco `void`, queda e pontuação sem consultar o README |
| P1 | Melhorar acesso por leitor de tela | Disponibilizar estado textual do tabuleiro e das peças, validar navegação só por teclado e checar contraste automaticamente |
| P1 | Testar em aparelhos reais | Confirmar toque, legibilidade e rolagem em pelo menos um celular pequeno, um celular grande e um tablet |
| P2 | Adicionar preferências opcionais | Som desligável e escolha de intensidade visual, com estado salvo localmente e respeito a movimento reduzido |
| Publicação | Confirmar a licença/origem do código recebido e criar o remoto | Repositório público com atribuição adequada, workflow verde e URL do Pages aberta e testada |

Cada etapa deve entrar em uma branch curta, com teste ou captura que comprove o critério de aceite e um commit em português que explique a mudança.
