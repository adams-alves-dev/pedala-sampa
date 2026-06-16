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

## 3. Notificação (opcional, recomendado)

O site já avisa **no Discord** a cada nova sugestão, sem depender do Studio. Crie um **webhook**
num canal do Discord (canal → **Editar** → **Integrações** → **Webhooks** → **Novo webhook** →
copiar a URL) e defina `DISCORD_WEBHOOK_URL` no `.env` local e nas variáveis do Netlify. Cada
sugestão dispara uma mensagem com tipo, grupo, justificativa e contato. Sem a variável, o aviso
fica desligado (não quebra nada).

> O aviso sai do próprio endpoint `POST /api/suggestions` em modo _fire-and-forget_: se o Discord
> falhar, a sugestão ainda é registrada normalmente.

**Alternativa — webhook do Hygraph:** para notificar também entries criadas direto no Studio
(fora do formulário), crie em **Project settings → Webhooks** um webhook em **Entry created** do
model `Suggestion` apontando para um serviço (ex.: Zapier/Make → e-mail ou Slack).

## 4. Proteções ativas no site

- **Validação** (Zod) e sanitização de HTML no server route `POST /api/suggestions`.
- **Honeypot** no formulário (bots que preenchem o campo escondido são ignorados em silêncio).
- **Rate limit** por IP em memória — em serverless vale por instância da function, é uma
  barreira contra rajadas, não uma garantia global (evolução: Upstash Redis).
- **Cloudflare Turnstile** atrás de feature flag: defina `TURNSTILE_ENABLED=true`,
  `TURNSTILE_SECRET_KEY` e `NUXT_PUBLIC_TURNSTILE_SITE_KEY` quando tiver as chaves.
