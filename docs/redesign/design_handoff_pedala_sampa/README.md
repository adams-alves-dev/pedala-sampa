# Handoff: Pedala Sampa — Redesign (Explorador de grupos de pedal)

## Overview
Pedala Sampa é um **mapa colaborativo dos grupos de pedal de São Paulo**. O usuário explora grupos num mapa + lista, filtra por região/dia/horário/nível/distância/ritmo, vê o detalhe de cada grupo (ponto de saída, agenda, contato) e pode sugerir grupos novos ou correções.

Este pacote documenta o **redesign** baseado na branch `redesign-nuxt3-spec` do repositório `adams-alves-dev/pedala-sampa`. A direção visual escolhida é **"sinalização urbana / wayfinding"**: tinta asfalto sobre concreto, verde de ciclovia para seleção, amarelo de placa para CTAs (paralelogramo + sombra dura sem blur), superfícies anguladas e dois pares de fonte grotescas.

A home adotada é a **abordagem "mapa-foco"**: mapa em tela cheia com barra de busca + botão de filtros flutuando no topo, gaveta de filtros, e carrossel de resultados na base (desktop) / bottom sheet arrastável (mobile).

## About the Design Files
Os arquivos deste bundle são **referências de design feitas em HTML/CSS/JS puro** (com Leaflet para o mapa) — protótipos que mostram a aparência e o comportamento pretendidos, **não código de produção para copiar diretamente**.

⚠️ **Importante sobre o stack:** o projeto real é **Nuxt 3 + Vue 3 + TypeScript** (veja a branch `redesign-nuxt3-spec` e o contrato em `docs/superpowers/specs/2026-05-25-pedala-sampa-nuxt3-redesign-design.md`). A tarefa é **recriar estes designs nos componentes Vue/Nuxt existentes**, seguindo os padrões já estabelecidos no repositório (composables, `lib/`, tipos em `types/group.ts`, etc.) — e **não** despejar o HTML dentro do projeto Nuxt.

O protótipo HTML é a fonte da verdade para **visual e comportamento**; o repositório Nuxt é o ambiente-alvo da implementação.

## Web vs. Mobile — leia isto primeiro
**Não existem duas versões separadas.** Web e mobile são o **mesmo arquivo responsivo** (`Pedala Sampa - Protótipo.html` + `proto.css`). O layout mobile ativa no breakpoint **`@media (max-width: 760px)`** dentro de `proto.css`. Implemente como **um conjunto de componentes responsivos**, não duas telas.

- `Pedala Sampa - Protótipo.html` = web **e** mobile (responsivo).
- O arquivo `Pedala Sampa - Mobile.html` (não incluído aqui) era apenas uma moldura de iPhone para revisão — **não** é um app à parte e não precisa ser implementado.

## Fidelity
**Alta fidelidade (hifi).** Cores, tipografia, espaçamento, ícones, estados e interações são finais. Recriar pixel-perfect usando os componentes/estilos do design system documentado abaixo. Os dados de grupos no protótipo são representativos (mock) — a fonte real de dados é o backend/CMS do projeto.

---

## Design System (fonte: `design-system/`)
Tokens canônicos vêm de `design-system/colors_and_type.css` (lifted de `assets/css/main.css` da branch). **Nunca invente cores/fontes fora destes tokens.**

### Color tokens (`:root` em `colors_and_type.css`)
Tema padrão = **Ciclovia** (claro). Há um **toggle claro/escuro** no header que alterna Ciclovia ↔ Noturno. Os temas são aplicados via atributo `[data-theme]` no `<html>` (ver `themes.css`).

**Paleta core (tema Asfalto / referência de papéis):**
| Token | Hex | Papel |
|---|---|---|
| `--color-asphalt` | `#1A120B` | tinta, superfícies escuras (header) |
| `--color-concrete` | `#E8E0D0` | fundo do app |
| `--color-paper` | `#FFF8EE` | cards, painéis |
| `--color-bike-green` | `#00796B` | acento primário, seleção |
| `--color-sign-yellow` | `#FFB300` | CTAs, destaque, focus ring |
| `--color-alert-red` | `#E53935` | erro, destrutivo |
| `--color-transit-blue` | `#1565C0` | links, info |
| `--color-border` | `#C8BFA8` | bordas concreto |

Derivados: `--color-asphalt-80/55/45` (texto mudo via rgba), `--color-green-dark`, `--color-green-tint`, `--color-yellow-tint`, `--color-paper-2` (campos afundados), `--color-concrete-dk` (divisores).

**Temas escolhidos pelo cliente (padrões a implementar):**
- **Ciclovia** (claro, padrão): asphalt `#11271C`, concrete `#DCE7DA`, paper `#F4F9F0`, green `#1F8A4C`, yellow `#F2B33A`, border `#BBCDB6`. Header bg `#11271C`.
- **Noturno** (escuro): asphalt(=tinta clara) `#F3EEE2`, concrete `#14130E`, paper `#211F18`, green `#2FCB7E`, yellow `#FFC83D`, border `#3A3730`, header bg `#0E0D09`. Também troca os tiles do mapa para a variante escura.

> Os outros 4 temas (Asfalto, Pôr do Sol, Metrô SP, Coral & Teal) existem em `themes.css` como opções de Tweak, mas **só Ciclovia + Noturno são requisito**. Os seletores de tema/fonte do painel de Tweaks são ferramenta de exploração — **não precisam ir para produção**, exceto o toggle claro/escuro.

### Typography
- **Display:** `Archivo` (600/700/800) — títulos, nomes de grupos, marca. Variável `--font-display`.
- **Body/UI:** `Hanken Grotesk` (400/600/800) — texto, labels, dados (`font-variant-numeric: tabular-nums`). Variável `--font-body`.
- Par escolhido = **"Sinal"** (Archivo + Hanken Grotesk). É o padrão.
- Carregar via Google Fonts. Demais pares em `themes.css` são opcionais.

**Escala de tipo** (`--text-xs` 11px → `--text-3xl` clamp até 80px): xs .6875rem, sm .75rem, base .875rem, md 1rem, lg 1.25rem, xl 1.75rem, 2xl clamp(2rem,6vw,3.5rem), 3xl clamp(2.25rem,8vw,5rem).

Classes semânticas: `.ps-h1/.ps-h2/.ps-h3`, `.ps-lead`, `.ps-body`, `.ps-eyebrow`, `.ps-label`, `.ps-data`.

### Spacing & radius
Base 4px: `--space-1`=4 … `--space-16`=64 (1,2,3,4,5,6,8,10,12,16). Raios: `--radius-sm` 4px, `--radius-md` 6px. **Sombra de placa:** `--shadow-hard: 4px 4px 0 var(--color-asphalt)` (sem blur). Sombra de painel: `--shadow-panel: 0 18px 50px rgb(26 18 11 / 18%)`.

### Motion
`--ease-out: cubic-bezier(.16,1,.3,1)`, `--ease-in-out: cubic-bezier(.65,0,.35,1)`. Durações: fast 150ms, normal 250ms, slow 400ms.

### Componentes (classes `ps-*` em `components.css`)
- `.ps-header` — barra asfalto, canto inferior-direito cortado (clip-path); usa `--header-bg`/`--header-fg`.
- `.ps-cta` — CTA amarelo em **parelelogramo** (clip-path) + hover com `--shadow-hard`. Ação primária "Sugerir grupo".
- `.ps-btn` (+ `--solid`, `--ghost`, `--sm`, `--block`) — botões secundários.
- `.ps-card` (+ `--selected`) — card de grupo com **trilho de acento** de 5px (vira verde no hover/seleção).
- `.ps-chip` (+ `--active`, `--count`) — chips de filtro e contador de resultados.
- `.ps-badge` dentro de `.ps-badges` — metadados Dia/Saída/Nível/Distância/Ritmo, cada um com ícone à esquerda (`.ps-badge__ic`).
- `.ps-pin` (+ `--selected`) — marcador teardrop numerado; selecionado cresce e fica amarelo.
- `.ps-search`, `.ps-input`, `.ps-select`, `.ps-fieldlabel` — formulários.
- `.ps-quickview` — card de prévia flutuante (só desktop).
- Focus ring: `outline: 3px solid var(--color-sign-yellow)`.

### Ícones (`proto-icons.js`)
Conjunto de linha próprio, 24×24, traço 1.75, `currentColor`, round caps. API: `PS.icon(name, {size})`. Mapa de badge→ícone em `PS.BADGE_ICON`: Dia→calendar, Saída→clock, Nível→gauge, Distância→route, Ritmo→speed, Volta média→compass. Outros: search, sliders, pin, bike, chat, pencil, users, layers, plus, x, check, chevronRight, sun, moon, etc. **Recomendação para Vue:** recriar como componentes de ícone ou usar uma lib equivalente (ex.: lucide-vue) com os mesmos nomes/peso visual.

---

## Screens / Views

### 1. Home — Explorador (rota `/`)
**Propósito:** explorar e filtrar grupos num mapa + lista.

**Layout DESKTOP (>760px):**
- `header.ps-header` fixo no topo (72px): marca (logo `brand-logo.svg` ~38×44 + "Pedala Sampa" + badge "mapa colaborativo"), nav (Mapa / Sobre), **toggle redondo claro/escuro**, CTA "Sugerir grupo", e burger (escondido no desktop).
- Abaixo, **mapa Leaflet em tela cheia** (`#map`, `position:absolute; inset:0`).
- **Toolbar flutuante** no topo (z 500): `.ps-search` (flex 0 1 420px) + botão `.ps-btn--solid.filters-btn` com pílula de contagem de filtros ativos.
- **Carrossel de resultados** na base (z 500): linha com seta circular ‹, trilho com scroll-snap horizontal de `.ps-card` (flex 0 0 320px), seta ›. Setas desabilitam nas pontas (`:disabled` opacidade .3).
- **Prévia flutuante** (`#qv`, bottom-right, z 600): aparece ao selecionar um grupo. Ver "Quick view" abaixo.

**Layout MOBILE (≤760px):**
- Header com burger visível (abre dropdown Mapa/Sobre/Sugerir) + toggle claro/escuro; nav desktop e CTA escondidos.
- Toolbar só com a busca (botão Filtros escondido aqui — fica no sheet).
- Mapa em tela cheia.
- **Bottom sheet** (`#sheet`) — ver "Bottom sheet" abaixo. Carrossel e prévia flutuante escondidos (`display:none`).

### 2. Filtros (gaveta / drawer)
Acionado por "Filtros" (desktop: toolbar; mobile: botão no header do sheet). 
- Desktop: gaveta à esquerda 348px deslizando de `translateX(-104%)` → 0; scrim escurece o resto.
- Mobile: gaveta **full-width**.
- Conteúdo: grupos de filtro renderizados como **chips** (`.ps-chip`, ativo = verde). Campos: **Dia da semana** (Seg–Dom), **Nível** (Leve/Moderado/Forte), **Distância** (Até 20 km / 20 a 40 km / Acima de 40 km), **Período** (Manhã/Tarde/Noite), **Ritmo** (Leve/Moderado/Forte).
- Rodapé: "Limpar" (`.ps-btn--ghost`) + "Ver N grupos" (`.ps-cta`, fecha a gaveta).
- Filtragem é **client-side e ao vivo** — atualizar resultados/markers/contagem a cada mudança.

### 3. Quick view — prévia do grupo (SÓ DESKTOP)
Card `.ps-quickview` flutuante (bottom-right) ao clicar num card/pino:
- Botão "Fechar ✕" (canto), nome (display), local (com ícone pin), `.ps-badges`, linha "Tempo médio da volta: HHh:MMm" (com ícone compass), e ações: "Página completa →" (`.ps-btn--solid`), contato externo (`.ps-btn`, se houver link), "Sugerir correção" (`.ps-cta`).
- **No mobile esta prévia NÃO existe** (ver comportamento mobile).

### 4. Bottom sheet (SÓ MOBILE)
`#sheet` com 3 estados de encaixe via atributo `data-snap`:
- `peek` — `translateY(calc(100% - 132px))` (mostra alça + cabeçalho).
- `half` — `translateY(45%)`.
- `full` — `translateY(0)` (altura 88vh).
- **Alça arrastável** (`.sheet__grab`): drag com pointer events encaixa no estado mais próximo ao soltar; tap cicla peek→half→full→peek. Suporta teclado (Enter/Espaço).
- Cabeçalho: chip de contagem "N grupos" + botão "Filtros" (abre a gaveta full-width) + linha de **chips rápidos** com scroll horizontal (Nível/Período/Distância).
- Corpo: lista de `.ps-card` (rolável). Estado vazio mostra `.sheet__empty` com ícone + "Limpar filtros".

### 5. Página do grupo (rota `/grupo/[slug]`)
Documento rolável (`.doc`), `max-width 1040px`:
- Back link "‹ Voltar ao mapa".
- Cabeçalho: pin selecionado (com ícone bike) + `h1` nome.
- `.ps-badges` (Dia/Saída/Nível/Distância/Ritmo).
- Grid 2 colunas (1 col no mobile):
  - **Coluna esquerda:** seção "Agenda" (grid 2×3 de `.meta-cell`: Dia & saída, Ponto de saída, Distância, Ritmo médio, Nível, Volta média) + seção "Contato & contribuição" (botão de contato externo se houver + CTA "Sugerir correção neste grupo").
  - **Coluna direita:** mini-mapa Leaflet (`#groupMapEl`, 320px / 220px mobile) centrado no ponto de saída + endereço.
- **SEO:** página compartilhável e indexável — title/description dinâmicos por grupo (requisito da spec).

### 6. Página Sobre (rota `/sobre`)
Documento rolável: eyebrow "Mapa colaborativo", `h1`, lead, e grid de 3 `.about-card` (Como funciona / Colaboração / Como contribuir) — cada card com ícone num quadrado amarelo, numeral, título, parágrafo, e `box-shadow: 4px 4px 0 var(--color-bike-green)`. CTAs no fim: "Sugerir grupo" + "Sugerir correção".

---

## Interactions & Behavior

### Seleção de grupo (diferença web × mobile — IMPORTANTE)
- **Desktop:** clicar num **card** OU num **pino** → seleciona (card ganha estado `--selected`, pino vira amarelo/maior), abre a **prévia flutuante** (`#qv`), e o mapa dá `flyTo` no pino.
- **Mobile:**
  - Tocar num **card** da lista → **navega direto para `/grupo/[slug]`** (sem prévia/modal — a lista já tem as infos).
  - Tocar num **pino** → apenas **destaca o card** correspondente na lista (estado selecionado) + `flyTo`; **não navega**. Se o sheet estiver em `peek`, sobe para `half` e rola a lista até o card.
- Use o helper de breakpoint `window.matchMedia('(max-width: 760px)')` para ramificar o comportamento.

### Mapa (Leaflet)
- Tiles CARTO: `light_all` (temas claros) / `dark_all` (Noturno). Trocar a camada base ao alternar tema.
- Pins = `divIcon` com `.ps-pin` numerado (1..N na ordem dos resultados); selecionado usa `.ps-pin--selected`.
- Clicar no fundo do mapa limpa a seleção. Controles de zoom no canto inferior-direito.

### Busca & filtros
- Busca **ao vivo** (`input`): casa contra nome, região, endereço, dia e nível (normalizada sem acento/caixa).
- Filtros **client-side**, combináveis. Contagem de filtros ativos numa pílula. "Limpar" reseta filtros mas **mantém a busca**.
- Estado vazio quando 0 resultados (desktop: card flutuante; mobile: dentro do sheet).

### Tema claro/escuro
- Toggle no header alterna Ciclovia ↔ Noturno (ícone lua ↔ sol). Persistir a escolha. Sincroniza com o seletor do painel de Tweaks (se mantido).

### Carrossel (desktop)
- Setas rolam ~80% da largura visível; desabilitam no início/fim conforme `scrollLeft`.

### Animações / acessibilidade
- Transições em `--duration-normal var(--ease-out)`. Gaveta e sheet usam `transform`. Respeitar `prefers-reduced-motion`. Focus ring amarelo visível. Alvos de toque ≥ 44px.

---

## State Management
- `filters`: `{ query, day, effort, distanceRange, period, rhythm }` (ver `proto-data.js` `emptyFilters()`).
- `selected`: slug do grupo selecionado (ou null).
- `results`: lista filtrada derivada de `applyFilters(filters)`.
- `theme`: `'ciclovia' | 'noturno'` (+ persistência).
- UI: estado de abertura da gaveta; `data-snap` do bottom sheet; menu mobile aberto/fechado.
- **Derivações centralizadas** (espelham a spec §12.4) em `proto-data.js`:
  - `periodFromHour(h)` → morning (5–11) / afternoon (12–17) / night.
  - `rhythmCategory(kmh)` → light (<16) / moderate (16–22) / strong (>22).
  - `distanceRange(km)` → up-to-20 / 20-to-40 / over-40.
  - `lapDuration(distanceKm, rhythmKmH)` → string `"HHh:MMm"` (tempo estimado da volta). **Mantenha estas regras no `lib/` do Nuxt** (a branch já tem `lib/time.ts`).

### Modelo de dados (mock no protótipo → usar o tipo real `types/group.ts`)
Cada grupo: `{ id, slug, name, region, departureAddress, lat, lng, link: { label, url } | null, schedules: [{ day, startHour, effort, distanceKm, rhythmKmH }] }`.

---

## Design Tokens (resumo rápido)
- **Cores:** ver tabela acima + `colors_and_type.css` / `themes.css`.
- **Fontes:** Archivo (display), Hanken Grotesk (body).
- **Espaçamento:** múltiplos de 4px (4→64).
- **Raio:** 4px / 6px.
- **Sombras:** placa `4px 4px 0` (sem blur); painel `0 18px 50px rgb(26 18 11 / 18%)`.
- **Header:** 72px, canto cortado via clip-path.

## Assets
- `assets/brand-logo.svg` — marca atual: pino âmbar com ícone de bicicleta preto (usado no header e hero do design system).
- `assets/favicon.svg` — favicon (pino com bike sobre fundo escuro).
- `assets/brand-sun.svg` — marca antiga (sol). **Obsoleta** — mantida só por referência; usar `brand-logo.svg`.
- **Mapa:** Leaflet 1.9.4 + tiles CARTO (light_all / dark_all). No Nuxt, considerar `@nuxtjs/leaflet` ou vue-leaflet, mantendo os pins `.ps-pin`.

## Files (neste bundle)
- `Pedala Sampa - Protótipo.html` — protótipo principal **responsivo** (web + mobile). Fonte da verdade.
- `proto.css` — layout do app (toolbar, gaveta, carrossel, prévia, bottom sheet, breakpoint mobile em `@media (max-width:760px)`).
- `proto-app.js` — lógica: Leaflet, seleção, filtros, roteamento por hash (`/`, `/grupo/[slug]`, `/sobre`), bottom sheet drag/snap, carrossel, tema.
- `proto-data.js` — dados mock + derivações + filtragem (espelha a spec).
- `proto-icons.js` — conjunto de ícones (`PS.icon`).
- `proto-tweaks.jsx` + `tweaks-panel.jsx` — painel de exploração (tema/fonte/densidade/ícones). **Opcional** — só o toggle claro/escuro é requisito.
- `design-system/` — `colors_and_type.css`, `components.css`, `themes.css`, `README.md`, `SKILL.md`, `Design System.html` (showcase visual de tokens/componentes/ícones).
- `assets/` — marca e favicon.

> Referência da spec original (no repositório): `docs/superpowers/specs/2026-05-25-pedala-sampa-nuxt3-redesign-design.md` e o plano em `docs/superpowers/plans/`.
