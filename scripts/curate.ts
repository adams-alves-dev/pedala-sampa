/**
 * CLI de curadoria — transpõe sugestões aprovadas em Group/GroupInfo (em DRAFT)
 * e marca a Suggestion como APPROVED. O publish final é manual no Studio.
 *
 *   yarn curate            # dry-run: lista as pendentes e o que faria
 *   yarn curate --apply    # interativo: [a]plicar / [p]ular / [r]ejeitar
 *   yarn curate --id <id>  # restringe a uma sugestão
 *
 * Lê o token privilegiado de `.env.curation` (nunca deployado). Roda com tsx.
 * A lógica vive em `curate-runner.ts` (testável); aqui fica só o bootstrap.
 */
import { GraphQLClient } from 'graphql-request'
import { main } from './curate-runner'

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
