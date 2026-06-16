# Curadoria de sugestões da comunidade

Visitantes podem **sugerir um grupo novo**, **sugerir correção** de um grupo existente ou
**solicitar a remoção** de um grupo (ex.: o organizador não quer o pedal exposto no site).
Nada vai ao ar direto: toda ação vira uma entry `Suggestion` em **DRAFT** no Hygraph, que você
revisa e aplica (ou rejeita) manualmente.

## 1. Criar o model `Suggestion` no Hygraph (uma vez)

No Hygraph, em **Schema** (nomes em inglês, consistentes com o model `Group`):

1. Crie as **Enumerations**:
   - `SuggestionType` com os valores `CREATE`, `UPDATE`, `DELETE`
   - `SuggestionStatus` com os valores `PENDING`, `APPROVED`, `REJECTED`
2. Crie o **Model** `Suggestion` (API ID `Suggestion`, plural `suggestions`) com os campos:

   | Campo | Tipo no Hygraph | Config |
   |---|---|---|
   | `type` | Enumeration → `SuggestionType` | obrigatório |
   | `payload` | JSON Editor | dados propostos pelo usuário; vazio em DELETE |
   | `group` | Reference → `Group` (one-way, to one) | preenchido em UPDATE/DELETE |
   | `justification` | Single line text (ou Multi line) | obrigatório |
   | `contactEmail` | Single line text | opcional |
   | `reviewStatus` | Enumeration → `SuggestionStatus` | **default `PENDING`** (`status` é palavra reservada no Hygraph) |

3. Em **Project settings → Access → Permanent Auth Tokens**, crie (ou ajuste) o token usado
   pelo site com **Content API permissions mínimas**:
   - `Suggestion`: somente **Create** (stage Draft)
   - `Group` e `GroupInfo`: somente **Read** (stage Published)
   - Nenhuma permissão de update, delete ou publish via API.

   Cole o valor em `GRAPHQL_TOKEN` nas variáveis de ambiente do Netlify (e no `.env` local).

## 2. Fluxo de revisão

> A transcrição manual abaixo pode ser automatizada pela CLI — veja **Curadoria assistida
> (CLI)**. Esta seção descreve o que a CLI faz por baixo (e o passo a passo se preferir o Studio).

As sugestões chegam como entries `Suggestion` em DRAFT, com `reviewStatus = PENDING`:

- **CREATE aprovada** — copie os campos do `payload` para uma entry nova no model `Group`
  (e o agendamento para `GroupInfo`), publique, e marque a sugestão como `APPROVED`.
- **UPDATE aprovada** — o `payload` contém **apenas os campos alterados** (diff). Aplique-os
  na entry referenciada em `group`, publique, e marque `APPROVED`.
- **DELETE aprovada** — despublique (ou arquive) a entry referenciada em `group` e marque
  `APPROVED`. Pedidos do próprio organizador do pedal têm prioridade — o formulário orienta a
  pessoa a se identificar na justificativa.
- **Recusada** — marque `REJECTED` (se quiser registrar o motivo, anote no fim da
  `justification`). Se `contactEmail` foi preenchido, dá para avisar a pessoa.

Campos do `payload` (chaves possíveis): `name`, `linkUrl`, `address`, `day`, `startHour`,
`effort`, `distanceKm`, `rhythmKmH`, `latitude`, `longitude`. O site só permite sugerir um
agendamento por vez — agendas múltiplas continuam sendo editadas direto no Hygraph.

## Curadoria assistida (CLI)

Para evitar a transcrição manual da seção acima, há uma CLI local (`scripts/curate.ts`) que lê
as sugestões pendentes e cria/atualiza `Group`/`GroupInfo` por você — **sempre em DRAFT**. O
publish final continua manual no Studio (um checkpoint para conferir antes de ir ao ar).

**Pré-requisito — token de curadoria (uma vez):** crie um segundo Permanent Auth Token no
Hygraph (Content API), separado do `GRAPHQL_TOKEN` público, com permissões:

- `Suggestion`: Read + Update (stage Draft)
- `Group`: Read (Draft+Published) + Create + Update (stage Draft)
- `GroupInfo`: Read (Draft+Published) + Create + Update (stage Draft)
- **Sem Publish, Unpublish ou Delete** — daí o publish/unpublish final ser manual.

Copie `.env.curation.example` para `.env.curation` (gitignored) e cole o
`HYGRAPH_CURATION_TOKEN` — o endpoint é reaproveitado do `.env` do projeto.

**Uso:**

```bash
yarn curate            # dry-run: lista as pendentes e o que faria (não grava nada)
yarn curate --apply    # interativo: [a]plicar / [p]ular / [r]ejeitar por sugestão
yarn curate --id <id>  # restringe a uma sugestão específica
```

Para cada sugestão a CLI revalida o `payload` (o mesmo Zod do site) e então:

- **CREATE** — gera o `slug` (com checagem de colisão), cria o `Group` e, se a agenda vier
  completa, o `GroupInfo` aninhado; marca `APPROVED`. Sem agenda completa, cria só o grupo e
  avisa para completar o `GroupInfo` no Studio.
- **UPDATE** — aplica o diff: campos do grupo no `Group`, campos de agenda no primeiro
  `GroupInfo` (avisa se houver mais de um); marca `APPROVED`.
- **DELETE** — marca `APPROVED` e lista o grupo no resumo final para você **despublicar no
  Studio** (a CLI não tem permissão de unpublish, por segurança).

Ao final, a CLI imprime o que precisa de **publish/unpublish manual no Studio**. Rejeições
(`[r]`) marcam `REJECTED` sem tocar no catálogo.

> **Se algo falhar no meio de um CREATE:** a CLI cria o `Group` e só então marca a sugestão
> como `APPROVED`. Se a marcação falhar logo depois (rede, permissão), o grupo já existe mas a
> sugestão segue `PENDENTE` — a CLI avisa citando o slug criado. Marque essa sugestão como
> `APPROVED` no Studio **antes de rodar de novo**, senão a próxima execução cria um grupo
> duplicado (com slug `-2`). UPDATE é idempotente, então re-rodar é seguro.

## 3. Notificação (opcional, recomendado)

Em **Project settings → Webhooks**, crie um webhook disparado em **Entry created** do model
`Suggestion` apontando para um serviço de notificação (ex.: Zapier/Make → e-mail, ou um webhook
do Slack). Assim você fica sabendo de cada sugestão sem precisar abrir o Hygraph.

## 4. Proteções ativas no site

- **Validação** (Zod) e sanitização de HTML no server route `POST /api/suggestions`.
- **Honeypot** no formulário (bots que preenchem o campo escondido são ignorados em silêncio).
- **Rate limit** por IP em memória — em serverless vale por instância da function, é uma
  barreira contra rajadas, não uma garantia global (evolução: Upstash Redis).
- **Cloudflare Turnstile** atrás de feature flag: defina `TURNSTILE_ENABLED=true`,
  `TURNSTILE_SECRET_KEY` e `NUXT_PUBLIC_TURNSTILE_SITE_KEY` quando tiver as chaves.
