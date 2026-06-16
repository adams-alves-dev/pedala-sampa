/**
 * Lógica da CLI de curadoria, separada do bootstrap (`curate.ts`) para ser
 * testável: importar este módulo não tem efeitos colaterais (não carrega .env
 * nem abre conexões). O driver fino injeta um `GraphQLClient` já autenticado.
 */
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import type { GraphQLClient } from 'graphql-request'
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
  SUGGESTION_BY_ID_QUERY,
  UPDATE_GROUP_INFO_MUTATION,
  UPDATE_GROUP_MUTATION,
} from '../queries/curation'
import type {
  SuggestionGroupPayload,
  SuggestionType,
} from '../types/suggestion'

export type PendingSuggestion = {
  id: string
  type: SuggestionType
  payload: SuggestionGroupPayload | null
  justification: string
  contactEmail: string | null
  createdAt: string
  group: { id: string; slug: string; name: string } | null
}
type PendingResponse = { suggestions: PendingSuggestion[] }
type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type SuggestionByIdResponse = {
  suggestion: (PendingSuggestion & { reviewStatus: SuggestionStatus }) | null
}
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

/** Teto de uma página no Hygraph; ver `PENDING_SUGGESTIONS_QUERY`. */
const PAGE_LIMIT = 100

export function formatSuggestion(s: PendingSuggestion): string {
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

export function dryRunSummary(
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
export async function resolveUniqueSlug(
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

export async function applyCreate(
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
  // O Group já foi criado (DRAFT). Se a marcação falhar agora, a sugestão segue
  // PENDENTE e uma nova execução recriaria o grupo (com slug -2). Tornamos esse
  // estado explícito para o curador marcar a sugestão à mão e não duplicar nada.
  try {
    await mark(client, s.id, 'APPROVED')
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Group "${createGroup.slug}" criado (DRAFT), mas falhou ao marcar a ` +
        `sugestão como APPROVED: ${reason}. A sugestão continua PENDENTE — ` +
        `marque-a no Studio antes de rodar de novo para não recriar o grupo.`,
    )
  }
  const note = data.groupInfos
    ? ''
    : ' (sem agenda — completar GroupInfo no Studio)'
  return `${createGroup.slug}${note}`
}

export async function applyUpdate(
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

/** Resolve as sugestões a processar: uma só (via `--id`) ou a página de pendentes. */
async function loadPending(
  client: GraphQLClient,
  onlyId: string | undefined,
): Promise<PendingSuggestion[]> {
  if (onlyId) {
    const { suggestion } = await client.request<SuggestionByIdResponse>(
      SUGGESTION_BY_ID_QUERY,
      { id: onlyId },
    )
    if (!suggestion) {
      console.log(`Sugestão ${onlyId} não encontrada.`)
      return []
    }
    if (suggestion.reviewStatus !== 'PENDING') {
      console.log(
        `Sugestão ${onlyId} não está pendente (status atual: ${suggestion.reviewStatus}).`,
      )
      return []
    }
    return [suggestion]
  }

  const { suggestions } = await client.request<PendingResponse>(
    PENDING_SUGGESTIONS_QUERY,
  )
  if (suggestions.length === PAGE_LIMIT) {
    console.log(
      `⚠ Há ${PAGE_LIMIT} pendentes (o teto por execução) — pode haver mais. ` +
        'Rode de novo depois de processar estas.\n',
    )
  }
  return suggestions
}

export async function main(client: GraphQLClient): Promise<void> {
  const { values } = parseArgs({
    options: {
      apply: { type: 'boolean', default: false },
      id: { type: 'string' },
    },
  })
  const apply = values.apply === true
  const onlyId = values.id

  const pending = await loadPending(client, onlyId)

  if (pending.length === 0) {
    if (!onlyId) {
      console.log('Nenhuma sugestão pendente.')
    }
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
  let errored = 0

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
      errored += 1
      const reason = error instanceof Error ? error.message : String(error)
      console.log(`  ✗ erro ao aplicar: ${reason}\n`)
    }
  }

  rl?.close()

  console.log('— Resumo —')
  console.log(
    `aplicados: ${applied} | pulados: ${skipped} | rejeitados: ${rejected} | erros: ${errored}`,
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
