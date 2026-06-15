# Pedala Sampa

[![Netlify Status](https://api.netlify.com/api/v1/badges/c841a0e7-0c5d-4b2b-a216-b6272e234cb9/deploy-status)](https://app.netlify.com/sites/pedalasampa/deploys)

> :bicyclist: Descubra os grupos de pedal perto de você na cidade de São Paulo :mountain_bicyclist:

**Pedala Sampa** é um mapa colaborativo que ajuda ciclistas de **São Paulo** a encontrar grupos de pedal por região, dia, horário, nível, distância e ritmo — perto de casa ou do trabalho.

🔗 **Produção:** [pedalasampa.netlify.app](https://pedalasampa.netlify.app)

> `#bike` `#micromobilidade` `#mapacolaborativo`

## Sobre

O projeto passou por uma **migração para Nuxt 3** e um **redesign completo** (direção _wayfinding_ — inspirada na sinalização urbana). Principais características:

- 🗺️ **Mapa-foco** — mapa interativo (Leaflet) com os pontos de saída dos grupos.
- 🔎 **Filtros** — explore por região, dia, horário, nível, distância e ritmo.
- 📄 **Página de grupo** — detalhes de cada grupo (agenda, ponto de saída, métricas).
- 🎨 **Dois temas** — _Ciclovia_ (claro, padrão) e _Noturno_ (escuro).
- ♿ **Acessibilidade** — foco visível, navegação por teclado e `prefers-reduced-motion`.
- 🤝 **Colaborativo** — qualquer pessoa pode sugerir novos grupos ou correções.

## Stack

- [Nuxt 3](https://nuxt.com/) + [Vue 3](https://vuejs.org/) + TypeScript
- [Leaflet](https://leafletjs.com/) (`@nuxtjs/leaflet`) para o mapa
- [Hygraph](https://hygraph.com/) (GraphQL) como CMS dos grupos, via `graphql-request`
- [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org/) para os temas
- [Vitest](https://vitest.dev/) + [`@nuxt/test-utils`](https://nuxt.com/docs/getting-started/testing) para testes
- ESLint (`@nuxt/eslint`) e `vue-tsc` para qualidade/tipos
- Deploy estático no [Netlify](https://www.netlify.com/)

## Como rodar

> Requer **Node 22** (≥ 20.19) e [Yarn](https://yarnpkg.com/).

```bash
# instalar dependências
yarn install

# ambiente de desenvolvimento (http://localhost:3000)
yarn dev
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
# Endpoint GraphQL do Hygraph (já tem um fallback público no nuxt.config)
HYGRAPH_ENDPOINT=
# Token do Hygraph (apenas se o conteúdo for protegido)
GRAPHQL_TOKEN=
# URL do formulário de contribuição (novo grupo / correção)
NUXT_PUBLIC_CONTRIBUTION_FORM_URL=
```

## Scripts

| Comando             | Descrição                            |
| ------------------- | ------------------------------------ |
| `yarn dev`          | Servidor de desenvolvimento          |
| `yarn build`        | Build de produção (SSR/Nitro)        |
| `yarn generate`     | Geração estática (usado no deploy)   |
| `yarn preview`      | Preview do build local               |
| `yarn lint`         | ESLint (checagem)                    |
| `yarn lint:fix`     | ESLint corrigindo o que dá           |
| `yarn format`       | Prettier (escreve nos arquivos)      |
| `yarn format:check` | Prettier (só checa)                  |
| `yarn typecheck`    | Checagem de tipos (`nuxt typecheck`) |
| `yarn test`         | Testes (Vitest)                      |

## Estrutura

```
components/   # UI por domínio (app, map, explore, group, contribution, ui)
composables/  # lógica reutilizável (filtros, fetch de grupos)
pages/        # rotas: / (mapa), /about, /group/[slug]
layouts/      # layout padrão (header)
queries/      # queries GraphQL do Hygraph
lib/ types/   # utilitários e tipos
assets/css/   # estilos globais e de componentes
tests/        # testes unitários (Vitest)
docs/redesign/# spec e handoff do redesign
```

## Deploy

Deploy contínuo no **Netlify** a partir da branch de produção:

- Comando: `yarn generate` · Publicação: `.output/public`
- `NODE_VERSION = "22"` fixado no `netlify.toml`

## Versionamento e releases

O projeto segue **[SemVer](https://semver.org/)** (a partir de `1.0.0`) com
releases automatizados pelo **release-please** a partir de [Conventional Commits](https://www.conventionalcommits.org/).
O histórico de mudanças fica no [`CHANGELOG.md`](CHANGELOG.md) (gerado
automaticamente). Padrão de commits, hooks de qualidade e a rotina de
lançamento estão documentados em **[`CONTRIBUTING.md`](CONTRIBUTING.md)**.

## Contribuir

Quer adicionar um grupo ou corrigir uma informação? Use o formulário de contribuição no próprio site (botões _Sugerir grupo_ / _Sugerir correção_).

Quer contribuir com **código**? Veja o **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Desenvolvedor :computer:

- **Adams Alves** — [github.com/adamsalves](https://github.com/adamsalves)
- Contato: [linkedin.com/in/adams-alves](https://www.linkedin.com/in/adams-alves/)

## Apoie no Ko-fi :raised_hands: :coffee:

- [ko-fi.com/adamsalves](https://ko-fi.com/adamsalves)
