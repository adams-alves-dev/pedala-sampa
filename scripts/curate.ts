/**
 * CLI de curadoria — transpõe sugestões aprovadas em Group/GroupInfo (em DRAFT)
 * e marca a Suggestion como APPROVED. O publish final é manual no Studio.
 *
 *   yarn curate            # dry-run: lista as pendentes e o que faria
 *   yarn curate --apply    # interativo: [a]plicar / [p]ular / [r]ejeitar
 *   yarn curate --id <id>  # restringe a uma sugestão
 *
 * Lê o token privilegiado de `.env.curation` (nunca deployado). Roda com tsx.
 */
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import { GraphQLClient } from 'graphql-request'
import {
  groupCreateInputFromPayload,
  isScheduleComplete,
  slugify,
  splitUpdatePayload,
} from '../lib/curation'
import { payloadSchema } from '../lib/suggestion-schemas'
import {
  CREATE_GROUP_MUTATION,
  GROUP_BY_SLUG_QUERY,
  GROUP_FOR_UPDATE_QUERY,
  MARK_SUGGESTION_MUTATION,
  PENDING_SUGGESTIONS_QUERY,
  UPDATE_GROUP_INFO_MUTATION,
  UPDATE_GROUP_MUTATION,
} from '../queries/curation'
import type {
  SuggestionGroupPayload,
  SuggestionType,
} from '../types/suggestion'

type PendingSuggestion = {
  id: string
  type: SuggestionType
  payload: SuggestionGroupPayload | null
  justification: string
  contactEmail: string | null
  createdAt: string
  group: { id: string; slug: string; name: string } | null
}
type PendingResponse = { suggestions: PendingSuggestion[] }
type GroupBySlugResponse = { group: { id: string } | null }
type GroupForUpdateResponse = {
  group: {
    id: string
    name: string
    departureLocation: { latitude: number; longitude: number }
    groupInfos: Array<{ id: string }>
  } | null
}
type CreateGroupResponse = { createGroup: { id: string; slug: string } }
type ReviewStatus = 'APPROVED' | 'REJECTED'

function formatSuggestion(s: PendingSuggestion): string {
  const when = new Date(s.createdAt).toLocaleString('pt-BR')
  const lines = [`#${s.id}  ${s.type}  ${when}`]
  if (s.group) {
    lines.push(`  alvo: ${s.group.name} (${s.group.slug})`)
  }
  for (const [key, value] of Object.entries(s.payload ?? {})) {
    if (value !== undefined && value !== null) {
      lines.push(`  ${key}: ${value}`)
    }
  }
  lines.push(`  justificativa: ${s.justification}`)
  if (s.contactEmail) {
    lines.push(`  contato: ${s.contactEmail}`)
  }
  return lines.join('\n')
}

function dryRunSummary(
  s: PendingSuggestion,
  payload: SuggestionGroupPayload | null,
): string {
  if (s.type === 'CREATE' && payload) {
    const schedule = isScheduleComplete(payload)
      ? ' + 1 agenda'
      : ' (sem agenda)'
    return `criaria Group "${payload.name}" (slug base "${slugify(payload.name ?? '')}")${schedule}`
  }
  if (s.type === 'UPDATE' && payload) {
    const fields = Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key]) => key)
    return `atualizaria ${s.group?.slug ?? '?'}: ${fields.join(', ')}`
  }
  return `marcaria APPROVED e lembraria de despublicar ${s.group?.slug ?? '?'}`
}

async function mark(
  client: GraphQLClient,
  id: string,
  status: ReviewStatus,
): Promise<void> {
  await client.request(MARK_SUGGESTION_MUTATION, { id, status })
}

/** Gera um slug único, sufixando -2, -3... em caso de colisão. */
async function resolveUniqueSlug(
  client: GraphQLClient,
  name: string,
): Promise<string> {
  const base = slugify(name)
  for (let n = 1; n <= 50; n += 1) {
    const slug = n === 1 ? base : `${base}-${n}`
    const { group } = await client.request<GroupBySlugResponse>(
      GROUP_BY_SLUG_QUERY,
      { slug },
    )
    if (!group) {
      return slug
    }
  }
  throw new Error(`não consegui gerar um slug único a partir de "${name}"`)
}

async function applyCreate(
  client: GraphQLClient,
  s: PendingSuggestion,
  payload: SuggestionGroupPayload,
): Promise<string> {
  const slug = await resolveUniqueSlug(client, payload.name ?? '')
  const data = groupCreateInputFromPayload(payload, slug)
  if (!data) {
    throw new Error('payload de CREATE sem name/latitude/longitude')
  }
  const { createGroup } = await client.request<CreateGroupResponse>(
    CREATE_GROUP_MUTATION,
    { data },
  )
  await mark(client, s.id, 'APPROVED')
  const note = data.groupInfos
    ? ''
    : ' (sem agenda — completar GroupInfo no Studio)'
  return `${createGroup.slug}${note}`
}

async function applyUpdate(
  client: GraphQLClient,
  s: PendingSuggestion,
  diff: SuggestionGroupPayload,
): Promise<string> {
  if (!s.group) {
    throw new Error('UPDATE sem grupo alvo')
  }
  const { group } = await client.request<GroupForUpdateResponse>(
    GROUP_FOR_UPDATE_QUERY,
    { id: s.group.id },
  )
  if (!group) {
    throw new Error('grupo alvo não encontrado')
  }
  const parts = splitUpdatePayload(diff, {
    name: group.name,
    departureLocation: group.departureLocation,
  })
  if (parts.group) {
    await client.request(UPDATE_GROUP_MUTATION, {
      id: group.id,
      data: parts.group,
    })
  }
  let note = ''
  if (parts.groupInfo) {
    const info = group.groupInfos[0]
    if (!info) {
      note = ' (sem GroupInfo para a agenda — criar no Studio)'
    } else {
      await client.request(UPDATE_GROUP_INFO_MUTATION, {
        id: info.id,
        data: parts.groupInfo,
      })
      if (group.groupInfos.length > 1) {
        note = ` (atenção: ${group.groupInfos.length} agendas; apliquei na primeira)`
      }
    }
  }
  await mark(client, s.id, 'APPROVED')
  return `${group.name}${note}`
}

async function main(client: GraphQLClient): Promise<void> {
  const { values } = parseArgs({
    options: {
      apply: { type: 'boolean', default: false },
      id: { type: 'string' },
    },
  })
  const apply = values.apply === true
  const onlyId = values.id

  const { suggestions } = await client.request<PendingResponse>(
    PENDING_SUGGESTIONS_QUERY,
  )
  const pending = onlyId
    ? suggestions.filter((s) => s.id === onlyId)
    : suggestions

  if (pending.length === 0) {
    console.log(`Nenhuma sugestão pendente${onlyId ? ` (id ${onlyId})` : ''}.`)
    return
  }

  const mode = apply ? '' : '  [dry-run — nada será gravado; use --apply]'
  console.log(`${pending.length} sugestão(ões) pendente(s).${mode}\n`)

  const rl = apply
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null
  const toPublish: string[] = []
  const toUnpublish: string[] = []
  let applied = 0
  let skipped = 0
  let rejected = 0

  for (const s of pending) {
    console.log(formatSuggestion(s))

    // revalida o payload (input não-confiável) antes de promover a Group
    let payload: SuggestionGroupPayload | null = null
    if (s.type !== 'DELETE') {
      const parsed = payloadSchema.safeParse(s.payload ?? {})
      if (!parsed.success) {
        const reasons = parsed.error.issues.map((i) => i.message).join('; ')
        console.log(`  ⚠ payload inválido — pulando: ${reasons}\n`)
        skipped += 1
        continue
      }
      payload = parsed.data
    }

    if (!apply || !rl) {
      console.log(`  → (dry-run) ${dryRunSummary(s, payload)}\n`)
      continue
    }

    const answer = (await rl.question('  [a]plicar / [p]ular / [r]ejeitar? '))
      .trim()
      .toLowerCase()
    try {
      if (answer === 'a' && s.type === 'CREATE' && payload) {
        toPublish.push(`Group ${await applyCreate(client, s, payload)}`)
        applied += 1
        console.log('  ✓ criado (DRAFT) + sugestão APPROVED\n')
      } else if (answer === 'a' && s.type === 'UPDATE' && payload) {
        toPublish.push(`Group ${await applyUpdate(client, s, payload)}`)
        applied += 1
        console.log('  ✓ atualizado (DRAFT) + sugestão APPROVED\n')
      } else if (answer === 'a' && s.type === 'DELETE') {
        await mark(client, s.id, 'APPROVED')
        toUnpublish.push(s.group ? `${s.group.name} (${s.group.slug})` : s.id)
        applied += 1
        console.log('  ✓ sugestão APPROVED (despublicar no Studio)\n')
      } else if (answer === 'r') {
        await mark(client, s.id, 'REJECTED')
        rejected += 1
        console.log('  ✓ sugestão REJECTED\n')
      } else {
        skipped += 1
        console.log('  → pulado\n')
      }
    } catch (error) {
      skipped += 1
      const reason = error instanceof Error ? error.message : String(error)
      console.log(`  ✗ erro ao aplicar: ${reason}\n`)
    }
  }

  rl?.close()

  console.log('— Resumo —')
  console.log(
    `aplicados: ${applied} | pulados: ${skipped} | rejeitados: ${rejected}`,
  )
  if (toPublish.length > 0) {
    console.log('\nPublicar no Studio (modo rascunho):')
    toPublish.forEach((item) => console.log(`  • ${item}`))
  }
  if (toUnpublish.length > 0) {
    console.log('\nDespublicar no Studio (pedidos de remoção):')
    toUnpublish.forEach((item) => console.log(`  • ${item}`))
  }
}

// O endpoint (público) vem do .env do projeto; o .env.curation traz só o token
// privilegiado. Carregamos o .env primeiro e damos precedência ao seu endpoint,
// para o .env.curation não precisar repetir (nem errar) essa URL.
try {
  process.loadEnvFile('.env')
} catch {
  // .env é opcional aqui — o endpoint pode vir do ambiente ou do .env.curation
}
const endpointFromEnv = process.env.HYGRAPH_ENDPOINT

try {
  process.loadEnvFile('.env.curation')
} catch {
  console.error('Falta o arquivo .env.curation (veja .env.curation.example).')
  process.exit(1)
}

const token = process.env.HYGRAPH_CURATION_TOKEN
const endpoint = endpointFromEnv ?? process.env.HYGRAPH_ENDPOINT
if (!token) {
  console.error('Defina HYGRAPH_CURATION_TOKEN no .env.curation.')
  process.exit(1)
}
if (!endpoint || endpoint.includes('SEU_PROJETO')) {
  console.error('HYGRAPH_ENDPOINT inválido — configure-o no .env do projeto.')
  process.exit(1)
}

const client = new GraphQLClient(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
})

main(client).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
