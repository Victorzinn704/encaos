# Direção visual e decisões de engenharia

Pesquisa realizada em 27/09/2026. As referências orientaram decisões; os componentes visuais desta revisão foram escritos no projeto, sem importar snippets dessas galerias.

## Interface e movimento

- [Uiverse — botões animados](https://uiverse.io/ui/animated-buttons): inspiração para brilho em passagem, hover, pressão e foco do botão principal.
- [21st.dev — fundos animados e seus custos](https://21st.dev/blog/react-animated-background-components): referência para avaliar gradientes em CSS, efeitos contínuos e respeito a movimento reduzido. O SYNTIL combina uma aurora CSS com um campo pequeno de partículas.
- [21st.dev — biblioteca de componentes](https://21st.dev/community/components): exploração de profundidade, camadas e ritmo visual.
- Desk Imperial, consultado localmente: referência de aplicação que ocupa a janela, com painéis subordinados à área principal. Nenhum arquivo desse projeto foi alterado.

## Jogos de frontend

- [MDN — técnicas para desenvolvimento de jogos](https://developer.mozilla.org/en-US/docs/Games/Techniques): controles em diferentes dispositivos, áudio e técnicas de renderização para a web.
- [Princeton Tower Defense — código do projeto](https://github.com/Kevin-Liu-01/Princeton-Tower-Defense): referência de jogo em Canvas 2D com efeitos próprios.
- [Novastrike — código do projeto](https://github.com/enyagening/novastrike): referência de apresentação e feedback visual em jogo de navegador.

## Escolhas do SYNTIL

**Vite + TypeScript + Canvas 2D:** a mecânica cabe em uma grade pequena; o motor existente pode ser separado e testado sem adicionar uma árvore de componentes ao ciclo de jogo. O resultado é estático e adequado ao Pages. Esta é uma decisão para este escopo, não uma afirmação de que frameworks sejam lentos.

**Interpolação independente:** colisões usam posições inteiras. O desenho aproxima a posição visual da lógica com interpolação exponencial baseada no tempo. Uma nova peça aparece diretamente no ponto de nascimento, evitando atravessar o tabuleiro ao reiniciar.

**Efeitos limitados:** um único relógio coordena as animações; partículas têm duração e limite. As preferências de movimento reduzido são consultadas em CSS e JavaScript. Aba oculta interrompe o trabalho visual e pausa o jogo.

**Portfólio com evidência:** o painel “O projeto” apresenta decisões implementadas. README, capturas, vídeo, testes e auditoria permitem conferir o resultado. Não há promessa de aprovação por recrutadores; o objetivo é tornar a qualidade do trabalho inspecionável.

**Identidade e autoria:** SYNTIL combina _syntax_ e _tile_. Nome, marca e interface foram desenvolvidos nesta adaptação; a mecânica e os sete desenhos vêm do exercício fornecido. A busca inicial do nome não substitui pesquisa de marca. Origem/licença do código inicial permanecem pendentes para publicação pública.
