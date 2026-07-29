# Post 4 — Comunidade & segurança

**Tema**: aceitar contribuição anônima na internet aberta sem virar alvo de spam.
**Objetivo**: mostrar maturidade — defesa em camadas, honestidade sobre os limites da própria defesa, e LGPD tratada como requisito.
**Imagem**: carrossel de 7 slides (`slides/post-4-slides.html`).

---

## Texto para colar

```
Qualquer pessoa pode cadastrar um grupo no meu site. Sem login, sem conta, sem e-mail de confirmação.

Isso é, literalmente, um formulário aberto na internet. É um convite para spam — a menos que você planeje para isso.

Fiz a conta ao contrário: pedir cadastro mataria a contribuição. Quem tem a informação certa é quem organiza o pedal, e essa pessoa não vai criar uma conta num site que ela nunca viu para consertar o horário de saída dela. Ou é fácil, ou não acontece.

Então a fricção saiu do usuário e foi para as camadas de trás.

CAMADA 1 — Honeypot
Um campo escondido no formulário. Humano não vê, bot preenche. Se vier preenchido, a API responde 200 e não cria nada. O bot registra sucesso e vai embora feliz. Custa 3 linhas e derruba a maior parte do tráfego automatizado burro.

CAMADA 2 — Rate limit por IP
5 requisições por janela de 10 minutos.

CAMADA 3 — Cloudflare Turnstile
Atrás de feature flag, para poder ligar e desligar sem deploy.

CAMADA 4 — Zod em toda entrada
Tipo, formato, tamanho, e sanitização de HTML.

Aqui tem um detalhe de ordem que é fácil errar: a validação do Zod roda ANTES da verificação do Turnstile.

O token do Turnstile é de uso único. Se você checa o desafio primeiro e só depois descobre que faltou um campo obrigatório, você queimou o token — e o reenvio corrigido do usuário falha, mesmo estando certo. A pessoa preenche tudo de novo e leva erro de novo.

Ordem errada não quebra o teste. Quebra o usuário honesto.

E sobre a camada 2, uma confissão que está escrita no próprio código: em serverless, cada instância tem a própria memória e as instâncias são recicladas. Então o rate limit vale por instância. É uma barreira contra rajada, não uma garantia global.

Deixei isso como comentário no arquivo, junto com a evolução sugerida (Redis compartilhado). Defesa que você não sabe onde falha não é defesa — é sorte.

A curadoria segue o mesmo princípio. A CLI que transforma sugestão aprovada em conteúdo real usa um token separado do público. E esse token NÃO tem permissão de publish. De propósito.

O resultado é que nenhuma automação minha consegue colocar conteúdo no ar. O máximo que ela faz é criar rascunho. Publicar é um humano, no CMS. Quando a única forma de ir ao ar é alguém clicando, o pior caso de um bug na automação é rascunho sujo — nunca conteúdo errado em produção.

Ainda: o aviso que chega no Discord a cada sugestão vai com allowed_mentions vazio. Texto livre de desconhecido não vai pingar @everyone no meu servidor. E o envio tem timeout de 3 segundos e é best-effort: se o Discord cair, a sugestão do usuário é salva do mesmo jeito. A notificação é minha conveniência, não parte do contrato com quem contribuiu.

Por fim, LGPD. O formulário coleta e-mail, e esse e-mail viaja no aviso do Discord. Isso está documentado e a instrução é explícita: canal privado. Além das páginas de privacidade e termos no ar, dizendo o que é coletado e por quê.

Dado de terceiro é responsabilidade, não feature.

🔗 https://pedalasampa.netlify.app
🔗 https://github.com/adams-alves-dev/pedala-sampa

#seguranca #backend #webdev #lgpd #nuxt
```

---

## Variante curta (~800 caracteres)

```
Qualquer pessoa pode cadastrar um grupo no meu site. Sem login, sem conta.

É um formulário aberto na internet — convite para spam, a menos que você planeje.

4 camadas: honeypot (bot preenche campo invisível, API responde 200 e não cria nada), rate limit por IP, Turnstile atrás de feature flag, e Zod em tudo.

O detalhe fácil de errar: o Zod roda ANTES do Turnstile.

O token do Turnstile é de uso único. Se você checa o desafio primeiro e depois descobre que faltou um campo, você queimou o token — e o reenvio corrigido do usuário falha, mesmo estando certo.

Ordem errada não quebra o teste. Quebra o usuário honesto.

#seguranca #backend #webdev
```

---

## Carrossel — 7 slides

| # | Conteúdo |
|---|---|
| 1 | **Capa** — "Formulário aberto na internet. 4 camadas para não virar alvo." |
| 2 | **A decisão** — pedir cadastro mataria a contribuição; a fricção sai do usuário e vai para trás |
| 3 | **Honeypot** — o campo invisível e o 200 mentiroso (com o snippet) |
| 4 | **A ordem que importa** — Zod antes do Turnstile, e por quê (token de uso único) |
| 5 | **A confissão honesta** — o comentário real do `rate-limit.ts` |
| 6 | **Curadoria** — dois tokens, zero permissão de publish, humano no fim |
| 7 | **Discord + LGPD** — `allowed_mentions: []`, timeout 3s, canal privado + links |

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| Honeypot com 200 silencioso | `server/api/suggestions.post.ts:15-18` — *"bots preenchem o campo escondido; respondemos 200 sem criar nada"* |
| Rate limit 5 req / 10 min | `server/utils/rate-limit.ts:10-11` — `WINDOW_MS = 10 * 60 * 1000`, `MAX_REQUESTS_PER_WINDOW = 5` |
| Confissão sobre serverless | `server/utils/rate-limit.ts:1-9` — *"cada instância tem sua própria memória… é uma barreira contra rajadas, não uma garantia global. Evolução sugerida: Upstash Redis"* |
| Turnstile atrás de flag | `server/utils/turnstile.ts`, env `TURNSTILE_ENABLED` |
| Zod antes do Turnstile | `server/api/suggestions.post.ts:31-35` — *"valida ANTES do Turnstile: o token do desafio é de uso único, e um 400 de validação não pode consumi-lo — senão o reenvio corrigido falharia"* |
| Dois tokens, sem publish | `docs/curation.md` — `GRAPHQL_TOKEN` público read-only vs `HYGRAPH_CURATION_TOKEN`; PAT sem Publish/Unpublish/Delete de propósito |
| Curadoria cria só draft | `docs/curation.md`; `scripts/curate-runner.ts` |
| `allowed_mentions: { parse: [] }` | `lib/discord.ts:1-9` — *"neutraliza pings (@everyone/@here/usuários) que possam vir do texto livre do usuário"* |
| Timeout 3s, best-effort | `server/utils/notify.ts:7-24` — `DISCORD_TIMEOUT_MS = 3000`; *"nunca lança (uma falha no aviso não derruba o cadastro)"* |
| LGPD / canal privado | `docs/curation.md`, seção 3 |
| Páginas de privacidade e termos | `pages/privacy.vue`, `pages/terms.vue` |

⚠️ **Nota de honestidade**: o post afirma que o honeypot "derruba a maior parte do tráfego
automatizado burro" — isso é conhecimento geral da técnica, não uma métrica medida neste projeto.
Não há telemetria de bots bloqueados. Se quiser evitar qualquer leitura de métrica, troque por
"custa 3 linhas e resolve o bot mais simples".
