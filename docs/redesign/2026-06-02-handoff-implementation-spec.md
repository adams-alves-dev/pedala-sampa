# Especificação de implementação — Redesign Pedala Sampa (handoff Claude Design)

> **Fonte da verdade visual/comportamental:** handoff `Pedala Sampa — Protótipo` (HTML/CSS/JS + Leaflet) gerado no Claude Design em 2026-06-01/02.
> **Ambiente-alvo:** este repositório — Nuxt 3 + Vue 3 + TypeScript, branch `redesign-nuxt3-spec`.
> **Regra de ouro:** os *detalhes de design* (cores, tipo, espaçamento, ícones, estados, interações) são finais e devem ser recriados fielmente. A *implementação* é portada para componentes Vue idiomáticos — **não** se copia o HTML/JS do protótipo para dentro do Nuxt.

---

## 0. Decisões tomadas (input do cliente)

| Tema | Decisão | Impacto |
|---|---|---|
| Modelo de filtros | **Seleção única por categoria** (fiel ao protótipo) | Reescreve `types/group.ts` (`GroupFilters`), `lib/group-filters.ts` e testes |
| Tema claro/escuro | **`@nuxtjs/color-mode`** (`light→ciclovia`, `dark→noturno`) | Nova dependência; remove código SSR manual; sem flash |
| Home | **"Mapa-foco" (abordagem D)** + **quick view flutuante (QV2)** | Substitui o layout split atual (mapa + painel lateral) |
| Tipografia | **Sinal**: Archivo (display) + Hanken Grotesk (body) | Troca Syne/Sora |
| Densidade | **Compacta** (padrão) | Cards mais densos |
| Logo | **Pino âmbar com bicicleta preta** (`brand-logo.svg`) | Substitui o ícone de sol atual |
| Painel de Tweaks | **Não vai para produção** | Só o toggle claro/escuro do header é requisito |

---

## 1. Visão geral

Pedala Sampa é um **mapa colaborativo dos grupos de pedal de São Paulo**. O usuário explora grupos num **mapa em tela cheia** com busca + filtros flutuando no topo, vê resultados num **carrossel na base** (desktop) ou **bottom sheet arrastável** (mobile), abre o detalhe de cada grupo e segue para a página completa, podendo sugerir grupos/correções por link externo.

Direção visual: **sinalização urbana / wayfinding** — tinta asfalto sobre concreto, verde de ciclovia para seleção, amarelo de placa para CTAs (paralelogramo + sombra dura sem blur), superfícies anguladas, tipografia grotesca.

> ⚠️ **Discrepância com a memória do projeto:** há uma memória registrada como "Cockpit noturno / ciclocomputador". O handoff atual usa a direção **wayfinding / sinalização urbana** (Ciclovia + Noturno). Este spec segue o handoff, que é o artefato mais recente que o cliente compartilhou. Atualizar/Reconciliar a memória ao final.

### 1.1 Telas (rotas)
| Rota | Tela | Status atual | Mudança |
|---|---|---|---|
| `/` | Home — explorador (mapa-foco) | Existe (split panel) | **Reescrita de layout** |
| `/grupo/[slug]` | Página pública do grupo | Existe (placeholder simples) | **Reescrita visual** |
| `/sobre` | Página institucional | Existe (2 cards) | **Reescrita visual (3 cards)** |

### 1.2 Web × Mobile
Web e mobile são o **mesmo conjunto de componentes responsivos**, não telas separadas. O layout mobile ativa em **`@media (max-width: 760px)`**. (O `Pedala Sampa - Mobile.html` do handoff é só moldura de revisão — ignorar.)

> ⚠️ O breakpoint atual do repo é `860px`/`720px` em vários componentes. **Padronizar em `760px`** conforme o protótipo.

---

## 2. Design tokens (`assets/css/main.css`)

Atualizar o `:root` e adicionar a camada de temas. Os tokens canônicos vêm de `colors_and_type.css` + `themes.css` do handoff.

### 2.1 Tipografia
- Trocar a fonte default para o par **Sinal**:
  - `--font-display: 'Archivo', ui-sans-serif, system-ui, sans-serif;`
  - `--font-body: 'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif;`
- Atualizar o `<link>` do Google Fonts em `nuxt.config.ts`:
  ```
  https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;600;800&display=swap
  ```
  (não carregar os outros 4 pares — eram só ferramenta de Tweak)
- `font-variant-numeric: tabular-nums` em dados (`.ps-data`, badges, meta cells).

### 2.2 Escala de tipo, espaçamento, motion, elevação
Manter a escala já presente (já bate com o handoff). **Adicionar** os tokens faltantes:
```css
/* sombra de placa (sem blur) — usar nos hovers de CTA/btn e cards selecionados */
--shadow-hard: 4px 4px 0 var(--color-asphalt);

/* shades derivados usados pelos componentes */
--color-asphalt-80: rgb(26 18 11 / 80%);
--color-asphalt-55: rgb(26 18 11 / 55%);
--color-asphalt-45: rgb(26 18 11 / 45%);
--color-green-dark:  #015C50;
--color-green-tint:  #DDEAE6;
--color-yellow-tint: #FBEBC4;
--color-paper-2:     #F7EEDF;
--color-concrete-dk: #D9CFB8;

/* tokens de superfície do header (desacoplados p/ dark mode) */
--header-bg: var(--color-asphalt);
--header-fg: var(--color-concrete);
```
> Os `--color-asphalt-*` precisam ser **redefinidos por tema** (no Noturno a tinta é clara), então cada bloco de tema redefine também esses rgba (ver §3).

### 2.3 Temas (somente Ciclovia + Noturno são requisito)
Aplicados via `[data-theme]` no `<html>`. Valores exatos do handoff:

**Ciclovia (claro, padrão):**
```css
--color-asphalt: #11271C; --color-concrete: #DCE7DA; --color-paper: #F4F9F0;
--color-bike-green: #1F8A4C; --color-sign-yellow: #F2B33A;
--color-alert-red: #D8432F; --color-transit-blue: #1E7A9E; --color-border: #BBCDB6;
--color-asphalt-80: rgb(17 39 28 / 80%); --color-asphalt-55: rgb(17 39 28 / 58%); --color-asphalt-45: rgb(17 39 28 / 46%);
--color-green-dark: #136636; --color-green-tint: #D7EBD6; --color-yellow-tint: #F8EAC4;
--color-paper-2: #EAF2E4; --color-concrete-dk: #CCD9C7;
--header-bg: #11271C; --header-fg: #DCE7DA;
```

**Noturno (escuro):**
```css
--color-asphalt: #F3EEE2; --color-concrete: #14130E; --color-paper: #211F18;
--color-bike-green: #2FCB7E; --color-sign-yellow: #FFC83D;
--color-alert-red: #FF6B5E; --color-transit-blue: #5AA9FF; --color-border: #3A3730;
--color-asphalt-80: rgb(243 238 226 / 82%); --color-asphalt-55: rgb(243 238 226 / 62%); --color-asphalt-45: rgb(243 238 226 / 46%);
--color-green-dark: #28B870; --color-green-tint: #1C3A2C; --color-yellow-tint: #3A3320;
--color-paper-2: #1A1812; --color-concrete-dk: #2A2820;
--header-bg: #0E0D09; --header-fg: #F3EEE2;
```
Overrides do Noturno (do handoff):
```css
[data-theme='noturno'] .ps-input,
[data-theme='noturno'] .ps-search { background: #1A1812; }
[data-theme='noturno'] .ps-cta { color: #1A120B; }
[data-theme='noturno'] .leaflet-control-attribution { background: rgba(20,19,14,.8); color:#9c978b; }
[data-theme='noturno'] .leaflet-control-attribution a { color:#b9b3a6; }
```
> `--color-sun`/`--color-forest` continuam como aliases de `--color-sign-yellow`/`--color-bike-green` para não quebrar referências legadas durante a migração.

### 2.4 Camada de componentes `ps-*`
Portar `components.css` do handoff para o projeto. **Recomendação:** um único arquivo global `assets/css/components.css` (importado no `nuxt.config`) com as classes `ps-*` que são reusadas em vários componentes (`.ps-header`, `.ps-cta`, `.ps-btn`, `.ps-badge(s)`, `.ps-chip`, `.ps-card`, `.ps-pin`, `.ps-search/.ps-input/.ps-select`, `.ps-quickview`, type classes `.ps-h1/.ps-h2/.ps-h3/.ps-lead/.ps-body/.ps-eyebrow/.ps-label/.ps-data`, focus ring). Os layouts específicos de tela (toolbar, drawer, carousel, sheet, doc) ficam em `<style scoped>` de cada componente.

> Decisão de estilo: **classes globais `ps-*`** (não `scoped`) para os componentes do design system, espelhando o protótipo e evitando duplicação. Estilos de posicionamento/layout específicos de cada view ficam `scoped`.

---

## 3. Theming (claro/escuro)

### 3.1 Dependência e config
- Instalar `@nuxtjs/color-mode`. Em `nuxt.config.ts`:
  ```ts
  modules: ['@nuxtjs/leaflet', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',            // não usar sufixo
    dataValue: 'theme',         // escreve data-theme no <html>
    preference: 'ciclovia',     // padrão
    fallback: 'ciclovia',
    storageKey: 'ps-color-mode',
  },
  ```
  Com `dataValue: 'theme'`, o módulo escreve `data-theme="ciclovia"|"noturno"` no `<html>` antes da hidratação (sem flash) e persiste.
- Mapear nomes: usar **`ciclovia`** e **`noturno`** como os dois modos (não "light"/"dark"). Definir `colorMode.preference` e o toggle alternando entre esses dois.

### 3.2 Toggle no header
- Botão redondo (`.ps-theme-toggle`) no `AppHeader`, ícone **lua** quando está claro (vai para escuro) / **sol** quando está escuro.
- `const colorMode = useColorMode(); colorMode.preference = colorMode.value === 'noturno' ? 'ciclovia' : 'noturno'`.
- O `<html>` já recebe `data-theme` via módulo; os tokens de `main.css` reagem.

### 3.3 Tiles do mapa por tema
Ver §9.3 — trocar a basemap CARTO (`light_all` ↔ `dark_all`) reagindo a `colorMode.value`.

---

## 4. Sistema de ícones

O protótipo tem um conjunto de linha próprio (24×24, traço 1.75, `currentColor`, round caps) acessado por `PS.icon(name)`. Portar para Vue.

**Recomendação:** criar um componente único `components/ui/PsIcon.vue`:
```vue
<PsIcon name="calendar" :size="16" />
```
- Internaliza o mapa de paths do `proto-icons.js` (objeto `name → innerHTML`).
- Renderiza `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">` com `v-html` do path (paths são estáticos e confiáveis — sem risco de XSS).
- Props: `name: string`, `size?: number = 18`, `stroke?: number = 1.75`.

**Ícones necessários (copiar paths do handoff):** `calendar, clock, gauge, route, speed, compass, pin, bike, search, sliders, plus, x, check, chevronRight, chevronDown, chat, pencil, layers, users, map, flag, info, sparkle, arrowUR, sun, moon`.

**Mapa badge → ícone:** `Dia→calendar, Saída→clock, Nível→gauge, Distância→route, Ritmo→speed, Volta média→compass`. Centralizar num objeto `BADGE_ICON` em `lib/` ou no próprio componente de badges.

> Alternativa aceitável: `lucide-vue-next` com nomes equivalentes. Preferir o port próprio para casar 1:1 com o peso visual do handoff.

---

## 5. Modelo de dados e estado

### 5.1 Tipos (`types/group.ts`)
O `Group`/`GroupSchedule` atual já está alinhado (tem `slug`, `region`, `departureAddress`, `departureLocation`, `link`, `schedules` com `day/startHour/effort/distanceKm/rhythmKmH`). **Manter.**

**Mudança — `GroupFilters` para seleção única:**
```ts
export type GroupFilters = {
  query: string
  day: string            // '' = todos
  effort: string         // '' = todos
  distanceRange?: DistanceRange
  period: Period | ''    // '' = todos
  rhythm: Rhythm | ''    // '' = todos
}
```
(remove os arrays `days[]/efforts[]/periods[]/rhythms[]`).

### 5.2 Derivações (`lib/time.ts`)
Já existe e está correto (`getEstimatedLapDuration`, `getPeriodFromHour`, `getRhythmCategory`) e bate com o protótipo (thresholds idênticos). **Manter.** A distância (`up-to-20`/`20-to-40`/`over-40`) está hoje inline em `group-filters.ts` — manter, mas alinhar limites com o protótipo:
- protótipo: `<=20 → up-to-20`, `<=40 → 20-to-40`, senão `over-40`.
- atual: `>20 && <=40 → 20-to-40`. Equivalente. **OK.**

### 5.3 Filtragem (`lib/group-filters.ts`)
Reescrever `createEmptyGroupFilters()` e `filterGroups()` para o modelo único:
- `createEmptyGroupFilters(): { query:'', day:'', effort:'', distanceRange:undefined, period:'', rhythm:'' }`
- `filterGroups`: para cada grupo, casar contra `schedules.some(...)`:
  - `query` (normalizada sem acento/caixa) contra `name, region, departureAddress, day, effort`
  - `day` (igualdade ou vazio), `effort`, `distanceRange`, `period` (via `getPeriodFromHour`), `rhythm` (via `getRhythmCategory`)
- Adicionar helper `countActiveFilters(filters)` → nº de categorias ativas + (query ? 1 : 0). Usado nas pílulas de contagem.

### 5.4 Composables
- `useGroupFilters` — ajustar `clearFilters()` (mantém `query`, zera o resto — já faz isso). `toggleFilter(key, value)`: se igual ao atual, volta a `''`; senão seta. Expor `activeCount`.
- `useSelectedGroup` — **manter** (`selectedGroupSlug`, `selectGroup`, `clearSelectedGroup`).
- Novos (opcionais, podem viver no `pages/index.vue`):
  - `useBottomSheet` — estado `snap: 'peek'|'half'|'full'`, lógica de drag/cycle.
  - `useColorScheme` — wrapper fino sobre `useColorMode` se quiser API própria (opcional).

### 5.5 Tabela de estado (espelha §"State Management" do handoff)
| Estado | Onde | Notas |
|---|---|---|
| `filters` | `useGroupFilters` | seleção única; live; client-side |
| `selected` (slug) | `useSelectedGroup` | null limpa QV/realce |
| `results` | computed `filteredGroups` | derivado |
| `theme` | `useColorMode` | persiste (cookie) |
| drawer aberto | local no Home | bool |
| `snap` do sheet | `useBottomSheet` | só mobile |
| menu mobile aberto | local no Header | bool |

---

## 6. Inventário de componentes (atual → alvo)

| Componente | Hoje | Ação |
|---|---|---|
| `app/AppHeader.vue` | logo-sol, nav, CTA | **Reescrever:** logo `brand-logo.svg`, toggle tema, burger mobile + dropdown |
| `explore/ExploreShell.vue` | grid split map+panel | **Substituir** por layout mapa-foco (toolbar + carousel + qv + sheet) |
| `explore/GroupExplorerPanel.vue` | painel lateral (lista) | **Remover/realocar** — vira o carrossel (desktop) e o sheet (mobile) |
| `explore/GroupQuickView.vue` | card de prévia | **Reestilizar** para `.ps-quickview` flutuante (QV2), só desktop |
| `filters/GroupFilters.vue` | selects | **Reescrever** como chips numa **gaveta** (drawer) |
| `group/GroupCard.vue` | card básico | **Reestilizar** `.ps-card` (trilho 5px, ícones nos badges, tag "Selecionado") |
| `group/GroupMetaBadges.vue` | `<dl>` sem ícones | **Adicionar ícone** por badge (`.ps-badge__ic`) |
| `group/GroupDetails.vue` | card simples | **Reescrever** layout 2 colunas (agenda + mini-mapa) |
| `map/GroupMap.client.vue` | pins diamante | **Reescrever** pins teardrop numerados `.ps-pin`; `flyTo`; clique no fundo limpa |
| `map/MapTileLayer.vue` | Mapbox/OSM | **Trocar** para CARTO light/dark por tema |
| `contribution/ContributionLink.vue` | CTA amarelo | **Manter**, alinhar com `.ps-cta` + ícone |
| **Novos** | — | `ui/PsIcon.vue`, `explore/ResultsCarousel.vue`, `explore/FiltersDrawer.vue`, `explore/MobileSheet.vue`, `explore/MapToolbar.vue`, `explore/EmptyState.vue` |

---

## 7. Especificação por tela

### 7.1 Header (`AppHeader.vue`)
- Barra asfalto 72px, **canto inferior-direito cortado** via `clip-path: polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 32px) 100%,0 100%)` (já existe).
- Usa tokens `--header-bg`/`--header-fg`.
- **Marca:** `<img src="/brand-logo.svg" width="38" height="44" alt="">` + `Pedala Sampa` + badge "mapa colaborativo" (badge some no mobile).
- **Desktop (>760px):** nav `Mapa` / `Sobre` (estado `aria-current`), **toggle redondo claro/escuro**, CTA "Sugerir grupo" (`.ps-cta`, ícone `plus`), burger escondido.
- **Mobile (≤760px):** burger visível → dropdown (`Mapa` / `Sobre` / `+ Sugerir grupo`), fecha ao escolher ou clicar fora; toggle continua visível; nav desktop e CTA escondidos.
- Acessibilidade: alvos ≥44px, `aria-label` no toggle e burger.

### 7.2 Home — Explorador (`pages/index.vue` + `explore/*`)

**Estrutura (substitui `ExploreShell`):**
```
section.home (position:relative, ocupa viewport - header)
├── #map  (absolute inset:0)                      → GroupMap.client
├── .toolbar (absolute top; z 500)                → MapToolbar
│     ├── .ps-search (busca live; flex 0 1 420px)
│     └── .ps-btn--solid.filters-btn + count-pill (desktop) → abre drawer
├── .scrim + aside.drawer (z 700/800)             → FiltersDrawer
├── .carousel (absolute bottom; z 500; só desktop)→ ResultsCarousel
├── .qv (absolute bottom-right; z 600; só desktop)→ GroupQuickView
├── .empty (absolute bottom-left; z 550; desktop) → EmptyState
└── .sheet (mobile; z 600)                         → MobileSheet
```

**Toolbar (desktop e mobile):**
- Busca: `.ps-search` com ícone `search`, `input[type=search]` placeholder "Nome, bairro, dia ou nível", **live** (`@input`).
- Botão Filtros: `.ps-btn--solid` com ícone `sliders` + `.count-pill` (mostra nº de filtros ativos; some quando 0). **Escondido no mobile** (lá os filtros abrem pelo sheet).

**Carrossel (desktop, `ResultsCarousel.vue`):**
- Linha: seta circular `‹` (`.carousel__nav--prev`) + `.carousel__track` (scroll-snap x, cards `flex 0 0 320px`) + seta `›` (`.carousel__nav--next`).
- Meta acima: chip de contagem `.ps-chip--count` "N grupos".
- Setas rolam ~80% da largura visível; **desabilitam** nas pontas (`:disabled`, opacidade .3) — calcular por `scrollLeft`/`scrollWidth`/`clientWidth` no scroll/resize.
- Card selecionado entra na viewport (scroll suave) ao selecionar.
- Esconde quando 0 resultados (mostra `.empty`).

**Quick view (`GroupQuickView.vue`, SÓ desktop):**
- `.ps-quickview` flutuante (bottom-right), abre ao selecionar card/pino.
- Conteúdo: botão "✕ Fechar"; `.ps-quickview__sun` (brilho decorativo); nome (`qv__name`); local (`qv__loc` + ícone `pin`); `.ps-badges`; linha "Tempo médio da volta: **HHh:MMm**" (ícone `compass`, via `getEstimatedLapDuration`); ações:
  - "Página completa →" (`.ps-btn--solid`, `NuxtLink` para `/grupo/[slug]`)
  - contato externo (`.ps-btn`, se `group.link?.url`; senão estado "Sem link" desabilitado)
  - "Sugerir correção" (`.ps-cta`, `ContributionLink context="correction"`)
- Transição: `transform: translateY(12px)→0` + display. **No mobile não existe.**

**Empty state (`EmptyState.vue`, desktop):** card flutuante bottom-left com ícone `search`, título, texto e ações "Limpar filtros" + "Sugerir grupo". No mobile o vazio vive dentro do sheet.

### 7.3 Filtros — gaveta (`FiltersDrawer.vue`)
- Acionada por "Filtros" (desktop: toolbar; mobile: botão no header do sheet).
- Desktop: gaveta à esquerda **348px** deslizando `translateX(-104%)→0`; `scrim` escurece o fundo.
- Mobile: gaveta **full-width**.
- Head: título "Filtros" + botão fechar `×`.
- Body: 5 grupos renderizados como **chips** (`.ps-chip`, ativo = verde):
  - **Dia da semana:** Segunda…Domingo
  - **Nível:** Leve / Moderado / Forte
  - **Distância:** Até 20 km / 20 a 40 km / Acima de 40 km
  - **Período:** Manhã / Tarde / Noite
  - **Ritmo:** Leve / Moderado / Forte
  - clique no chip ativo desliga (seleção única por grupo).
- Foot: "Limpar" (`.ps-btn--ghost`) + "Ver **N** grupos" (`.ps-cta`, fecha a gaveta).
- Filtragem **client-side e ao vivo** — resultados/markers/contagens atualizam a cada mudança.
- Fechar por: `×`, scrim, "Ver N grupos", `Esc`.

### 7.4 Bottom sheet (`MobileSheet.vue`, SÓ mobile)
- 3 estados via `data-snap`:
  - `peek` → `translateY(calc(100% - 132px))`
  - `half` → `translateY(45%)`
  - `full` → `translateY(0)` (altura 88vh)
- **Alça arrastável** (`.sheet__grab`): drag com pointer events encaixa no estado mais próximo ao soltar; **tap** cicla peek→half→full→peek; teclado Enter/Espaço cicla. `touch-action: none` no sheet; `transition: none` durante drag.
- Head: chip "N grupos" + botão "Filtros" (`count-pill`) que abre a gaveta full-width + linha de **chips rápidos** (Nível/Período/Distância) com scroll-x.
- Body: lista de `.ps-card` (rolável). Vazio → `.sheet__empty` (ícone + "Limpar filtros").

### 7.5 Página do grupo (`pages/grupo/[slug].vue` + `GroupDetails.vue`)
- Documento rolável `.doc`, `.doc__inner` max-width 1040px.
- Back link "‹ Voltar ao mapa" (ícone `chevronRight` espelhado).
- Cabeçalho: pin selecionado (`.ps-pin--selected` com ícone `bike`) + `h1` nome (`.ps-h1`, `--text-2xl`).
- `.ps-badges` (Dia/Saída/Nível/Distância/Ritmo).
- Grid 2 colunas (1 col ≤760px):
  - **Esquerda — Agenda** (grid 2×3 `.meta-cell`: Dia & saída / Ponto de saída / Distância / Ritmo médio / Nível / Volta média) + **Contato & contribuição** (botão externo se `link`; CTA "Sugerir correção neste grupo").
  - **Direita — Ponto de saída:** mini-mapa Leaflet (`#groupMapEl`, 320px / 220px mobile) centrado no ponto + endereço.
- Estado "não encontrado": back link + `h1` "Grupo não encontrado" + link para o mapa.
- **SEO:** `useSeoMeta` com title/description dinâmicos por grupo (já existe; manter e enriquecer com `og:*`).

### 7.6 Página Sobre (`pages/sobre.vue`)
- `.doc` rolável: back link, eyebrow "Mapa colaborativo", `h1`, lead, **grid de 3 `.about-card`**:
  1. Como funciona (ícone `layers`)
  2. Colaboração (ícone `users`)
  3. Como contribuir (ícone `pencil`)
  - cada card: ícone num quadrado amarelo (`.about-ic`), numeral 01/02/03 (`.num`, opacidade .28), título (`.ps-h3`), parágrafo, e `box-shadow: 4px 4px 0 var(--color-bike-green)`.
- CTAs no fim: "Sugerir grupo" (`.ps-cta`) + "Sugerir correção" (`.ps-btn`).
- Copy: usar a do protótipo (ver `Pedala Sampa - Protótipo.html`, seção `#sobreView`).

---

## 8. Interações e comportamento

### 8.1 Seleção de grupo (web × mobile — CRÍTICO)
- **Desktop:** clicar **card** OU **pino** → seleciona (card `--selected`, pino amarelo/maior), abre **quick view** flutuante, `flyTo([lat,lng], 14, {duration:0.6})`, e rola o card para a viewport.
- **Mobile:**
  - tocar **card** da lista → **navega direto** para `/grupo/[slug]` (sem prévia).
  - tocar **pino** → apenas **destaca** o card na lista (estado selecionado) + `flyTo`; **não navega**. Se o sheet estiver em `peek`, sobe para `half` e rola a lista até o card.
- Branch por `window.matchMedia('(max-width: 760px)')` (encapsular num helper `useIsMobile()` reativo a resize).
- Clicar no **fundo do mapa** limpa a seleção.

### 8.2 Busca & filtros
- Busca **live** contra nome/região/endereço/dia/nível (normalizada sem acento/caixa).
- Filtros **client-side**, seleção única por categoria, combináveis entre categorias.
- Contagem de filtros ativos em pílula (toolbar desktop + botão do sheet).
- "Limpar" zera filtros mas **mantém a busca**.
- 0 resultados → empty state (desktop flutuante / mobile no sheet).

### 8.3 Carrossel (desktop)
Setas rolam ~80% da largura; desabilitam no início/fim.

### 8.4 Tema claro/escuro
Toggle no header alterna Ciclovia ↔ Noturno (ícone lua ↔ sol), persiste (color-mode), troca tiles do mapa.

### 8.5 Movimento & acessibilidade
- Transições `--duration-normal var(--ease-out)`; gaveta/sheet via `transform`.
- Respeitar `prefers-reduced-motion` (desligar `flyTo` animado e transições não essenciais).
- Focus ring `outline: 3px solid var(--color-sign-yellow)` (já global).
- Alvos de toque ≥44px; `aria-live="polite"` no quick view; `aria-pressed` em cards/chips.

---

## 9. Mapa (Leaflet via `@nuxtjs/leaflet`)

### 9.1 Componente principal (`GroupMap.client.vue`)
- `LMap` sem controles default (`zoomControl:false`), `L.control.zoom` no **bottom-right**.
- Centro/zoom: `CENTER = [-23.5760, -46.6550]`, `ZOOM = 12` (alinhar com o protótipo; o atual usa `[-23.55, -46.6238]`).
- Pins via `L.divIcon` com markup `.ps-pin` **numerado** (1..N na ordem dos resultados); selecionado usa `.ps-pin--selected` (maior, amarelo).
  - `iconSize`/`iconAnchor` diferentes p/ selecionado (ver `components.css` + `pinIcon()` do protótipo).
  - `className: 'pin-wrap'` com `overflow:visible`.
- Eventos: clique no marker → `select`; clique no mapa → `clear-selection`.
- `flyTo` ao selecionar (desktop e mobile-pino). `invalidateSize()` ao voltar para a Home (rota) e no mount.

### 9.2 Pin teardrop (`.ps-pin`)
Recriar exatamente o CSS do `components.css` (rotação -45°, `border-radius: 50% 50% 50% 0`, conteúdo contra-rotacionado 45°; selecionado 36×36 amarelo com `box-shadow: 4px 4px 0`).

### 9.3 Tiles por tema (`MapTileLayer.vue`)
Trocar Mapbox/OSM por **CARTO**:
```
https://{s}.basemaps.cartocdn.com/{light_all|dark_all}/{z}/{x}/{y}{r}.png
subdomains: 'abcd', maxZoom: 19, attribution: '© OpenStreetMap · © CARTO'
```
- Escolher `light_all`/`dark_all` por `colorMode.value` (`noturno → dark_all`).
- Ao alternar tema, **recriar/atualizar** a camada base (no protótipo remove e re-adiciona, `bringToBack()`).
- O mini-mapa da página do grupo usa o mesmo helper de tile.
> As envs Mapbox (`mapboxApiKey/UserId/StyleId`) deixam de ser usadas aqui — manter no config se houver outro uso, ou remover do `MapTileLayer`.

---

## 10. Assets
Copiar do handoff (`design-system/assets/` ou `assets/`) para `public/`:
- `brand-logo.svg` → `public/brand-logo.svg` (pino âmbar + bicicleta preta) — header e cabeçalho da página do grupo.
- `favicon.svg` → `public/favicon.svg`; atualizar `nuxt.config` `link[rel=icon]` para `image/svg+xml`.
- `brand-sun.svg` é **obsoleto** — não usar (remover o SVG inline de sol no `AppHeader` e no `layouts/default` footer).

---

## 11. Acessibilidade (checklist)
- [ ] Foco visível (ring amarelo) em todos os interativos.
- [ ] `aria-current="page"` na nav ativa.
- [ ] Toggle de tema com `aria-label` claro; reflete estado.
- [ ] Cards/chips com `aria-pressed`.
- [ ] Quick view `aria-live="polite"`.
- [ ] Sheet grab operável por teclado (Enter/Espaço) + `aria-label` dinâmico.
- [ ] Alvos ≥44px; `prefers-reduced-motion` respeitado.
- [ ] Links externos com `target="_blank" rel="noopener noreferrer"` + sufixo "(abre em nova aba)".
- [ ] Contraste validado nos dois temas.

---

## 12. Plano de implementação (fases)

**Fase 0 — Fundação**
1. Tokens + temas em `assets/css/main.css`; criar `assets/css/components.css` (camada `ps-*`); registrar ambos no `nuxt.config`.
2. Trocar fontes (Archivo + Hanken) no `nuxt.config`.
3. Instalar/config `@nuxtjs/color-mode` (ciclovia/noturno).
4. Copiar assets (`brand-logo.svg`, `favicon.svg`) para `public/`.
5. Criar `components/ui/PsIcon.vue` + paths.

**Fase 1 — Dados/estado**
6. `types/group.ts`: `GroupFilters` seleção única.
7. `lib/group-filters.ts`: reescrever + `countActiveFilters`.
8. `composables/useGroupFilters.ts`: `toggleFilter`, `activeCount`.
9. Atualizar testes (`tests/unit/group-filters.test.ts`, `time.test.ts`).

**Fase 2 — Header e navegação**
10. `AppHeader.vue`: logo, toggle tema, burger + dropdown mobile.
11. `layouts/default.vue`: ajustar footer (logo novo) / decidir footer só fora da Home (já faz).

**Fase 3 — Home (mapa-foco)**
12. `GroupMap.client.vue`: pins teardrop numerados, flyTo, clear-on-map-click, CARTO tiles por tema.
13. `MapToolbar.vue` (busca + filtros) e `FiltersDrawer.vue` (chips + scrim).
14. `ResultsCarousel.vue` (track + setas + contagem).
15. `GroupQuickView.vue` reestilizado (QV2, desktop).
16. `MobileSheet.vue` (3 snaps + drag + chips rápidos + lista + empty).
17. `EmptyState.vue`.
18. Reescrever `pages/index.vue` orquestrando tudo (substitui `ExploreShell`/`GroupExplorerPanel`).
19. `GroupCard.vue` + `GroupMetaBadges.vue` com `.ps-card`/badges com ícone.

**Fase 4 — Páginas internas**
20. `GroupDetails.vue` + `pages/grupo/[slug].vue` (layout 2 col + mini-mapa + SEO).
21. `pages/sobre.vue` (3 about-cards + CTAs).

**Fase 5 — Polimento**
22. `prefers-reduced-motion`, foco, ARIA, alvos ≥44px.
23. QA responsivo no breakpoint 760px (web e mobile no mesmo arquivo).
24. Rodar `yarn test` e `yarn lint`; revisar.

---

## 13. Critérios de aceite
- [ ] Home é mapa-foco: mapa full-bleed, toolbar flutuante, carrossel (desktop), sheet (mobile) — split panel antigo removido.
- [ ] Quick view flutuante só no desktop; no mobile, card→página e pino→realce.
- [ ] Filtros em chips (gaveta), seleção única, live, com contagem; "Limpar" mantém busca.
- [ ] Toggle Ciclovia↔Noturno persiste, sem flash, e troca os tiles do mapa.
- [ ] Tipografia Sinal (Archivo+Hanken), densidade compacta, ícones nos badges e na UI.
- [ ] Pins teardrop numerados; selecionado amarelo/maior; flyTo; clique no fundo limpa.
- [ ] Página do grupo (agenda + mini-mapa + SEO dinâmico) e Sobre (3 cards) recriadas.
- [ ] Logo nova (pino+bike) no header; favicon SVG; sol removido.
- [ ] `yarn test` e `yarn lint` verdes; sem regressão de acessibilidade.

---

## 14. Pendências / pontos de atenção
- **Memória "Cockpit noturno":** reconciliar com a direção wayfinding deste handoff (provável renomeação ou mudança de rumo). Confirmar com o cliente.
- **CARTO vs Mapbox:** o protótipo usa CARTO; o repo tinha infra Mapbox. Confirmar se mantém envs Mapbox para algo ou remove.
- **Fluxos "Sugerir grupo/correção":** continuam por **link externo** (`contributionFormUrl`); o handoff não pede formulário nativo. Confirmar URL real em produção.
- **Dados:** protótipo usa mock; produção usa Hygraph (`useGroups`). Garantir que o `Group` normalizado preenche todos os campos que as novas telas consomem (`region`, `departureAddress`, `link`, `schedules[0]`).
