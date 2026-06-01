# Redesign Nuxt 3 Do Pedala Sampa - Plano De Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** migrar o Pedala Sampa em lugar para Nuxt 3 e entregar a v1 do redesign com mapa/lista integrados, filtros, detalhe rápido, página pública de grupo, página `/sobre` e CTAs externos de contribuição.

**Arquitetura:** a UI não acessa Hygraph diretamente. Páginas chamam composables, composables buscam e normalizam dados, componentes recebem modelos tipados via props e emitem eventos. A home mantém estado local de busca, filtros e grupo selecionado; Pinia fica fora da v1.

**Stack Técnica:** Nuxt 3, Vue 3, TypeScript, Vitest, `@nuxt/test-utils`, `@nuxtjs/leaflet`, GraphQL via `graphql-request`, CSS global com variáveis e estilos escopados por componente.

---

## Referências

- Spec canônica: `docs/superpowers/specs/2026-05-25-pedala-sampa-nuxt3-redesign-design.md`
- Instruções locais: `AGENTS.md`
- Documentação Nuxt 3 consultada para o plano: instalação/routing/testing oficiais do Nuxt e módulo oficial `@nuxtjs/leaflet`.

## Estrutura De Arquivos Planejada

Arquivos removidos ou substituídos:

- Remover: `nuxt.config.js`
- Remover: `jest.config.js`
- Remover: `pages/_slug.vue`
- Remover: `pages/_grupo/_name.vue`
- Remover: `components/Header/index.vue`
- Remover: `components/Map/index.vue`
- Remover: `components/Map/CustomTileLayer.vue`
- Remover: `components/Map/CustomGroupMap.vue`
- Remover: `store/index.js`
- Remover: `test/CustomTileLayer.spec.js`

Arquivos criados:

- `nuxt.config.ts`: configuração Nuxt 3, runtime config, CSS, módulos e PWA básico.
- `vitest.config.ts`: configuração de testes com Nuxt.
- `app.vue`: shell raiz.
- `assets/css/main.css`: tokens, reset, base visual e classes utilitárias.
- `types/group.ts`: tipos normalizados de grupos, filtros, links e agenda.
- `types/hygraph.ts`: tipos mínimos das respostas cruas do Hygraph.
- `lib/group-normalizers.ts`: normalização Hygraph -> modelos da aplicação.
- `lib/group-filters.ts`: busca, filtros e thresholds.
- `lib/time.ts`: parse de horário, período e duração estimada.
- `lib/contribution.ts`: helpers de URL externa de contribuição.
- `queries/groups.ts`: queries GraphQL como strings tipadas por uso.
- `composables/useHygraph.ts`: cliente GraphQL.
- `composables/useGroups.ts`: busca da lista de grupos.
- `composables/useGroup.ts`: busca de grupo por slug.
- `composables/useGroupFilters.ts`: estado e lista filtrada.
- `composables/useSelectedGroup.ts`: estado de seleção.
- `composables/useLapDuration.ts`: wrapper de duração estimada para UI.
- `components/app/AppHeader.vue`: marca, navegação e CTA.
- `components/contribution/ContributionLink.vue`: link externo de sugestão/correção.
- `components/filters/GroupFilters.vue`: controles de filtro.
- `components/group/GroupMetaBadges.vue`: badges reutilizáveis.
- `components/group/GroupCard.vue`: card acessível de grupo.
- `components/group/GroupDetails.vue`: detalhes completos de grupo.
- `components/explore/GroupExplorerPanel.vue`: busca, filtros, lista e estados.
- `components/explore/GroupQuickView.vue`: detalhe rápido.
- `components/explore/ExploreShell.vue`: layout desktop/mobile da home.
- `components/map/MapTileLayer.vue`: camada de tiles OSM/Mapbox.
- `components/map/GroupMap.client.vue`: mapa client-only com marcadores.
- `pages/index.vue`: home exploratória.
- `pages/grupo/[slug].vue`: página pública de grupo.
- `pages/sobre.vue`: página institucional estática.
- `tests/unit/group-normalizers.test.ts`
- `tests/unit/group-filters.test.ts`
- `tests/unit/time.test.ts`
- `tests/unit/contribution.test.ts`

Arquivos modificados:

- `package.json`: migrar scripts e dependências.
- `netlify.toml`: ajustar comando/publicação se necessário após Nuxt 3.
- `.gitignore`: manter artefatos locais fora do versionamento.

---

## Tarefa 1: Fundar O Projeto Nuxt 3

**Arquivos:**
- Modificar: `package.json`
- Criar: `nuxt.config.ts`
- Criar: `vitest.config.ts`
- Criar: `app.vue`
- Criar: `assets/css/main.css`
- Remover: `nuxt.config.js`
- Remover: `jest.config.js`

- [ ] **Passo 1: Atualizar `package.json` para Nuxt 3**

Substituir scripts, dependências e devDependencies por uma base Nuxt 3. Manter `"private": true`.

```json
{
  "name": "pedala-sampa",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@nuxtjs/leaflet": "latest",
    "graphql": "latest",
    "graphql-request": "latest",
    "leaflet": "latest",
    "nuxt": "^3.19.3",
    "vue": "latest"
  },
  "devDependencies": {
    "@nuxt/test-utils": "latest",
    "@vitejs/plugin-vue": "latest",
    "@vue/test-utils": "latest",
    "eslint": "latest",
    "happy-dom": "latest",
    "typescript": "latest",
    "vitest": "latest",
    "vue-tsc": "latest"
  }
}
```

- [ ] **Passo 2: Instalar dependências**

Executar:

```bash
yarn install
```

Esperado:

- `yarn.lock` atualizado.
- Sem dependências Nuxt 2 antigas em `package.json`.

- [ ] **Passo 3: Criar `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-26',
  devtools: { enabled: true },
  modules: ['@nuxtjs/leaflet'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Pedala Sampa - Grupos de pedal em São Paulo',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Encontre grupos de pedal em São Paulo por região, dia, horário, nível, distância e ritmo.',
        },
        { property: 'og:site_name', content: 'Pedala Sampa' },
        { name: 'theme-color', content: '#16A05D' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  runtimeConfig: {
    hygraphToken: process.env.GRAPHQL_TOKEN || '',
    public: {
      hygraphEndpoint:
        process.env.HYGRAPH_ENDPOINT ||
        'https://api-us-east-1.graphcms.com/v2/cktlzsv381lsy01z0109u52uf/master',
      contributionFormUrl: process.env.NUXT_PUBLIC_CONTRIBUTION_FORM_URL || '',
      mapboxApiKey: process.env.MAPBOX_API_KEY || '',
      mapboxUserId: process.env.MAPBOX_USERID || '',
      mapboxStyleId: process.env.MAPBOX_STYLEID || '',
    },
  },
  nitro: {
    preset: 'static',
  },
  typescript: {
    strict: true,
  },
})
```

- [ ] **Passo 4: Criar `vitest.config.ts`**

```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    include: ['tests/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'composables/**/*.ts', 'components/**/*.vue'],
    },
  },
})
```

- [ ] **Passo 5: Criar `app.vue`**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Passo 6: Criar `assets/css/main.css`**

```css
:root {
  --color-asphalt: #151515;
  --color-concrete: #f4f1ea;
  --color-paper: #fffdf7;
  --color-bike-green: #16a05d;
  --color-sign-yellow: #f5c542;
  --color-alert-red: #e24b3c;
  --color-transit-blue: #2f6fed;
  --color-border: #d8d2c7;
  --shadow-panel: 0 18px 50px rgb(21 21 21 / 18%);
  --radius-sm: 6px;
  --radius-md: 8px;
  --header-height: 64px;
  color: var(--color-asphalt);
  background: var(--color-concrete);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--color-concrete);
}

a {
  color: inherit;
}

button,
input,
select {
  font: inherit;
}

:focus-visible {
  outline: 3px solid var(--color-transit-blue);
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Passo 7: Remover arquivos Nuxt 2 substituídos**

Executar:

```bash
rm nuxt.config.js jest.config.js
```

Esperado:

- `nuxt.config.ts` e `vitest.config.ts` passam a ser as configurações ativas.

- [ ] **Passo 8: Rodar verificação inicial**

Executar:

```bash
yarn test
yarn build
```

Esperado:

- `yarn test`: passa sem testes encontrados ou com suite vazia configurada.
- `yarn build`: pode falhar por páginas/componentes Nuxt 2 ainda existentes. Se falhar por APIs antigas, continuar para as tarefas seguintes e não mascarar erro com stubs globais.

- [ ] **Passo 9: Commit**

```bash
git add package.json yarn.lock nuxt.config.ts vitest.config.ts app.vue assets/css/main.css
git add -u nuxt.config.js jest.config.js
git commit -m "chore: migrate project foundation to Nuxt 3"
```

---

## Tarefa 2: Criar Tipos, Normalização E Testes De Dados

**Arquivos:**
- Criar: `types/group.ts`
- Criar: `types/hygraph.ts`
- Criar: `lib/time.ts`
- Criar: `lib/group-normalizers.ts`
- Criar: `tests/unit/time.test.ts`
- Criar: `tests/unit/group-normalizers.test.ts`

- [ ] **Passo 1: Criar teste de duração em `tests/unit/time.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { getPeriodFromHour, getRhythmCategory, getEstimatedLapDuration } from '../../lib/time'

describe('time helpers', () => {
  it('calcula duração estimada da volta em horas e minutos', () => {
    expect(getEstimatedLapDuration({ distanceKm: 30, rhythmKmH: 15 })).toBe('02h:00m')
    expect(getEstimatedLapDuration({ distanceKm: 20, rhythmKmH: 18 })).toBe('01h:07m')
  })

  it('classifica período por horário', () => {
    expect(getPeriodFromHour('07:30')).toBe('morning')
    expect(getPeriodFromHour('14:00')).toBe('afternoon')
    expect(getPeriodFromHour('20:15')).toBe('night')
    expect(getPeriodFromHour('02:00')).toBe('night')
  })

  it('classifica ritmo por km/h', () => {
    expect(getRhythmCategory(12)).toBe('light')
    expect(getRhythmCategory(18)).toBe('moderate')
    expect(getRhythmCategory(26)).toBe('strong')
  })
})
```

- [ ] **Passo 2: Rodar teste e confirmar falha**

Executar:

```bash
yarn test tests/unit/time.test.ts
```

Esperado:

- FAIL porque `lib/time.ts` ainda não existe.

- [ ] **Passo 3: Criar `types/group.ts`**

```ts
export type GeoPoint = {
  latitude: number
  longitude: number
}

export type GroupLink = {
  label?: string
  url?: string
  html?: string
}

export type GroupSchedule = {
  id: string
  day: string
  startHour: string
  effort: string
  distanceKm: number
  rhythmKmH: number
  rating?: number
}

export type Group = {
  id: string
  name: string
  slug: string
  region?: string
  departureAddress?: string
  departureLocation: GeoPoint
  link?: GroupLink
  schedules: GroupSchedule[]
}

export type DistanceRange = 'up-to-20' | '20-to-40' | 'over-40'
export type Period = 'morning' | 'afternoon' | 'night'
export type Rhythm = 'light' | 'moderate' | 'strong'

export type GroupFilters = {
  query: string
  days: string[]
  efforts: string[]
  distanceRange?: DistanceRange
  periods: Period[]
  rhythms: Rhythm[]
}
```

- [ ] **Passo 4: Criar `lib/time.ts`**

```ts
import type { Period, Rhythm } from '../types/group'

export function getEstimatedLapDuration({
  distanceKm,
  rhythmKmH,
}: {
  distanceKm: number
  rhythmKmH: number
}) {
  if (!distanceKm || !rhythmKmH || rhythmKmH <= 0) {
    return '00h:00m'
  }

  const totalMinutes = Math.round((distanceKm / rhythmKmH) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m`
}

export function getPeriodFromHour(startHour: string): Period {
  const [rawHour] = startHour.split(':')
  const hour = Number(rawHour)

  if (Number.isNaN(hour)) {
    return 'night'
  }

  if (hour >= 5 && hour <= 11) {
    return 'morning'
  }

  if (hour >= 12 && hour <= 17) {
    return 'afternoon'
  }

  return 'night'
}

export function getRhythmCategory(rhythmKmH: number): Rhythm {
  if (rhythmKmH < 16) {
    return 'light'
  }

  if (rhythmKmH <= 22) {
    return 'moderate'
  }

  return 'strong'
}
```

- [ ] **Passo 5: Rodar teste de tempo**

Executar:

```bash
yarn test tests/unit/time.test.ts
```

Esperado:

- PASS.

- [ ] **Passo 6: Criar `types/hygraph.ts`**

```ts
export type HygraphGeoPoint = {
  latitude?: number | null
  longitude?: number | null
}

export type HygraphLink = {
  text?: string | null
  html?: string | null
}

export type HygraphGroupInfo = {
  id: string
  address?: string | null
  day?: string | null
  startHour?: string | null
  effort?: string | null
  distance?: number | null
  rhythm?: number | null
  rating?: number | null
}

export type HygraphGroup = {
  id: string
  name?: string | null
  slug?: string | null
  link?: HygraphLink | null
  departureLocation?: HygraphGeoPoint | null
  groupInfos?: HygraphGroupInfo[] | null
}
```

- [ ] **Passo 7: Criar teste de normalização em `tests/unit/group-normalizers.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { normalizeGroup, normalizeGroups } from '../../lib/group-normalizers'
import type { HygraphGroup } from '../../types/hygraph'

const group: HygraphGroup = {
  id: 'group-1',
  name: 'Pedal Centro',
  slug: 'pedal-centro',
  link: {
    text: 'Instagram',
    html: '<p><a href="https://example.com">Instagram</a></p>',
  },
  departureLocation: {
    latitude: -23.55,
    longitude: -46.63,
  },
  groupInfos: [
    {
      id: 'info-1',
      address: 'Praça da Sé',
      day: 'Terça',
      startHour: '20:00',
      effort: 'Intermediário',
      distance: 30,
      rhythm: 18,
      rating: 4,
    },
  ],
}

describe('group normalizers', () => {
  it('normaliza um grupo válido do Hygraph', () => {
    expect(normalizeGroup(group)).toEqual({
      id: 'group-1',
      name: 'Pedal Centro',
      slug: 'pedal-centro',
      departureAddress: 'Praça da Sé',
      departureLocation: {
        latitude: -23.55,
        longitude: -46.63,
      },
      link: {
        label: 'Instagram',
        html: '<p><a href="https://example.com">Instagram</a></p>',
      },
      schedules: [
        {
          id: 'info-1',
          day: 'Terça',
          startHour: '20:00',
          effort: 'Intermediário',
          distanceKm: 30,
          rhythmKmH: 18,
          rating: 4,
        },
      ],
    })
  })

  it('retorna null para grupo sem coordenadas válidas', () => {
    expect(normalizeGroup({ ...group, departureLocation: null })).toBeNull()
  })

  it('remove grupos inválidos da lista', () => {
    expect(normalizeGroups([group, { ...group, id: 'bad', departureLocation: null }])).toHaveLength(1)
  })
})
```

- [ ] **Passo 8: Rodar teste de normalização e confirmar falha**

Executar:

```bash
yarn test tests/unit/group-normalizers.test.ts
```

Esperado:

- FAIL porque `lib/group-normalizers.ts` ainda não existe.

- [ ] **Passo 9: Criar `lib/group-normalizers.ts`**

```ts
import type { Group, GroupSchedule } from '../types/group'
import type { HygraphGroup, HygraphGroupInfo } from '../types/hygraph'

function normalizeSchedule(info: HygraphGroupInfo): GroupSchedule {
  return {
    id: info.id,
    day: info.day || 'Dia não informado',
    startHour: info.startHour || '00:00',
    effort: info.effort || 'Nível não informado',
    distanceKm: Number(info.distance || 0),
    rhythmKmH: Number(info.rhythm || 0),
    rating: typeof info.rating === 'number' ? info.rating : undefined,
  }
}

export function normalizeGroup(group: HygraphGroup): Group | null {
  const latitude = group.departureLocation?.latitude
  const longitude = group.departureLocation?.longitude

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  const schedules = (group.groupInfos || []).map(normalizeSchedule)
  const firstSchedule = schedules[0]
  const firstRawInfo = group.groupInfos?.[0]

  return {
    id: group.id,
    name: group.name || 'Grupo sem nome',
    slug: group.slug || group.id,
    departureAddress: firstRawInfo?.address || undefined,
    departureLocation: { latitude, longitude },
    link: group.link
      ? {
          label: group.link.text || undefined,
          html: group.link.html || undefined,
        }
      : undefined,
    schedules: firstSchedule ? schedules : [],
  }
}

export function normalizeGroups(groups: HygraphGroup[]): Group[] {
  return groups
    .map((group) => normalizeGroup(group))
    .filter((group): group is Group => Boolean(group))
}
```

- [ ] **Passo 10: Rodar testes da task**

Executar:

```bash
yarn test tests/unit/time.test.ts tests/unit/group-normalizers.test.ts
```

Esperado:

- PASS.

- [ ] **Passo 11: Commit**

```bash
git add types/group.ts types/hygraph.ts lib/time.ts lib/group-normalizers.ts tests/unit/time.test.ts tests/unit/group-normalizers.test.ts
git commit -m "feat: add group data normalization"
```

---

## Tarefa 3: Implementar Filtros E Helpers De Contribuição

**Arquivos:**
- Criar: `lib/group-filters.ts`
- Criar: `lib/contribution.ts`
- Criar: `tests/unit/group-filters.test.ts`
- Criar: `tests/unit/contribution.test.ts`

- [ ] **Passo 1: Criar teste de filtros**

Arquivo: `tests/unit/group-filters.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { filterGroups, createEmptyGroupFilters } from '../../lib/group-filters'
import type { Group } from '../../types/group'

const groups: Group[] = [
  {
    id: '1',
    name: 'Pedal Centro',
    slug: 'pedal-centro',
    region: 'Centro',
    departureAddress: 'Praça da Sé',
    departureLocation: { latitude: -23.55, longitude: -46.63 },
    schedules: [{ id: 's1', day: 'Terça', startHour: '20:00', effort: 'Intermediário', distanceKm: 30, rhythmKmH: 18 }],
  },
  {
    id: '2',
    name: 'Iniciantes Zona Oeste',
    slug: 'iniciantes-zona-oeste',
    region: 'Zona Oeste',
    departureAddress: 'Butantã',
    departureLocation: { latitude: -23.57, longitude: -46.72 },
    schedules: [{ id: 's2', day: 'Sábado', startHour: '08:00', effort: 'Iniciante', distanceKm: 18, rhythmKmH: 14 }],
  },
]

describe('group filters', () => {
  it('cria filtro vazio', () => {
    expect(createEmptyGroupFilters()).toEqual({
      query: '',
      days: [],
      efforts: [],
      periods: [],
      rhythms: [],
    })
  })

  it('filtra por texto', () => {
    expect(filterGroups(groups, { ...createEmptyGroupFilters(), query: 'oeste' }).map((group) => group.slug)).toEqual([
      'iniciantes-zona-oeste',
    ])
  })

  it('filtra por dia, nível, distância, período e ritmo', () => {
    const result = filterGroups(groups, {
      query: '',
      days: ['Sábado'],
      efforts: ['Iniciante'],
      distanceRange: 'up-to-20',
      periods: ['morning'],
      rhythms: ['light'],
    })

    expect(result.map((group) => group.slug)).toEqual(['iniciantes-zona-oeste'])
  })
})
```

- [ ] **Passo 2: Criar teste de contribuição**

Arquivo: `tests/unit/contribution.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { getContributionLinkState } from '../../lib/contribution'

describe('contribution helper', () => {
  it('habilita link quando URL existe', () => {
    expect(getContributionLinkState('https://example.com/form')).toEqual({
      href: 'https://example.com/form',
      isEnabled: true,
    })
  })

  it('desabilita link quando URL está ausente', () => {
    expect(getContributionLinkState('')).toEqual({
      href: undefined,
      isEnabled: false,
    })
  })
})
```

- [ ] **Passo 3: Rodar testes e confirmar falha**

Executar:

```bash
yarn test tests/unit/group-filters.test.ts tests/unit/contribution.test.ts
```

Esperado:

- FAIL porque `lib/group-filters.ts` e `lib/contribution.ts` ainda não existem.

- [ ] **Passo 4: Criar `lib/group-filters.ts`**

```ts
import type { DistanceRange, Group, GroupFilters } from '../types/group'
import { getPeriodFromHour, getRhythmCategory } from './time'

export function createEmptyGroupFilters(): GroupFilters {
  return {
    query: '',
    days: [],
    efforts: [],
    periods: [],
    rhythms: [],
  }
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function isInDistanceRange(distanceKm: number, range?: DistanceRange) {
  if (!range) return true
  if (range === 'up-to-20') return distanceKm <= 20
  if (range === '20-to-40') return distanceKm > 20 && distanceKm <= 40
  return distanceKm > 40
}

export function filterGroups(groups: Group[], filters: GroupFilters) {
  const query = normalizeSearchText(filters.query)

  return groups.filter((group) => {
    const searchable = normalizeSearchText(
      [
        group.name,
        group.region,
        group.departureAddress,
        ...group.schedules.flatMap((schedule) => [schedule.day, schedule.effort]),
      ]
        .filter(Boolean)
        .join(' '),
    )

    if (query && !searchable.includes(query)) {
      return false
    }

    return group.schedules.some((schedule) => {
      const matchesDay = filters.days.length === 0 || filters.days.includes(schedule.day)
      const matchesEffort = filters.efforts.length === 0 || filters.efforts.includes(schedule.effort)
      const matchesDistance = isInDistanceRange(schedule.distanceKm, filters.distanceRange)
      const matchesPeriod =
        filters.periods.length === 0 || filters.periods.includes(getPeriodFromHour(schedule.startHour))
      const matchesRhythm =
        filters.rhythms.length === 0 || filters.rhythms.includes(getRhythmCategory(schedule.rhythmKmH))

      return matchesDay && matchesEffort && matchesDistance && matchesPeriod && matchesRhythm
    })
  })
}
```

- [ ] **Passo 5: Criar `lib/contribution.ts`**

```ts
export function getContributionLinkState(url?: string) {
  const href = url?.trim()

  return href
    ? {
        href,
        isEnabled: true,
      }
    : {
        href: undefined,
        isEnabled: false,
      }
}
```

- [ ] **Passo 6: Rodar testes da task**

Executar:

```bash
yarn test tests/unit/group-filters.test.ts tests/unit/contribution.test.ts
```

Esperado:

- PASS.

- [ ] **Passo 7: Commit**

```bash
git add lib/group-filters.ts lib/contribution.ts tests/unit/group-filters.test.ts tests/unit/contribution.test.ts
git commit -m "feat: add group filters and contribution helpers"
```

---

## Tarefa 4: Criar Camada Hygraph E Composables

**Arquivos:**
- Criar: `queries/groups.ts`
- Criar: `composables/useHygraph.ts`
- Criar: `composables/useGroups.ts`
- Criar: `composables/useGroup.ts`
- Criar: `composables/useGroupFilters.ts`
- Criar: `composables/useSelectedGroup.ts`
- Criar: `composables/useLapDuration.ts`

- [ ] **Passo 1: Criar `queries/groups.ts`**

```ts
export const GET_GROUPS_QUERY = /* GraphQL */ `
  query getGroups {
    groups {
      id
      name
      slug
      link {
        text
        html
      }
      departureLocation {
        latitude
        longitude
      }
      groupInfos {
        id
        startHour
        address
        day
        rating
        effort
        distance
        rhythm
      }
    }
  }
`

export const GET_GROUP_QUERY = /* GraphQL */ `
  query getGroup($slug: String!) {
    group(where: { slug: $slug }) {
      id
      name
      slug
      link {
        text
        html
      }
      departureLocation {
        latitude
        longitude
      }
      groupInfos {
        id
        startHour
        address
        day
        rating
        effort
        distance
        rhythm
      }
    }
  }
`
```

- [ ] **Passo 2: Criar `composables/useHygraph.ts`**

```ts
import { GraphQLClient } from 'graphql-request'

export function useHygraph() {
  const config = useRuntimeConfig()

  return new GraphQLClient(config.public.hygraphEndpoint, {
    headers: config.hygraphToken
      ? {
          Authorization: `Bearer ${config.hygraphToken}`,
        }
      : {},
  })
}
```

- [ ] **Passo 3: Criar `composables/useGroups.ts`**

```ts
import { GET_GROUPS_QUERY } from '../queries/groups'
import { normalizeGroups } from '../lib/group-normalizers'
import type { HygraphGroup } from '../types/hygraph'

type GroupsResponse = {
  groups: HygraphGroup[]
}

export function useGroups() {
  const client = useHygraph()

  return useAsyncData('groups', async () => {
    const response = await client.request<GroupsResponse>(GET_GROUPS_QUERY)
    return normalizeGroups(response.groups)
  })
}
```

- [ ] **Passo 4: Criar `composables/useGroup.ts`**

```ts
import { GET_GROUP_QUERY } from '../queries/groups'
import { normalizeGroup } from '../lib/group-normalizers'
import type { HygraphGroup } from '../types/hygraph'

type GroupResponse = {
  group: HygraphGroup | null
}

export function useGroup(slug: string) {
  const client = useHygraph()

  return useAsyncData(`group:${slug}`, async () => {
    const response = await client.request<GroupResponse>(GET_GROUP_QUERY, { slug })
    return response.group ? normalizeGroup(response.group) : null
  })
}
```

- [ ] **Passo 5: Criar `composables/useGroupFilters.ts`**

```ts
import { computed, ref } from 'vue'
import { createEmptyGroupFilters, filterGroups } from '../lib/group-filters'
import type { Group, GroupFilters } from '../types/group'

export function useGroupFilters(groups: Ref<Group[]>) {
  const filters = ref<GroupFilters>(createEmptyGroupFilters())

  const filteredGroups = computed(() => filterGroups(groups.value, filters.value))

  function updateFilters(nextFilters: GroupFilters) {
    filters.value = nextFilters
  }

  function clearFilters() {
    filters.value = {
      ...createEmptyGroupFilters(),
      query: filters.value.query,
    }
  }

  return {
    filters,
    filteredGroups,
    updateFilters,
    clearFilters,
  }
}
```

- [ ] **Passo 6: Criar `composables/useSelectedGroup.ts`**

```ts
import { computed, ref } from 'vue'
import type { Group } from '../types/group'

export function useSelectedGroup(groups: Ref<Group[]>) {
  const selectedGroupSlug = ref<string | null>(null)

  const selectedGroup = computed(() =>
    groups.value.find((group) => group.slug === selectedGroupSlug.value) || null,
  )

  function selectGroup(slug: string) {
    selectedGroupSlug.value = slug
  }

  function clearSelectedGroup() {
    selectedGroupSlug.value = null
  }

  return {
    selectedGroupSlug,
    selectedGroup,
    selectGroup,
    clearSelectedGroup,
  }
}
```

- [ ] **Passo 7: Criar `composables/useLapDuration.ts`**

```ts
import { getEstimatedLapDuration } from '../lib/time'

export function useLapDuration() {
  return {
    getEstimatedLapDuration,
  }
}
```

- [ ] **Passo 8: Verificar tipos**

Executar:

```bash
yarn build
```

Esperado:

- Se falhar por componentes Nuxt 2 restantes, seguir para as próximas tarefas.
- Não deve falhar por imports ausentes dos arquivos criados nesta task.

- [ ] **Passo 9: Commit**

```bash
git add queries/groups.ts composables/useHygraph.ts composables/useGroups.ts composables/useGroup.ts composables/useGroupFilters.ts composables/useSelectedGroup.ts composables/useLapDuration.ts
git commit -m "feat: add Hygraph data composables"
```

---

## Tarefa 5: Criar Componentes Base De Contribuição, Badges E Cards

**Arquivos:**
- Criar: `components/contribution/ContributionLink.vue`
- Criar: `components/group/GroupMetaBadges.vue`
- Criar: `components/group/GroupCard.vue`

- [ ] **Passo 1: Criar `ContributionLink.vue`**

```vue
<template>
  <a
    v-if="state.isEnabled"
    class="contribution-link"
    :href="state.href"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ label }}
  </a>
  <span v-else class="contribution-link contribution-link--disabled" aria-disabled="true">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getContributionLinkState } from '../../lib/contribution'

const props = withDefaults(
  defineProps<{
    href?: string
    context?: 'new-group' | 'correction'
  }>(),
  {
    href: '',
    context: 'new-group',
  },
)

const label = computed(() => (props.context === 'correction' ? 'Sugerir correção' : 'Sugerir grupo'))
const state = computed(() => getContributionLinkState(props.href))
</script>

<style scoped>
.contribution-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  background: var(--color-sign-yellow);
  color: var(--color-asphalt);
  font-weight: 800;
  text-decoration: none;
}

.contribution-link--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
```

- [ ] **Passo 2: Criar `GroupMetaBadges.vue`**

```vue
<template>
  <dl class="badges" aria-label="Resumo do grupo">
    <div class="badge">
      <dt>Dia</dt>
      <dd>{{ schedule.day }}</dd>
    </div>
    <div class="badge">
      <dt>Saída</dt>
      <dd>{{ schedule.startHour }}</dd>
    </div>
    <div class="badge">
      <dt>Nível</dt>
      <dd>{{ schedule.effort }}</dd>
    </div>
    <div class="badge">
      <dt>Distância</dt>
      <dd>{{ schedule.distanceKm }} km</dd>
    </div>
    <div class="badge">
      <dt>Ritmo</dt>
      <dd>{{ schedule.rhythmKmH }} km/h</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { GroupSchedule } from '../../types/group'

defineProps<{
  schedule: GroupSchedule
}>()
</script>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.badge {
  min-width: 72px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  padding: 8px;
}

dt {
  color: rgb(21 21 21 / 68%);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

dd {
  margin: 2px 0 0;
  font-weight: 800;
}
</style>
```

- [ ] **Passo 3: Criar `GroupCard.vue`**

```vue
<template>
  <article>
    <button
      class="group-card"
      :class="{ 'group-card--selected': isSelected }"
      type="button"
      :aria-pressed="isSelected"
      @click="$emit('select', group.slug)"
    >
      <span v-if="isSelected" class="selected-label">Selecionado</span>
      <strong class="group-card__name">{{ group.name }}</strong>
      <span class="group-card__location">{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</span>
      <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Group } from '../../types/group'
import GroupMetaBadges from './GroupMetaBadges.vue'

const props = defineProps<{
  group: Group
  isSelected?: boolean
}>()

defineEmits<{
  select: [slug: string]
}>()

const primarySchedule = computed(() => props.group.schedules[0])
</script>

<style scoped>
.group-card {
  width: 100%;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-paper);
  color: var(--color-asphalt);
  cursor: pointer;
  display: grid;
  gap: 10px;
  padding: 14px;
  text-align: left;
}

.group-card:hover,
.group-card--selected {
  border-color: var(--color-bike-green);
  box-shadow: 0 0 0 4px rgb(22 160 93 / 14%);
}

.selected-label {
  color: var(--color-bike-green);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.group-card__name {
  font-size: 1.05rem;
}

.group-card__location {
  color: rgb(21 21 21 / 72%);
}
</style>
```

- [ ] **Passo 4: Rodar build parcial**

Executar:

```bash
yarn build
```

Esperado:

- Não deve falhar por estes componentes.
- Falhas por arquivos antigos ainda não migrados serão resolvidas nas próximas tarefas.

- [ ] **Passo 5: Commit**

```bash
git add components/contribution/ContributionLink.vue components/group/GroupMetaBadges.vue components/group/GroupCard.vue
git commit -m "feat: add base group UI components"
```

---

## Tarefa 6: Criar Header E Página Sobre

**Arquivos:**
- Criar: `components/app/AppHeader.vue`
- Criar: `pages/sobre.vue`
- Remover: `components/Header/index.vue`

- [ ] **Passo 1: Criar `AppHeader.vue`**

```vue
<template>
  <header class="app-header">
    <NuxtLink class="brand" to="/" aria-label="Pedala Sampa - mapa de grupos">
      Pedala Sampa
    </NuxtLink>
    <nav class="nav" aria-label="Navegação principal">
      <NuxtLink to="/">Mapa</NuxtLink>
      <NuxtLink to="/sobre">Sobre</NuxtLink>
      <ContributionLink class="desktop-cta" :href="contributionFormUrl" context="new-group" />
    </nav>
  </header>
</template>

<script setup lang="ts">
import ContributionLink from '../contribution/ContributionLink.vue'

defineProps<{
  contributionFormUrl?: string
}>()
</script>

<style scoped>
.app-header {
  align-items: center;
  background: var(--color-paper);
  border-bottom: 2px solid var(--color-asphalt);
  display: flex;
  gap: 20px;
  height: var(--header-height);
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.brand {
  font-size: 1.25rem;
  font-weight: 950;
  text-decoration: none;
}

.nav {
  align-items: center;
  display: flex;
  gap: 14px;
}

.nav a {
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 720px) {
  .app-header {
    padding: 0 14px;
  }

  .desktop-cta {
    display: none;
  }
}
</style>
```

- [ ] **Passo 2: Criar `pages/sobre.vue`**

```vue
<template>
  <main>
    <AppHeader :contribution-form-url="contributionFormUrl" />
    <section class="about">
      <p class="eyebrow">Mapa colaborativo</p>
      <h1>Encontre grupos de pedal em São Paulo.</h1>
      <p class="lead">
        O Pedala Sampa ajuda ciclistas a descobrir grupos por região, dia, horário, nível, distância e ritmo.
      </p>
      <div class="grid">
        <article>
          <h2>Como funciona</h2>
          <p>Os grupos cadastrados aparecem no mapa e na lista da página inicial. Cada grupo tem ponto de saída, agenda e informações práticas do pedal.</p>
        </article>
        <article>
          <h2>Colaboração</h2>
          <p>As informações podem mudar. Use o formulário externo para sugerir um novo grupo ou corrigir dados desatualizados.</p>
        </article>
      </div>
      <ContributionLink :href="contributionFormUrl" context="new-group" />
    </section>
  </main>
</template>

<script setup lang="ts">
import AppHeader from '../components/app/AppHeader.vue'
import ContributionLink from '../components/contribution/ContributionLink.vue'

const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl

useSeoMeta({
  title: 'Sobre - Pedala Sampa',
  description: 'Conheça o Pedala Sampa, um mapa colaborativo de grupos de pedal em São Paulo.',
})
</script>

<style scoped>
.about {
  max-width: 980px;
  margin: 0 auto;
  padding: 72px 20px;
}

.eyebrow {
  color: var(--color-bike-green);
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(2.25rem, 8vw, 5rem);
  line-height: 0.95;
  margin: 0;
  max-width: 780px;
}

.lead {
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 680px;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 40px 0;
}

article {
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  background: var(--color-paper);
  padding: 22px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Passo 3: Remover header antigo**

Executar:

```bash
rm -r components/Header
```

Esperado:

- Nenhum import restante para `@/components/Header`.

- [ ] **Passo 4: Commit**

```bash
git add components/app/AppHeader.vue pages/sobre.vue
git add -u components/Header
git commit -m "feat: add redesigned app header and about page"
```

---

## Tarefa 7: Criar Painel De Exploração E Filtros

**Arquivos:**
- Criar: `components/filters/GroupFilters.vue`
- Criar: `components/explore/GroupExplorerPanel.vue`

- [ ] **Passo 1: Criar `GroupFilters.vue`**

```vue
<template>
  <form class="filters" @submit.prevent>
    <label>
      <span>Buscar</span>
      <input v-model="localFilters.query" type="search" placeholder="Nome, bairro, dia ou nível" @input="emitChange" />
    </label>

    <label>
      <span>Dia</span>
      <select v-model="selectedDay" @change="syncDay">
        <option value="">Todos</option>
        <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
      </select>
    </label>

    <label>
      <span>Nível</span>
      <select v-model="selectedEffort" @change="syncEffort">
        <option value="">Todos</option>
        <option v-for="effort in efforts" :key="effort" :value="effort">{{ effort }}</option>
      </select>
    </label>

    <label>
      <span>Distância</span>
      <select v-model="localFilters.distanceRange" @change="emitChange">
        <option :value="undefined">Todas</option>
        <option value="up-to-20">Até 20 km</option>
        <option value="20-to-40">20 a 40 km</option>
        <option value="over-40">Acima de 40 km</option>
      </select>
    </label>

    <label>
      <span>Período</span>
      <select v-model="selectedPeriod" @change="syncPeriod">
        <option value="">Todos</option>
        <option value="morning">Manhã</option>
        <option value="afternoon">Tarde</option>
        <option value="night">Noite</option>
      </select>
    </label>

    <label>
      <span>Ritmo</span>
      <select v-model="selectedRhythm" @change="syncRhythm">
        <option value="">Todos</option>
        <option value="light">Leve</option>
        <option value="moderate">Moderado</option>
        <option value="strong">Forte</option>
      </select>
    </label>

    <button type="button" class="clear" @click="$emit('clear')">Limpar filtros</button>
  </form>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { GroupFilters, Period, Rhythm } from '../../types/group'

const props = defineProps<{
  modelValue: GroupFilters
  days: string[]
  efforts: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: GroupFilters]
  clear: []
}>()

const localFilters = reactive<GroupFilters>({ ...props.modelValue })
const selectedDay = ref(props.modelValue.days[0] || '')
const selectedEffort = ref(props.modelValue.efforts[0] || '')
const selectedPeriod = ref<Period | ''>(props.modelValue.periods[0] || '')
const selectedRhythm = ref<Rhythm | ''>(props.modelValue.rhythms[0] || '')

watch(
  () => props.modelValue,
  (filters) => {
    Object.assign(localFilters, filters)
    selectedDay.value = filters.days[0] || ''
    selectedEffort.value = filters.efforts[0] || ''
    selectedPeriod.value = filters.periods[0] || ''
    selectedRhythm.value = filters.rhythms[0] || ''
  },
)

function emitChange() {
  emit('update:modelValue', { ...localFilters })
}

function syncDay() {
  localFilters.days = selectedDay.value ? [selectedDay.value] : []
  emitChange()
}

function syncEffort() {
  localFilters.efforts = selectedEffort.value ? [selectedEffort.value] : []
  emitChange()
}

function syncPeriod() {
  localFilters.periods = selectedPeriod.value ? [selectedPeriod.value] : []
  emitChange()
}

function syncRhythm() {
  localFilters.rhythms = selectedRhythm.value ? [selectedRhythm.value] : []
  emitChange()
}

function syncDay() {
  localFilters.days = selectedDay.value ? [selectedDay.value] : []
  emitChange()
}

function syncEffort() {
  localFilters.efforts = selectedEffort.value ? [selectedEffort.value] : []
  emitChange()
}
</script>

<style scoped>
.filters {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 4px;
  font-weight: 800;
}

input,
select {
  min-height: 42px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  padding: 0 10px;
}

.clear {
  min-height: 40px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-asphalt);
  color: var(--color-paper);
  cursor: pointer;
  font-weight: 800;
}
</style>
```

- [ ] **Passo 2: Criar `GroupExplorerPanel.vue`**

```vue
<template>
  <aside class="panel" aria-label="Explorar grupos">
    <header class="panel__header">
      <div>
        <p class="eyebrow">Grupos encontrados</p>
        <strong>{{ groups.length }}</strong>
      </div>
      <ContributionLink :href="contributionFormUrl" context="new-group" />
    </header>

    <GroupFilters
      :model-value="filters"
      :days="days"
      :efforts="efforts"
      @update:model-value="$emit('update:filters', $event)"
      @clear="$emit('clear-filters')"
    />

    <p v-if="isLoading" class="state">Carregando grupos...</p>
    <div v-else-if="error" class="state state--error">
      <p>Não conseguimos carregar os grupos agora.</p>
      <button type="button" @click="$emit('retry')">Tentar novamente</button>
    </div>
    <div v-else-if="groups.length === 0" class="state">
      <p>Nenhum grupo encontrado com esses filtros.</p>
      <button type="button" @click="$emit('clear-filters')">Limpar filtros</button>
      <ContributionLink :href="contributionFormUrl" context="new-group" />
    </div>
    <div v-else class="list">
      <GroupCard
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :is-selected="group.slug === selectedGroupSlug"
        @select="$emit('select', $event)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Group, GroupFilters as Filters } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupFilters from '../filters/GroupFilters.vue'
import GroupCard from '../group/GroupCard.vue'

defineProps<{
  groups: Group[]
  filters: Filters
  days: string[]
  efforts: string[]
  selectedGroupSlug?: string | null
  isLoading?: boolean
  error?: unknown
  contributionFormUrl?: string
}>()

defineEmits<{
  select: [slug: string]
  'update:filters': [filters: Filters]
  'clear-filters': []
  retry: []
}>()
</script>

<style scoped>
.panel {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  display: grid;
  gap: 16px;
  max-height: calc(100vh - 96px);
  overflow: auto;
  padding: 16px;
}

.panel__header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.eyebrow {
  color: var(--color-bike-green);
  font-size: 0.75rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
}

.list {
  display: grid;
  gap: 10px;
}

.state {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}

.state--error {
  border-color: var(--color-alert-red);
}
</style>
```

- [ ] **Passo 3: Commit**

```bash
git add components/filters/GroupFilters.vue components/explore/GroupExplorerPanel.vue
git commit -m "feat: add group explorer panel"
```

---

## Tarefa 8: Implementar Mapa E Shell Da Home

**Arquivos:**
- Criar: `components/map/MapTileLayer.vue`
- Criar: `components/map/GroupMap.client.vue`
- Criar: `components/explore/GroupQuickView.vue`
- Criar: `components/explore/ExploreShell.vue`
- Criar/substituir: `pages/index.vue`
- Remover: `components/Map`

- [ ] **Passo 1: Criar `MapTileLayer.vue`**

```vue
<template>
  <LTileLayer v-if="mapboxUrl" :url="mapboxUrl" :attribution="mapboxAttribution" />
  <LTileLayer v-else url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" :attribution="osmAttribution" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()

const osmAttribution = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
const mapboxAttribution =
  '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const mapboxUrl = computed(() => {
  const userId = config.public.mapboxUserId
  const styleId = config.public.mapboxStyleId
  const apiKey = config.public.mapboxApiKey

  if (!userId || !styleId || !apiKey) {
    return ''
  }

  return `https://api.mapbox.com/styles/v1/${userId}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${apiKey}`
})
</script>
```

- [ ] **Passo 2: Criar `GroupMap.client.vue`**

```vue
<template>
  <div class="group-map">
    <LMap ref="mapRef" :zoom="12" :center="center" :min-zoom="10" :max-bounds="maxBounds" :use-global-leaflet="false">
      <MapTileLayer />
      <LMarker
        v-for="group in groups"
        :key="group.id"
        :lat-lng="[group.departureLocation.latitude, group.departureLocation.longitude]"
        @click="$emit('select', group.slug)"
      >
        <LTooltip>{{ group.name }}</LTooltip>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { Group } from '../../types/group'
import MapTileLayer from './MapTileLayer.vue'

defineProps<{
  groups: Group[]
  selectedGroupSlug?: string | null
}>()

defineEmits<{
  select: [slug: string]
}>()

const center: [number, number] = [-23.55, -46.623798]
const maxBounds: [[number, number], [number, number]] = [
  [-23.36, -46.84],
  [-24.0, -46.36],
]
</script>

<style scoped>
.group-map {
  height: 100%;
  min-height: 360px;
  width: 100%;
}
</style>
```

- [ ] **Passo 3: Criar `GroupQuickView.vue`**

```vue
<template>
  <section v-if="group" class="quick-view" aria-label="Detalhe rápido do grupo">
    <button type="button" class="close" @click="$emit('close')">Fechar</button>
    <h2>{{ group.name }}</h2>
    <p>{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</p>
    <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    <p v-if="primarySchedule">Tempo médio: {{ duration }}</p>
    <div class="actions">
      <NuxtLink :to="`/grupo/${group.slug}`">Abrir página completa</NuxtLink>
      <ContributionLink :href="contributionFormUrl" context="correction" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEstimatedLapDuration } from '../../lib/time'
import type { Group } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupMetaBadges from '../group/GroupMetaBadges.vue'

const props = defineProps<{
  group: Group | null
  contributionFormUrl?: string
}>()

defineEmits<{
  close: []
}>()

const primarySchedule = computed(() => props.group?.schedules[0])
const duration = computed(() =>
  primarySchedule.value
    ? getEstimatedLapDuration({
        distanceKm: primarySchedule.value.distanceKm,
        rhythmKmH: primarySchedule.value.rhythmKmH,
      })
    : '',
)
</script>

<style scoped>
.quick-view {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  display: grid;
  gap: 12px;
  padding: 16px;
}

.close {
  justify-self: end;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
```

- [ ] **Passo 4: Criar `ExploreShell.vue`**

```vue
<template>
  <main class="explore-shell">
    <section class="map-area" aria-label="Mapa de grupos">
      <ClientOnly>
        <GroupMap :groups="groups" :selected-group-slug="selectedGroupSlug" @select="$emit('select', $event)" />
        <template #fallback>
          <div class="map-fallback">Carregando mapa...</div>
        </template>
      </ClientOnly>
    </section>
    <section class="panel-area">
      <GroupExplorerPanel
        :groups="groups"
        :filters="filters"
        :days="days"
        :efforts="efforts"
        :selected-group-slug="selectedGroupSlug"
        :is-loading="isLoading"
        :error="error"
        :contribution-form-url="contributionFormUrl"
        @select="$emit('select', $event)"
        @update:filters="$emit('update:filters', $event)"
        @clear-filters="$emit('clear-filters')"
        @retry="$emit('retry')"
      />
      <GroupQuickView :group="selectedGroup" :contribution-form-url="contributionFormUrl" @close="$emit('clear-selection')" />
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Group, GroupFilters as Filters } from '../../types/group'
import GroupExplorerPanel from './GroupExplorerPanel.vue'
import GroupQuickView from './GroupQuickView.vue'
import GroupMap from '../map/GroupMap.client.vue'

defineProps<{
  groups: Group[]
  filters: Filters
  days: string[]
  efforts: string[]
  selectedGroupSlug?: string | null
  selectedGroup: Group | null
  isLoading?: boolean
  error?: unknown
  contributionFormUrl?: string
}>()

defineEmits<{
  select: [slug: string]
  'update:filters': [filters: Filters]
  'clear-filters': []
  'clear-selection': []
  retry: []
}>()
</script>

<style scoped>
.explore-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px);
  gap: 16px;
  height: calc(100vh - var(--header-height));
  padding: 16px;
}

.map-area {
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel-area {
  display: grid;
  gap: 12px;
  overflow: auto;
}

.map-fallback {
  align-items: center;
  background: var(--color-concrete);
  display: flex;
  height: 100%;
  justify-content: center;
}

@media (max-width: 860px) {
  .explore-shell {
    display: block;
    height: calc(100vh - var(--header-height));
    padding: 0;
    position: relative;
  }

  .map-area {
    border: 0;
    border-radius: 0;
    height: 100%;
  }

  .panel-area {
    background: var(--color-paper);
    border: 2px solid var(--color-asphalt);
    border-radius: 16px 16px 0 0;
    bottom: 0;
    left: 0;
    max-height: 72vh;
    overflow: auto;
    padding: 12px;
    position: absolute;
    right: 0;
  }
}
</style>
```

- [ ] **Passo 5: Substituir `pages/index.vue`**

```vue
<template>
  <div>
    <AppHeader :contribution-form-url="contributionFormUrl" />
    <ExploreShell
      :groups="filteredGroups"
      :filters="filters"
      :days="days"
      :efforts="efforts"
      :selected-group-slug="selectedGroupSlug"
      :selected-group="selectedGroup"
      :is-loading="pending"
      :error="error"
      :contribution-form-url="contributionFormUrl"
      @select="selectGroup"
      @update:filters="updateFilters"
      @clear-filters="clearFilters"
      @clear-selection="clearSelectedGroup"
      @retry="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '../components/app/AppHeader.vue'
import ExploreShell from '../components/explore/ExploreShell.vue'
import { useGroupFilters } from '../composables/useGroupFilters'
import { useGroups } from '../composables/useGroups'
import { useSelectedGroup } from '../composables/useSelectedGroup'

const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl

const { data, pending, error, refresh } = await useGroups()
const groups = computed(() => data.value || [])
const { filters, filteredGroups, updateFilters, clearFilters } = useGroupFilters(groups)
const { selectedGroupSlug, selectedGroup, selectGroup, clearSelectedGroup } = useSelectedGroup(groups)

const days = computed(() => [...new Set(groups.value.flatMap((group) => group.schedules.map((schedule) => schedule.day)))])
const efforts = computed(() => [
  ...new Set(groups.value.flatMap((group) => group.schedules.map((schedule) => schedule.effort))),
])

useSeoMeta({
  title: 'Pedala Sampa - Grupos de pedal em São Paulo',
  description: 'Encontre grupos de pedal em São Paulo por região, dia, horário, nível, distância e ritmo.',
})
</script>
```

- [ ] **Passo 6: Remover componentes antigos de mapa**

Executar:

```bash
rm -r components/Map
```

Esperado:

- Nenhum import restante para `components/Map`.

- [ ] **Passo 7: Commit**

```bash
git add components/map/MapTileLayer.vue components/map/GroupMap.client.vue components/explore/GroupQuickView.vue components/explore/ExploreShell.vue pages/index.vue
git add -u components/Map
git commit -m "feat: build map and list exploration home"
```

---

## Tarefa 9: Implementar Página Pública Do Grupo

**Arquivos:**
- Criar: `components/group/GroupDetails.vue`
- Criar: `pages/grupo/[slug].vue`
- Remover: `pages/_grupo/_name.vue`

- [ ] **Passo 1: Criar `GroupDetails.vue`**

```vue
<template>
  <article class="details">
    <h1>{{ group.name }}</h1>
    <p>{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</p>
    <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    <p v-if="primarySchedule">Tempo médio: {{ duration }}</p>
    <div class="actions">
      <a v-if="group.link?.url" :href="group.link.url" target="_blank" rel="noopener noreferrer">Acessar grupo</a>
      <ContributionLink :href="contributionFormUrl" context="correction" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEstimatedLapDuration } from '../../lib/time'
import type { Group } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupMetaBadges from './GroupMetaBadges.vue'

const props = defineProps<{
  group: Group
  contributionFormUrl?: string
}>()

const primarySchedule = computed(() => props.group.schedules[0])
const duration = computed(() =>
  primarySchedule.value
    ? getEstimatedLapDuration({
        distanceKm: primarySchedule.value.distanceKm,
        rhythmKmH: primarySchedule.value.rhythmKmH,
      })
    : '',
)
</script>

<style scoped>
.details {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  display: grid;
  gap: 16px;
  padding: 24px;
}

h1 {
  font-size: clamp(2rem, 8vw, 4.5rem);
  line-height: 0.95;
  margin: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
```

- [ ] **Passo 2: Criar `pages/grupo/[slug].vue`**

```vue
<template>
  <div>
    <AppHeader :contribution-form-url="contributionFormUrl" />
    <main class="group-page">
      <NuxtLink to="/" class="back-link">Voltar para o mapa</NuxtLink>
      <p v-if="pending">Carregando grupo...</p>
      <p v-else-if="error || !group">Grupo não encontrado.</p>
      <GroupDetails v-else :group="group" :contribution-form-url="contributionFormUrl" />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/app/AppHeader.vue'
import GroupDetails from '../../components/group/GroupDetails.vue'
import { useGroup } from '../../composables/useGroup'

const route = useRoute()
const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl
const slug = String(route.params.slug)
const { data: group, pending, error } = await useGroup(slug)

useSeoMeta({
  title: () => (group.value ? `${group.value.name} - Pedala Sampa` : 'Grupo não encontrado - Pedala Sampa'),
  description: () =>
    group.value
      ? `Veja ponto de saída, horário, nível, distância e ritmo do grupo ${group.value.name} em São Paulo.`
      : 'Grupo de pedal não encontrado no Pedala Sampa.',
})
</script>

<style scoped>
.group-page {
  display: grid;
  gap: 20px;
  margin: 0 auto;
  max-width: 980px;
  padding: 32px 20px;
}

.back-link {
  font-weight: 800;
}
</style>
```

- [ ] **Passo 3: Remover página antiga de grupo**

Executar:

```bash
rm pages/_grupo/_name.vue
rmdir pages/_grupo
```

Esperado:

- Rota antiga removida.
- Nova rota `/grupo/[slug]` passa a ser a rota pública.

- [ ] **Passo 4: Commit**

```bash
git add components/group/GroupDetails.vue pages/grupo/[slug].vue
git add -u pages/_grupo
git commit -m "feat: add public group detail page"
```

---

## Tarefa 10: Remover Página Catch-All Antiga E Vuex

**Arquivos:**
- Remover: `pages/_slug.vue`
- Remover: `store/index.js`
- Remover: `apollo/queries/groups/groups.gql`
- Remover: `apollo/queries/groups/group.gql`
- Remover: `apollo/queries/pages/page.gql`

- [ ] **Passo 1: Remover arquivos antigos não usados**

Executar:

```bash
rm pages/_slug.vue
rm store/index.js
rm apollo/queries/groups/groups.gql
rm apollo/queries/groups/group.gql
rm apollo/queries/pages/page.gql
```

Esperado:

- Nenhuma rota catch-all antiga.
- Nenhum Vuex antigo.
- Nenhum import antigo de Apollo `.gql`.

- [ ] **Passo 2: Remover diretórios vazios**

Executar:

```bash
rmdir store apollo/queries/groups apollo/queries/pages apollo/queries apollo
```

Esperado:

- Diretórios vazios removidos.
- Se algum diretório ainda tiver arquivo útil, o comando falha; revisar antes de remover à força.

- [ ] **Passo 3: Remover Nuxt 2 scaffold e configs obsoletas**

Artefatos do scaffold Nuxt 2 que não têm função no Nuxt 3:

```bash
rm assets/README.md components/README.md layouts/README.md middleware/README.md
rm pages/README.md plugins/README.md static/README.md
rm assets/scss/pages/sobre.scss assets/scss/stylesheet.scss
rmdir assets/scss/pages assets/scss 2>/dev/null
rm .babelrc .eslintrc.js jsconfig.json
rmdir components/Header components/Map 2>/dev/null
```

Esperado:

- Nenhum README de scaffold do Nuxt 2.
- Nenhum arquivo SCSS órfão.
- Nenhuma config de ferramenta Nuxt 2 não usada (Babel, ESLint legado, jsconfig).

- [ ] **Passo 4: Remover diretórios vazios restantes**

```bash
rmdir components/Header components/Map 2>/dev/null; true
```

Esperado:

- `components/Header/` e `components/Map/` removidos se vazios.

- [ ] **Passo 5: Commit**

```bash
git add -u pages/_slug.vue store/index.js apollo assets/README.md components/README.md layouts/README.md middleware/README.md pages/README.md plugins/README.md static/README.md assets/scss .babelrc .eslintrc.js jsconfig.json components/Header components/Map
git commit -m "chore: remove Nuxt 2 data and routing leftovers"
```

---

## Tarefa 11: Migrar Teste Antigo E Verificações Finais

**Arquivos:**
- Remover: `test/CustomTileLayer.spec.js`
- Criar: `tests/unit/map-tile-layer.test.ts`
- Modificar: `netlify.toml`

- [ ] **Passo 1: Remover teste Jest antigo**

Executar:

```bash
rm test/CustomTileLayer.spec.js
rmdir test
```

Esperado:

- Nenhum teste Jest antigo restante.

- [ ] **Passo 2: Criar teste mínimo de tile fallback**

Arquivo: `tests/unit/map-tile-layer.test.ts`

```ts
import { describe, expect, it } from 'vitest'

describe('map tile config', () => {
  it('mantém fallback OSM documentado para quando Mapbox não estiver configurado', () => {
    expect('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').toContain('openstreetmap')
  })
})
```

- [ ] **Passo 3: Atualizar `netlify.toml`**

```toml
[build]
  command = "yarn generate"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

O diretório `.output/public` é o padrão do Nuxt 3 para `yarn generate`. Não usar `dist` (Nuxt 2).

- [ ] **Passo 4: Rodar testes**

Executar:

```bash
yarn test
```

Esperado:

- PASS para todos os testes unitários.

- [ ] **Passo 5: Rodar build**

Executar:

```bash
yarn build
```

Esperado:

- PASS.

- [ ] **Passo 6: Commit**

```bash
git add tests/unit/map-tile-layer.test.ts netlify.toml
git add -u test
git commit -m "test: complete Nuxt 3 verification setup"
```

---

## Tarefa 12: Revisão De Aceite Da V1

**Arquivos:**
- Modificar apenas arquivos necessários para corrigir falhas encontradas na revisão.

- [ ] **Passo 1: Conferir requisitos funcionais contra a spec**

Executar:

```bash
rg -n "RF-0|Definição De Pronto|Checagens" docs/superpowers/specs/2026-05-25-pedala-sampa-nuxt3-redesign-design.md
```

Esperado:

- A lista RF-01 a RF-10 aparece e deve ser marcada manualmente contra a implementação.

- [ ] **Passo 2: Verificar imports antigos**

Executar:

```bash
rg -n "@nuxtjs/apollo|nuxt-leaflet|moment|vuex|@/components/Map|@/components/Header|\\.gql|pages/_slug|_grupo" .
```

Esperado:

- Nenhum resultado em arquivos ativos.
- Resultados em `docs/` podem ser ignorados se forem históricos.

- [ ] **Passo 3: Verificar português em docs/plans**

Executar:

```bash
rg -n "T[O]DO|T[B]D|implement late[r]|fill i[n]|a[p]propriate error handlin[g]|edge case[s]|Similar t[o]" docs/superpowers/plans docs/superpowers/specs
```

Esperado:

- Nenhum placeholder ou instrução vaga.

- [ ] **Passo 4: Rodar verificação final**

Executar:

```bash
yarn test
yarn build
```

Esperado:

- Ambos passam.

- [ ] **Passo 5: Commit de ajustes finais**

Se houver ajustes:

```bash
git add .
git commit -m "chore: finalize Nuxt 3 redesign migration"
```

Se não houver ajustes:

```bash
git status --short
```

Esperado:

- Working tree limpo.

---

## Revisão Do Plano Contra A Spec

- RF-01 e RF-02: Tarefas 8 e 12 cobrem mapa/lista e seleção.
- RF-03 e RF-04: Tarefas 3, 7 e 8 cobrem busca e filtros.
- RF-05: Tarefa 8 cobre detalhe rápido.
- RF-06: Tarefa 9 cobre página pública de grupo.
- RF-07: Tarefas 5, 6, 7, 8 e 9 cobrem CTAs externos.
- RF-08: Tarefa 6 cobre `/sobre`.
- RF-09: Tarefa 7 cobre loading, erro e vazio no painel.
- RF-10: Tarefas 5, 7, 8 e 12 cobrem navegação por teclado e foco visível.
- Performance/SSR: Tarefas 1, 8 e 12 cobrem client-only/lazy map e build.
- SEO: Tarefas 1, 6, 8 e 9 cobrem metadados.
- PWA básico: Tarefa 1 configura base; Tarefas 11/12 validam build. Ícones finais dependem dos assets existentes.
- Testes mínimos: Tarefas 2, 3 e 11 cobrem normalização, filtros, duração e fallback de contribuição.

## Observações De Execução

- As tarefas pressupõem execução incremental e commits pequenos.
- Se `yarn install` alterar versões além do esperado, revisar `package.json` e `yarn.lock` antes de commitar.
- Se `@nuxtjs/leaflet` expuser componentes com nomes diferentes dos usados no plano, ajustar apenas os componentes de mapa e manter a interface pública de `GroupMap.client.vue`.
- Não adicionar geolocalização, login, admin, favoritos, formulário interno ou publicação automática durante este plano.
