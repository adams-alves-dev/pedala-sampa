# ADR 0001 — Data layer encapsulado e build estático

**Status:** Aceito

**Data:** 2026-09-23

## Contexto

Os dados do Pedala Sampa (grupos de pedal) vivem no [Hygraph](https://hygraph.com/) (GraphCMS), acessados via GraphQL. Toda a UI do site — mapa, painel exploratório, filtros, página de grupo — precisa desses dados para funcionar.

A decisão de arquitetura era: **como** esses dados chegam à interface?

1. **Consultas em tempo real** — o site consulta o Hygraph a cada acesso (client-side ou via SSR rodando continuamente).
2. **Data layer encapsulado consultado no build** — camada dedicada busca e normaliza os dados durante o build; o site é gerado como HTML estático e servido de CDN.

## Decisão

Adotamos a opção 2, com dois pilares:

### Pilar 1 — Data layer encapsulado

A UI nunca acessa o Hygraph diretamente. O fluxo de dados é sempre:

```text
página → composable (useAsyncData) → query GraphQL → normalização → tipos tipados via props
```

- `queries/` — queries GraphQL do Hygraph (`groups.ts`, `curation.ts`).
- `composables/` — `useGroups`, `useGroup`, `useGroupFilters`, `useSelectedGroup` etc., que buscam via `useAsyncData` e expõem dados prontos.
- `lib/` — normalizadores e utilitários puros (`group-normalizers.ts`, `hygraph-response.ts`, `group-filters.ts`), testáveis em isolamento.
- `types/` — modelos tipados (`group.ts`, `hygraph.ts`) que desacoplam o modelo de domínio do formato do CMS.

Componentes recebem dados normalizados via props e emitem eventos; nenhum componente sabe de onde o dado vem. Se trocarmos Hygraph por outra fonte, só a camada muda.

### Pilar 2 — Consultas no build, site estático

O deploy usa `yarn generate`: as páginas são prerenderizadas e as consultas ao Hygraph acontecem **no build**, com o resultado "assado" no HTML estático publicado no Netlify (CDN).

As server routes (`server/api/`) — feedback e sugestões — viram [Netlify Functions](https://docs.netlify.com/functions/overview/) e são a única parte genuinamente dinâmica do site.

## Motivação

1. **O domínio não exige tempo real.** Grupos de pedal mudam raramente e por curadoria manual. A "frescura" de uma consulta ao vivo não justifica o custo de infraestrutura; quando o conteúdo muda, um novo build resolve — e o deploy é automático no Netlify.
2. **Site estático = CDN barata e rápida.** HTML pronto no primeiro load, sem servidor aceso, sem custo por request, sem loading state para o conteúdo principal. Consultas em tempo real exigiriam SSR rodando 24/7 ou chamadas do browser direto ao CMS.
3. **Segurança.** Com a camada encapsulada, credenciais (token do Hygraph) e lógica de API ficam no ambiente de build ou em server routes. Em consultas client-side em tempo real, o endpoint e eventuais tokens ficariam expostos no browser.
4. **Testabilidade.** A camada de dados é testada em isolamento no [Vitest](https://vitest.dev/) (normalizadores, filtros, parsing de resposta), sem precisar de DOM ou de rede.
5. **SEO e primeira impressão.** O HTML chega completo do CDN — conteúdo e estrutura já presentes no primeiro render, sem hidratação bloqueante de dados.

## Consequências

### Positivas

- Performance e custo previsíveis (CDN, cache, zero servidor persistente).
- Superfície de ataque reduzida (nenhuma credencial no bundle client).
- Data layer coberto por testes unitários; troca de fonte de dados sem tocar componentes.
- Simples de operar: `yarn generate` → `.output/public` → Netlify.

### Tradeoffs aceitos

- **Dado defasado até o próximo build.** Atualizações no Hygraph só aparecem no site após um novo deploy (automatizado a cada merge em `main`).
- Conteúdo não é incremental: qualquer mudança reclama um rebuild completo (barato no tamanho atual do site).

### Padrão híbrido para as exceções

Onde a interação exige dado ao vivo, o projeto usa casca estática + busca no client:

- A página de sugestão/correção é prerenderizada como casca e a busca de grupos existentes acontece só no client (`components/contribution/SuggestionUpdateForm.vue`).
- Formulários (feedback/sugestões) falam com server routes (Netlify Functions), que encapsulam notificação, rate limit e Turnstile.

## Alternativas consideradas

| Alternativa | Por que foi rejeitada |
| --- | --- |
| Consultas em tempo real client-side | Endpoint do CMS exposto no browser; loading states para o conteúdo principal; custo por request; dependência de rede do usuário |
| SSR 24/7 (servidor sempre aceso) | Custo e operação de servidor contínuo sem necessidade — o domínio não precisa de dados ao vivo |
| Componentes consultando o Hygraph diretamente | Acoplamento da UI ao CMS; impossibilita testar dados em isolamento e trocar de fonte sem reescrever componentes |
| Full static sem camada de dados | Prerenderiza, mas deixa as queries espalhadas pelas páginas — menos testável e mais difícil de evoluir |

## Referências

- Spec do redesign: `docs/superpowers/specs/2026-05-25-pedala-sampa-nuxt3-redesign-design.md` (§10 — Arquitetura Técnica)
- Plano de implementação: `docs/superpowers/plans/2026-05-26-pedala-sampa-nuxt3-redesign.md`
- Configuração de deploy: `netlify.toml`
