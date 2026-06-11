# Curadoria de sugestões da comunidade

Visitantes podem **sugerir um grupo novo**, **sugerir correção** de um grupo existente ou
**solicitar a remoção** de um grupo (ex.: o organizador não quer o pedal exposto no site).
Nada vai ao ar direto: toda ação vira uma entry `Sugestao` em **DRAFT** no Hygraph, que você
revisa e aplica (ou rejeita) manualmente.

## 1. Criar o model `Sugestao` no Hygraph (uma vez)

No Hygraph, em **Schema**:

1. Crie as **Enumerations**:
   - `SugestaoTipo` com os valores `CREATE`, `UPDATE`, `DELETE`
   - `SugestaoStatus` com os valores `PENDENTE`, `APROVADA`, `REJEITADA`
2. Crie o **Model** `Sugestao` (API ID `Sugestao`, plural `sugestoes`) com os campos:

   | Campo | Tipo no Hygraph | Config |
   |---|---|---|
   | `tipo` | Enumeration → `SugestaoTipo` | obrigatório |
   | `payload` | JSON Editor | dados propostos pelo usuário; vazio em DELETE |
   | `alvo` | Reference → `Group` (one-way, to one) | preenchido em UPDATE/DELETE |
   | `justificativa` | Single line text (ou Multi line) | obrigatório |
   | `contatoEmail` | Single line text | opcional |
   | `status` | Enumeration → `SugestaoStatus` | **default `PENDENTE`** |

3. Em **Project settings → Access → Permanent Auth Tokens**, crie (ou ajuste) o token usado
   pelo site com **Content API permissions mínimas**:
   - `Sugestao`: somente **Create** (stage Draft)
   - `Group` e `GroupInfo`: somente **Read** (stage Published)
   - Nenhuma permissão de update, delete ou publish via API.

   Cole o valor em `GRAPHQL_TOKEN` nas variáveis de ambiente do Netlify (e no `.env` local).

## 2. Fluxo de revisão

As sugestões chegam como entries `Sugestao` em DRAFT, com `status = PENDENTE`:

- **CREATE aprovada** — copie os campos do `payload` para uma entry nova no model `Group`
  (e o agendamento para `GroupInfo`), publique, e marque a sugestão como `APROVADA`.
- **UPDATE aprovada** — o `payload` contém **apenas os campos alterados** (diff). Aplique-os
  na entry referenciada em `alvo`, publique, e marque `APROVADA`.
- **DELETE aprovada** — despublique (ou arquive) a entry referenciada em `alvo` e marque
  `APROVADA`. Pedidos do próprio organizador do pedal têm prioridade — o formulário orienta a
  pessoa a se identificar na justificativa.
- **Recusada** — marque `REJEITADA` (se quiser registrar o motivo, anote no fim da
  `justificativa`). Se `contatoEmail` foi preenchido, dá para avisar a pessoa.

Campos do `payload` (chaves possíveis): `name`, `linkUrl`, `address`, `day`, `startHour`,
`effort`, `distanceKm`, `rhythmKmH`, `latitude`, `longitude`. O site só permite sugerir um
agendamento por vez — agendas múltiplas continuam sendo editadas direto no Hygraph.

## 3. Notificação (opcional, recomendado)

Em **Project settings → Webhooks**, crie um webhook disparado em **Entry created** do model
`Sugestao` apontando para um serviço de notificação (ex.: Zapier/Make → e-mail, ou um webhook
do Slack). Assim você fica sabendo de cada sugestão sem precisar abrir o Hygraph.

## 4. Proteções ativas no site

- **Validação** (Zod) e sanitização de HTML no server route `POST /api/sugestoes`.
- **Honeypot** no formulário (bots que preenchem o campo escondido são ignorados em silêncio).
- **Rate limit** por IP em memória — em serverless vale por instância da function, é uma
  barreira contra rajadas, não uma garantia global (evolução: Upstash Redis).
- **Cloudflare Turnstile** atrás de feature flag: defina `TURNSTILE_ENABLED=true`,
  `TURNSTILE_SECRET_KEY` e `NUXT_PUBLIC_TURNSTILE_SITE_KEY` quando tiver as chaves.
