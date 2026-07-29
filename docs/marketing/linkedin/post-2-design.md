# Post 2 — Design & frontend

**Tema**: design system próprio, dois temas, e um bug de CSS que levou duas tentativas erradas.
**Objetivo**: o post mais "frontend puro" da série. É o que melhor vende competência técnica de CSS.
**Imagem**: carrossel de 7 slides (`slides/post-2-slides.html`).

---

## Texto para colar

```
O redesign do meu projeto não começou num Figma. Começou num design system escrito em HTML e CSS — com uma regra explícita: recriar fielmente, sem copiar uma linha do protótipo para dentro do Nuxt.

A direção visual tem nome: wayfinding. Sinalização urbana.

Tinta asfalto sobre concreto. Verde de ciclovia para seleção. Amarelo de placa de trânsito para as ações principais. Superfícies anguladas, tipografia grotesca, nada de gradiente.

O sistema inteiro cabe em 8 cores. E a regra é dura: nenhum tom fora dessas 8. Precisou de uma variação? Deriva em oklch a partir do token, não inventa um hex novo. É isso que impede um design system de virar uma paleta de 40 cores em três meses.

Alguns detalhes que dão identidade:

→ Sombra dura, deslocada, sem blur nenhum. Parece placa impressa, não Material Design.
→ CTAs cortados em paralelogramo com clip-path.
→ Card com trilho verde de 5px na lateral.
→ Pin do mapa em teardrop numerado — o selecionado cresce e vira amarelo.

E dois temas: Ciclovia (claro) e Noturno (escuro). O Noturno não troca só as cores da interface — ele troca os tiles do mapa também. Interface escura com mapa claro estourando no meio da tela seria pior que não ter tema escuro.

Agora o bug.

O CTA amarelo tem clip-path, para virar paralelogramo. E o hover dele simplesmente não aparecia.

Descoberta: clip-path RECORTA o box-shadow. A sombra era desenhada e cortada no mesmo frame. Sobrava só o deslocamento de 2px, imperceptível.

Primeira correção: trocar box-shadow por filter: drop-shadow(), que é aplicado depois do recorte.

Isso também falhou. drop-shadow não renderiza em elemento com clip-path em alguns navegadores. De novo, só o movimento aparecia.

Solução final: parar de pedir sombra ao browser e construir a camada na mão. ::after é a face amarela, ::before é um bloco verde escondido atrás dela. No hover, a placa salta e o bloco desliza para fora. isolation: isolate escopa o z-index negativo.

Sem filter. Sem box-shadow recortado. Funciona em todo navegador.

A lição que fica: recorte e sombra vivem em estágios diferentes do pipeline de pintura. Quando você corta um elemento, você está cortando tudo que ele desenha — inclusive o que você queria que vazasse para fora dele.

Foram 7 commits para um estado de hover. Não me arrependo de nenhum.

🔗 O site: https://pedalasampa.netlify.app
🔗 O código: https://github.com/adams-alves-dev/pedala-sampa

#css #frontend #designsystem #vuejs #nuxt
```

---

## Variante curta (~700 caracteres)

```
Bug de CSS que me custou 7 commits:

Meu CTA amarelo é cortado em paralelogramo com clip-path. O hover dele não aparecia.

Motivo: clip-path RECORTA o box-shadow. A sombra era desenhada e cortada no mesmo frame.

Tentativa 1 — trocar por filter: drop-shadow(), aplicado depois do recorte. Falhou: drop-shadow não renderiza sobre clip-path em alguns navegadores.

Solução — parar de pedir sombra ao browser. ::after é a face amarela, ::before é um bloco verde atrás. No hover a placa salta e o bloco desliza.

Recorte e sombra vivem em estágios diferentes do pipeline de pintura. Ao cortar o elemento, você corta tudo que ele desenha.

#css #frontend #webdev
```

---

## Carrossel — 7 slides

| # | Conteúdo |
|---|---|
| 1 | **Capa** — "Um design system que parece placa de rua" + subtítulo "e o bug de CSS que me custou 7 commits" |
| 2 | **Os 8 tokens** — swatches com nome e hex |
| 3 | **Ciclovia × Noturno** — as duas capturas reais lado a lado, com destaque "os tiles do mapa também mudam" |
| 4 | **Anatomia do CTA** — o paralelogramo, o clip-path e a sombra dura sem blur |
| 5 | **O bug** — "clip-path recorta box-shadow" com diagrama antes/depois |
| 6 | **As duas tentativas** — drop-shadow falhou; pseudo-elementos funcionaram (com o CSS) |
| 7 | **Fecho** — a lição + links |

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| Direção "wayfinding / sinalização urbana" | `docs/redesign/design_handoff_pedala_sampa/README.md` |
| Regra "recriar fielmente, não copiar o protótipo" | Spec do handoff, `docs/redesign/2026-06-02-handoff-implementation-spec.md` |
| 8 tokens core | `design-system/colors_and_type.css` — asphalt `#1A120B`, concrete `#E8E0D0`, paper `#FFF8EE`, bike-green `#00796B`, sign-yellow `#FFB300`, alert-red `#E53935`, transit-blue `#1565C0`, border `#C8BFA8` |
| Tema Ciclovia | `design-system/themes.css` — asphalt `#11271C`, concrete `#DCE7DA`, paper `#F4F9F0`, green `#1F8A4C`, yellow `#F2B33A` |
| Derivar novos tons em oklch | Don'ts do `design-system/README.md` |
| Tiles trocam no tema escuro | `components/map/MapTileLayer.vue`; **confirmado ao vivo**: o toggle troca a URL para `basemaps.cartocdn.com/dark_all/...` |
| Archivo + Hanken Grotesk | `nuxt.config.ts` (Google Fonts) e `--font-display` / `--font-body` |
| clip-path recorta box-shadow | commit `26d9ebd` — *"clip-path RECORTA o box-shadow — a sombra do hover era desenhada e cortada na hora, sobrando só o deslocamento"* |
| drop-shadow também falhou | commit `c53177d` — *"filter: drop-shadow não renderiza em elemento com clip-path em alguns navegadores"* |
| Solução por pseudo-elementos | commit `c53177d` — `::after` face amarela, `::before` bloco verde, `isolation: isolate` |
| 7 commits | `1a54353`, `fe6569b`, `26d9ebd`, `d028842`, `ee14559`, `c53177d`, `a1b9184` |
