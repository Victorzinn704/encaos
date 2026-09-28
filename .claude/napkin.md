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
   Do instead: medir objetivo, tabuleiro, abertura e comandos em 1440 × 900, 1280 × 800, 375 × 812 e 320 × 568; conferir capturas e texto contido nos painéis.

## Domain Behavior Guardrails
1. **[2026-09-27] Limpar linhas como no Tetris**
   Do instead: usar sete peças de quatro blocos; remover todas as linhas completas ao travar a peça e descer as restantes. Validar limpeza simples e múltipla, pontuação e descida da pilha.

## User Directives
1. **[2026-09-27] Dar identidade visual e enquadramento ao jogo**
   Do instead: preservar a aparência anterior inspirada no InterpretaAI, com missão verde-lima, placar creme e cartões; manter o nome ENCAOS, proporção 1:2 e comandos dentro da janela. Não retornar à direção futurista rejeitada.

2. **[2026-09-27] Manter Git e comentários legíveis em português**
   Do instead: usar commits com motivo claro em português e comentar decisões não óbvias, evitando narrar cada linha.

3. **[2026-09-27] Oferecer controles sem setas, prévia dupla e combos**
   Do instead: manter W/A/S/D junto das setas, exibir as duas próximas peças também no celular e validar a ordem após travar. Combo cresce ao limpar linhas em peças consecutivas, dá 50 × (sequência − 1) × nível extra e termina ao travar sem limpar.
