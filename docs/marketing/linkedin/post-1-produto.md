# Post 1 — O produto (abertura da série)

**Tema**: o problema real e o produto que resolve.
**Objetivo**: porta de entrada. É o post mais acessível da série — abre o caminho para os 4 seguintes.
**Imagem**: `exports/01-home-desktop-ciclovia.png` (principal) + `exports/02-home-desktop-noturno.png`.

---

## Texto para colar

```
São Paulo tem dezenas de grupos de pedal saindo toda semana.

Descobrir qual passa perto de você, no dia que você pode e no ritmo que você aguenta? Isso não existia em lugar nenhum.

A informação está espalhada em stories que somem em 24h, grupos de WhatsApp fechados e perfis que postam o ponto de encontro em cima da hora. Se você não conhece alguém que já pedala, você simplesmente não entra.

Então eu construí o Pedala Sampa: um mapa colaborativo dos grupos de pedal da cidade.

Você abre e vê os pontos de saída no mapa. Filtra por dia da semana, nível, distância, período do dia e ritmo — combinados. Clica num grupo e vê o endereço exato de onde ele sai, o horário e o link de contato.

Sem login. Sem cadastro. Sem app para instalar.

E a parte que mais me importa: qualquer pessoa pode sugerir um grupo que está faltando, corrigir um dado errado ou adicionar um novo horário. Também sem criar conta. Toda contribuição passa por revisão antes de ir ao ar.

Porque um mapa de grupos de pedal só continua verdadeiro se quem pedala puder consertá-lo.

O projeto é open source e roda em Nuxt 3, com Hygraph de CMS e deploy na Netlify.

Nos próximos posts eu abro o capô: o design system que faz o site parecer sinalização de rua, por que um site prerenderizado precisa de um webhook para funcionar, como aceitar contribuição de desconhecido sem virar alvo de spam, e como saíram 5 versões em 8 dias.

Se você pedala em SP, dá uma olhada — e me conta qual grupo está faltando.

🔗 https://pedalasampa.netlify.app

#frontend #nuxt #vuejs #opensource #ciclismo
```

---

## Variante curta (~600 caracteres)

```
São Paulo tem dezenas de grupos de pedal saindo toda semana. Descobrir qual passa perto de você, no dia que você pode e no ritmo que você aguenta? Isso não existia.

A informação vive em stories que somem e grupos de WhatsApp fechados. Quem não conhece alguém, não entra.

Construí o Pedala Sampa: mapa colaborativo dos grupos de pedal da cidade. Filtra por dia, nível, distância, período e ritmo. Sem login, sem app.

E qualquer pessoa pode sugerir um grupo que falta ou corrigir um dado errado — também sem conta.

Open source, em Nuxt 3.

🔗 https://pedalasampa.netlify.app

#frontend #nuxt #opensource
```

---

## Imagens

| Ordem | Arquivo | Legenda sugerida |
|---|---|---|
| 1 | `exports/01-home-desktop-ciclovia.png` | O mapa com os pontos de saída e o carrossel de grupos |
| 2 | `exports/02-home-desktop-noturno.png` | O mesmo mapa no tema Noturno |

Se for publicar uma imagem só, use a **01**. É a tela que explica o produto sem legenda.

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| Filtros por dia, nível, distância, período e ritmo | `lib/group-filters.ts`, `lib/filter-options.ts` |
| Sem login / sem cadastro | Não há rota de auth; `pages/` tem 10 rotas, nenhuma de sessão |
| 4 fluxos de contribuição sem conta | `pages/contribute/*`, `server/api/suggestions.post.ts` |
| Revisão antes de ir ao ar | Sugestões entram como `PENDING` em stage DRAFT — `docs/curation.md` |
| Nuxt 3 + Hygraph + Netlify | `package.json`, `nuxt.config.ts` (`nitro.preset: 'netlify'`) |
| Repositório público | https://github.com/adams-alves-dev/pedala-sampa |

⚠️ **Conferir antes de publicar**: o número de grupos no mapa é dado vivo (eram 14 na captura de
29/07/2026). O texto do post não cita o número justamente para não envelhecer — se você quiser
citá-lo, confira no site primeiro.
