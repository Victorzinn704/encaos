# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation
1. **[2026-09-27] Validar o jogo sem navegador antes da inspeção visual**
   Do instead: executar `npm test`, `npm run format:check` e `npm run build`, depois `npm run test:ui` para teclado, toque, movimento reduzido e 12 dimensões.

2. **[2026-09-27] Testar o enquadramento de desktop e celular na janela real**
   Do instead: medir os retângulos de alvo, tabuleiro e comandos em 1440 × 900, 1280 × 800, 375 × 812 e 320 × 568; conferir as capturas antes de concluir.

## Domain Behavior Guardrails
1. **[2026-09-27] Preservar a mecânica de padrões 5 × 5**
   Do instead: conferir ocupação e espaços vazios em toda a janela; tratar `void` como vazio somente na comparação e limpar apenas a janela resolvida.

## User Directives
1. **[2026-09-27] Dar identidade visual e enquadramento ao jogo**
   Do instead: usar a identidade SYNTIL e a janela inteira; preservar proporção 1:2 do tabuleiro e comandos visíveis também em 320 × 568 e paisagem. Validar movimento antes de iniciar, além dos efeitos da partida.

2. **[2026-09-27] Manter Git e comentários legíveis em português**
   Do instead: usar commits com motivo claro em português e comentar decisões não óbvias, evitando narrar cada linha.
