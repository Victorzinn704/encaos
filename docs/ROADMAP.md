# Roadmap

## Implementado e validado localmente

- Interface anterior inspirada no InterpretaAI restaurada, com o nome SYNTIL e enquadramento na janela.
- 12 tamanhos de janela, incluindo celular pequeno e paisagem.
- Sete tetrominós em sacolas, limpeza simples e múltipla, descida da pilha e pontuação por linhas.
- Interpolação, feedback de queda e limpeza, com movimento reduzido.
- Som opcional, tela cheia e ajuda com as regras atualizadas.
- Teclado, toque, pausa, reinício e recorde local separado para o modo de linhas.
- Motor separado, testes, formatação e workflow de Pages.

## Próximos critérios de entrega

| Prioridade | Trabalho                         | Critério                                                                                                               |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P0         | Balanceamento e primeira partida | Sessões com jogadores registram compreensão das regras, acertos e tempo até o fim; ajustes baseados nessas observações |
| P1         | Acessibilidade da partida        | Estado do tabuleiro compreensível por leitor de tela; contraste e navegação validados                                  |
| P1         | Aparelhos e navegadores reais    | Confirmar toque, áreas seguras, áudio e enquadramento em celular pequeno, tablet, Safari e Firefox                     |
| P1         | Medir desempenho                 | Registrar tempo de quadros e memória durante uma sessão longa em aparelho de referência                                |
| P2         | Preferências persistentes        | Salvar som e intensidade de efeitos; permitir reduzir efeitos além da preferência do sistema                           |
| Publicação | Origem/licença e remoto          | Atribuição revisada, repositório criado, CI verde e URL do Pages validada                                              |

Cada melhoria deve ter branch, commit em português e evidência do critério de entrega.
