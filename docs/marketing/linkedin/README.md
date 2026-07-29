# Série de posts para LinkedIn

Cinco posts temáticos sobre o Pedala Sampa. Ênfase **70% técnico / 30% produto** — o objetivo é
vitrine de engenharia frontend, com o produto servindo de prova de entrega.

Cada post se sustenta sozinho, mas juntos formam uma jornada: o problema → o design → a
arquitetura → a comunidade → o processo.

## A série

| # | Post | Gancho | Imagem |
|---|---|---|---|
| 1 | [O produto](post-1-produto.md) | "Descobrir qual grupo passa perto de você não existia em lugar nenhum" | 2 screenshots |
| 2 | [Design & frontend](post-2-design.md) | "clip-path recorta o box-shadow" — 7 commits para um hover | carrossel, 7 slides |
| 3 | [Arquitetura](post-3-arquitetura.md) | "Prerender é rápido. Também é uma foto congelada." | carrossel, 6 slides |
| 4 | [Comunidade & segurança](post-4-comunidade.md) | "Um formulário aberto na internet é um alvo" | carrossel, 7 slides |
| 5 | [Processo & entrega](post-5-processo.md) | "4 anos parado. 5 versões em 8 dias." | carrossel, 7 slides |

## Cadência sugerida

Um post por semana, terça ou quarta, entre 8h e 10h. Ordem 1 → 5.

Do post 2 em diante, abra referenciando o anterior ("no post passado falei do mapa; hoje…").
O post 5 fecha com o convite para contribuir.

## Estrutura de cada arquivo

1. **Texto para colar** — já quebrado em parágrafos curtos, sem markdown (o LinkedIn não renderiza).
2. **Variante curta** — versão enxuta, caso queira testar o formato.
3. **Imagens / carrossel** — o que cada slide mostra.
4. **Fontes** — o arquivo ou commit que sustenta cada afirmação técnica do post.

A seção de fontes existe porque **post com número errado sobre o próprio projeto é o pior
resultado possível**. Confira antes de publicar.

## Imagens

Os PNGs ficam em `exports/` e **não são versionados** (são ~9 MB). Para regerar:

```bash
cd docs/marketing/linkedin

# screenshots do site: capturados manualmente em produção,
# 1440×900 (desktop) e 390×844 (mobile), nos dois temas

# slides dos carrosséis — 1080×1350 (4:5), o formato que mais ocupa a tela no feed
for deck in 2:7 3:6 4:7 5:7; do
  post="${deck%%:*}"; count="${deck##*:}"
  for n in $(seq 1 "$count"); do
    google-chrome --headless --disable-gpu --hide-scrollbars \
      --window-size=1080,1350 --virtual-time-budget=8000 \
      --screenshot="exports/post-${post}-slide-$(printf '%02d' "$n").png" \
      "file://$PWD/slides/post-${post}-slides.html?slide=${n}"
  done
done
```

Os slides vivem em `slides/*.html` e usam `slides/_base.css`, cujos tokens vêm do design system
do próprio projeto (`docs/redesign/design_handoff_pedala_sampa/design-system/`), tema Ciclovia.
Assim o carrossel parece parte da marca, e não um template genérico.

Abrir um deck com `?slide=N` exibe só aquele slide, com a página em exatamente 1080×1350 — é o que
permite a captura em lote acima.

### Regras de layout dos slides

Herdadas do design system, e vale mantê-las ao editar:

- nenhuma cor fora dos 8 tokens (variações derivadas, não hex novo)
- sombra dura deslocada, **blur zero**
- CTA / destaque em paralelogramo via `clip-path`
- card com trilho verde de 5px
- sem gradiente, sem card pill, sem emoji como elemento de UI
- **corpo de texto nunca abaixo de 26px** — carrossel é lido no celular

### Verificação antes de exportar

Os dois checks que já pegaram problemas reais (uma célula com texto invisível e notas de rodapé a
2,7:1). Rode no console com o deck aberto:

```js
// 1) overflow: nenhum slide pode estourar os 1350px
document.querySelectorAll('.slide').forEach(s =>
  console.log(s.dataset.n, s.scrollHeight - s.clientHeight)
)
```

Para contraste, sirva a pasta (`python3 -m http.server`) e compare a cor de cada nó de texto com o
fundo efetivo — o alvo é **≥ 3:1**. O caso que escapa fácil: um card de fundo claro dentro de um
slide `.slide--dark` herda texto claro e some.

## Checklist de publicação

- [ ] Conferir os números do post na seção **Fontes** (contagem de commits e de grupos no mapa mudam)
- [ ] Colar no compositor do LinkedIn e ver onde cai o "…ver mais" — o gancho precisa estar **acima** do corte
- [ ] Conferir se os links abrem (site e repositório)
- [ ] Subir as imagens na ordem
- [ ] No carrossel, o LinkedIn pede PDF — juntar os PNGs na ordem antes de subir
- [ ] Responder comentários nas primeiras 2 horas (é o que a plataforma premia)
