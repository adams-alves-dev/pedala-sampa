# Post 2 — O design system

**Tema**: um design system pequeno e fechado, e o que a restrição resolve.
**Objetivo**: mostrar disciplina de frontend sem depender de nenhuma leitura estética do site.
**Imagem**: carrossel de 6 slides (`slides/post-2-slides.html`).

---

## Texto para colar

```
O design system do meu projeto tem 8 cores.

Oito. E a regra é que não entra uma nona.

Precisou de um tom que não existe? Deriva em oklch a partir de um dos 8 — não inventa um hex novo. É uma restrição chata de propósito, porque é ela que impede um sistema de virar uma paleta de 40 cores em três meses, com quatro cinzas quase iguais que ninguém sabe mais quando usar.

Outra decisão que mudou meu jeito de trabalhar: o design não chegou como Figma. Chegou como um design system em HTML e CSS — tokens, componentes e uma página de showcase, tudo funcionando no browser.

Com uma regra explícita junto: recriar fielmente em componentes Vue idiomáticos, sem copiar o HTML e o JS do protótipo para dentro do Nuxt.

Isso resolve o problema clássico do handoff. Não tem "mas no Figma o espaçamento era outro", porque a referência é executável — dá para abrir e inspecionar. E não tem protótipo virando código de produção por preguiça, porque portar é obrigatório.

O que o sistema define:

→ 8 cores core, mais tons derivados com papel semântico
→ Escala tipográfica fechada, de 11px a um clamp que chega a 80px
→ Espaçamento em base 4px
→ Dois raios de borda. Dois.
→ Duas sombras: a de placa, 4px 4px 0 sem blur nenhum, e a de painel, essa sim difusa

Os temas são a parte que mais me agrada, porque não são um tema escuro pregado em cima. Cada tema é só um override dos mesmos tokens. Trocar de Ciclovia para Noturno não passa por nenhum componente — passa por um bloco de variáveis CSS.

E o tema escuro troca os tiles do mapa junto. Interface escura com um mapa claro estourando no meio da tela é pior do que não ter tema escuro.

A parte que quase ninguém conta sobre design system: o handoff explorou 6 temas e 5 pareamentos de fonte. Foram para produção 2 temas e 1 par.

Também tinha um painel de tweaks para ajustar tokens ao vivo. Não foi.

Explorar seis e escolher dois não é desperdício — é como você descobre que dois bastam. O desperdício seria implementar os seis porque já estavam prontos.

Sistema pequeno não é sistema pobre. É sistema que alguém consegue seguir sem consultar documentação toda vez.

🔗 O site: https://pedalasampa.netlify.app
🔗 O código: https://github.com/adams-alves-dev/pedala-sampa

#designsystem #css #frontend #vuejs #nuxt
```

---

## Variante curta (~700 caracteres)

```
O design system do meu projeto tem 8 cores. E a regra é que não entra uma nona.

Precisou de um tom novo? Deriva em oklch a partir dos 8. É chato de propósito — é o que impede o sistema de virar uma paleta de 40 cores com quatro cinzas quase iguais.

Junto: escala tipográfica fechada, espaçamento base 4px, dois raios de borda, duas sombras.

E os temas são só override dos mesmos tokens. Trocar de claro para escuro não passa por nenhum componente — passa por um bloco de variáveis CSS.

O handoff explorou 6 temas. Foram para produção 2.

Sistema pequeno não é sistema pobre. É sistema que alguém consegue seguir sem consultar documentação toda vez.

#designsystem #css #frontend
```

---

## Carrossel — 6 slides

| # | Conteúdo |
|---|---|
| 1 | **Capa** — "Um design system de 8 cores. E a regra é que não entra uma nona." |
| 2 | **Os 8 tokens** — swatches com nome e hex + a regra do oklch |
| 3 | **O que mais o sistema fecha** — tipografia, espaçamento, raios, sombras |
| 4 | **Tema é override de token** — Ciclovia × Noturno (capturas reais), incluindo os tiles |
| 5 | **O corte** — 6 temas e 5 pares de fonte explorados; 2 temas e 1 par no ar |
| 6 | **Fecho** — "sistema pequeno não é sistema pobre" + links |

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| 8 tokens core | `design-system/colors_and_type.css` — asphalt `#1A120B`, concrete `#E8E0D0`, paper `#FFF8EE`, bike-green `#00796B`, sign-yellow `#FFB300`, alert-red `#E53935`, transit-blue `#1565C0`, border `#C8BFA8` |
| "Nunca invente cores/fontes fora destes tokens" | `design_handoff_pedala_sampa/README.md:29` |
| Derivar novos tons em oklch | `design-system/README.md:57` — *"New shades should be derived in oklch from the core palette"* |
| Handoff em HTML/CSS, não Figma | `docs/redesign/design_handoff_pedala_sampa/` — protótipo + `Design System.html` |
| Regra "recriar fielmente, não copiar o protótipo" | `docs/redesign/2026-06-02-handoff-implementation-spec.md` |
| Escala tipográfica 11px → clamp 80px | `colors_and_type.css:38-45` — `--text-xs` `0.6875rem` … `--text-3xl` `clamp(2.25rem, 8vw, 5rem)` |
| Espaçamento base 4px, dois raios | `README.md:65` — `--space-1`=4 … `--space-16`=64; `--radius-sm` 4px, `--radius-md` 6px |
| Duas sombras | `README.md:65` e `:194` — placa `4px 4px 0` **sem blur**; painel `0 18px 50px rgb(26 18 11 / 18%)` **com** blur |
| Tema = override de token | `design-system/themes.css` — cada tema é um bloco `[data-theme='…']` redefinindo as mesmas variáveis |
| Tema escuro troca os tiles | `components/map/MapTileLayer.vue`; **confirmado ao vivo**: o toggle troca a URL para `basemaps.cartocdn.com/dark_all/...` |
| 6 temas explorados, 2 em produção | `themes.css` — `asfalto`, `ciclovia`, `sol`, `metro`, `coral`, `noturno`; só Ciclovia e Noturno viraram light/dark no app |
| 5 pares de fonte, 1 em produção | `design-system/themes.css`; produção usa Archivo + Hanken Grotesk (`nuxt.config.ts`) |
| Painel de tweaks descartado | Decisão registrada no handoff: *"Painel de Tweaks: não vai para produção"* |

⚠️ **Precisão que vale manter**: a regra "sem blur" vale só para a **sombra de placa**. A sombra de
painel (`0 18px 50px`) é difusa de propósito. O texto do post já faz essa distinção — não
simplifique para "o sistema não usa blur", porque seria falso.
