# Post 3 — Arquitetura

**Tema**: trade-offs de Jamstack explicados por consequência, não por buzzword.
**Objetivo**: mostrar raciocínio de arquitetura — inclusive o custo escondido da escolha.
**Imagem**: carrossel de 6 slides (`slides/post-3-slides.html`).

---

## Texto para colar

```
Meu site é prerenderizado. Todas as páginas viram HTML estático no build.

Isso significa que um grupo novo cadastrado no CMS simplesmente não existe. A página dele dá 404.

Não é bug. É a consequência direta da arquitetura — e vale a pena entender por quê, porque quase todo tutorial de Jamstack para de contar a história antes dessa parte.

O Nuxt roda o prerender com crawlLinks: true. Ele começa na home, segue todos os links que encontra e gera um HTML para cada rota que descobriu. É isso que deixa o site rápido: quando o usuário chega, não tem servidor renderizando nada.

Mas repare no tempo verbal. Ele descobriu as rotas NO BUILD.

Grupo cadastrado no Hygraph depois disso = rota que nunca foi visitada pelo crawler = arquivo que não existe no dist.

A solução não está em lugar nenhum do repositório: é um webhook do Hygraph apontando para o build hook da Netlify. Publicou conteúdo, dispara build. Infraestrutura invisível no código e requisito absoluto de funcionamento.

Achei isso importante o suficiente para virar documentação, porque é exatamente o tipo de coisa que some quando alguém assume o projeto.

Outras decisões da mesma arquitetura:

→ Leitura pública vai direto do browser para o Hygraph. Escrita, nunca. Todo POST passa por uma server route, porque o token de escrita não pode existir no bundle do client. A regra está escrita como comentário no composable, para ninguém "otimizar" isso depois.

→ O endpoint de um grupo responde com max-age=60, s-maxage=300, stale-while-revalidate=600. O formulário de correção não precisa de dado fresquíssimo, e cada cache miss custa uma chamada autenticada ao CMS.

→ As páginas de formulário são casca estática prerenderizada + fetch só no client. O HTML é sempre o mesmo; o dado do grupo chega depois.

E duas armadilhas de Leaflet com SSR, que custaram tempo:

1. Importar o Leaflet como valor quebra o SSR — ele toca em window na avaliação do módulo. No escopo do módulo só entram tipos; o import real é tardio, dentro do componente .client.

2. Os estilos do pin não podem ser scoped. O Leaflet renderiza marcadores fora da árvore do componente, então o atributo de escopo do Vue nunca chega neles.

O mapa, aliás, é Leaflet com tiles do CARTO. Sem API key, sem cota, sem cartão de crédito.

Se eu tivesse que mudar uma coisa hoje: trocar o rebuild inteiro por ISR via routeRules. Publicar um grupo não deveria custar um build do site todo.

🔗 https://pedalasampa.netlify.app
🔗 https://github.com/adams-alves-dev/pedala-sampa

#nuxt #jamstack #arquitetura #frontend #webdev
```

---

## Variante curta (~700 caracteres)

```
Meu site é prerenderizado. Um grupo novo no CMS dá 404.

Não é bug — é a consequência da arquitetura.

O Nuxt roda prerender com crawlLinks: começa na home, segue os links e gera um HTML por rota descoberta. Repare no tempo verbal: descobriu NO BUILD.

Conteúdo publicado depois = rota que o crawler nunca visitou = arquivo que não existe.

A solução não está no repositório: webhook do CMS → build hook da Netlify. Publicou, dispara build.

Infraestrutura invisível no código e requisito absoluto de funcionamento. É o tipo de coisa que some quando alguém assume o projeto — por isso virou documentação.

#nuxt #jamstack #webdev
```

---

## Carrossel — 6 slides

| # | Conteúdo |
|---|---|
| 1 | **Capa** — "Prerender é rápido. Também é uma foto congelada." |
| 2 | **Os dois caminhos do dado** — browser → CMS (leitura) / browser → server route → CMS (escrita), com o motivo: o token |
| 3 | **O problema** — linha do tempo: build → grupo publicado → 404 |
| 4 | **A solução** — webhook Hygraph → build hook Netlify (e o aviso: mora fora do repo) |
| 5 | **Cache** — o header `Cache-Control` com o comentário real do código |
| 6 | **Leaflet × SSR** — as duas armadilhas + fecho com links |

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| Prerender com `crawlLinks` | `nuxt.config.ts:57-63` — `nitro: { preset: 'netlify', prerender: { crawlLinks: true, routes: ['/'] } }` |
| Server routes viram Netlify Functions | `nuxt.config.ts:55-56` (comentário) e `netlify.toml` |
| Webhook Hygraph → build hook | Configuração externa ao repositório (Hygraph + Netlify). **Não há arquivo que prove isso** — é a peça de infra fora do código |
| Leitura direto do client | `composables/useHygraph.ts` (endpoint público) |
| Escrita só via server route | `composables/useSuggestions.ts` e `useFeedback.ts` (comentário explícito) |
| Cache do endpoint de grupo | `server/api/groups/[slug].get.ts:78-84` — *"o form de correção não precisa de dado fresquíssimo e cada miss custa uma chamada autenticada ao Hygraph"* |
| Casca estática + fetch no client | `components/contribution/SuggestionUpdateForm.vue:94` — `useAsyncData(..., { server: false })` |
| Leaflet como valor quebra o SSR | `components/contribution/LocationPicker.client.vue:40` — *"só tipos no escopo do módulo: importar o leaflet como valor quebra o SSR"* |
| Estilos do pin não podem ser scoped | `components/map/GroupMap.client.vue:205` — *"Leaflet renders markers/containers outside the scoped tree, so these are global"* |
| Tiles CARTO sem API key | `components/map/MapTileLayer.vue` — `basemaps.cartocdn.com`, atribuição OSM + CARTO |
| ISR como evolução | Avaliação própria, apresentada no post como opinião ("se eu tivesse que mudar") — não é decisão tomada |
