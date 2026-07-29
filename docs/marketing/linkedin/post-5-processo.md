# Post 5 — Processo & entrega (fechamento da série)

**Tema**: velocidade sustentável vem de automação, não de heroísmo.
**Objetivo**: fechar a série. É o post que mais fala com quem contrata — mostra disciplina de entrega.
**Imagem**: carrossel de 7 slides (`slides/post-5-slides.html`).

---

## Texto para colar

```
Este projeto ficou 4 anos e 8 meses parado.

Último commit da versão antiga: setembro de 2021. Um app Nuxt 2 que funcionava e que eu abandonei.

Quando voltei, em junho de 2026, saíram 5 versões em 8 dias.

A diferença não foi disposição. Foi tooling.

A retomada foi um único PR que trocou Nuxt 2 por Nuxt 3 + Vue 3 + TypeScript strict, com o redesign inteiro junto. Dois dias depois, v1.0.0 no ar. Na semana seguinte: sugestões da comunidade, ritmo derivado da duração do pedal, CLI de curadoria, avisos no Discord, múltiplas agendas por grupo, canal de feedback, e as páginas de privacidade e termos.

v1.0.0 em 11/06. v1.4.0 em 18/06.

O que tornou esse ritmo possível não foi trabalhar mais horas. Foi não gastar decisão com o que pode ser automático.

TESTES BARATOS POR DESENHO
170 casos de teste em 19 arquivos. Isso só é sustentável porque a regra de negócio não mora em componente Vue — mora em 21 módulos puros: filtros, normalizadores, schemas, formatação de tempo.

Testar função pura é escrever entrada e esperar saída. Sem montar componente, sem mockar CMS, sem esperar renderização. O componente fica com o que é dele: apresentar.

Quando testar dói, quase sempre o problema é onde a lógica está — não a ferramenta de teste.

O ERRO PEGO ANTES DO CI
Três hooks de git: lint-staged no pre-commit, commitlint no commit-msg, typecheck no pre-push.

CI vermelho é feedback caro. Chega minutos depois, quando você já está em outra coisa, e custa um push a mais para consertar. O mesmo erro pego no commit custa 4 segundos.

RELEASE EM UMA DECISÃO HUMANA
Conventional Commits alimentam o release-please, que abre a PR de release com CHANGELOG e a versão SemVer já calculada. Eu não escrevo changelog. Eu não escolho número de versão. Eu aprovo ou não aprovo.

Uma pegadinha que custou tempo aqui: o GITHUB_TOKEN padrão do Actions não dispara o workflow que cria a tag. Ação feita por token do sistema não gera evento para o próprio sistema — proteção contra loop infinito. Precisa de um PAT.

E depois do release, back-merge automático de main para develop, para as branches não divergirem sozinhas.

MANUTENÇÃO É TRABALHO, NÃO INTERRUPÇÃO
Num único dia de julho entraram 7 atualizações de dependência via Dependabot, incluindo duas CVEs. Sem drama, porque o pipeline diz em 3 minutos se alguma quebrou alguma coisa.

Onde eu fui deliberadamente chato: código, rotas, arquivos e identificadores em inglês. Interface e documentação em português. A fronteira é explícita, então ninguém precisa decidir caso a caso.

O ponto que eu queria deixar, fechando esta série:

O tooling não é o que você monta quando o projeto fica grande. É o que permite um projeto pequeno voltar do zero depois de 4 anos e entregar 5 versões numa semana — com testes, changelog e versionamento, sem nenhum deles custando atenção.

Ferramenta boa não é a que faz você ir rápido. É a que faz o certo ser o caminho mais fácil.

🔗 O site: https://pedalasampa.netlify.app
🔗 O código: https://github.com/adams-alves-dev/pedala-sampa

Se você pedala em São Paulo e conhece um grupo que não está no mapa, é literalmente um formulário. Sem cadastro.

#devops #cicd #testes #frontend #opensource
```

---

## Variante curta (~700 caracteres)

```
Este projeto ficou 4 anos e 8 meses parado.

Quando voltei, saíram 5 versões em 8 dias. A diferença não foi disposição — foi tooling.

170 testes que são baratos porque a regra de negócio não mora em componente: mora em 21 módulos puros. Testar função pura é entrada e saída, sem montar componente nem mockar CMS.

Três hooks de git, porque CI vermelho é feedback caro: chega minutos depois, quando você já está em outra coisa. O mesmo erro pego no commit custa 4 segundos.

E release-please: eu não escrevo changelog nem escolho versão. Aprovo ou não aprovo.

Ferramenta boa não é a que faz você ir rápido. É a que faz o certo ser o caminho mais fácil.

#devops #cicd #testes
```

---

## Carrossel — 7 slides

| # | Conteúdo |
|---|---|
| 1 | **Capa** — linha do tempo 2021 ▸▸▸▸ 2026, com o gap de 4 anos como elemento visual |
| 2 | **5 releases em 8 dias** — tabela v1.0.0 → v1.4.0 com o que cada uma entregou |
| 3 | **Os números** — 165 commits, 170 testes, 10 rotas, 26 componentes, 21 módulos puros |
| 4 | **Por que os testes foram baratos** — lógica em `lib/`, componente só apresenta |
| 5 | **O pipeline** — commit → husky → CI → release-please → deploy |
| 6 | **A pegadinha do PAT** — por que o `GITHUB_TOKEN` não dispara o workflow |
| 7 | **Fecho** — "ferramenta boa faz o certo ser o caminho mais fácil" + links |

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| Primeiro commit em 03/03/2021 | `git log --reverse --date=short` |
| Último commit da era antiga: 30/09/2021 | `1cdf72a` — merge do PR #55 |
| Retomada em 09/06/2026 | `a31d54c` — *"feat: migração Nuxt 3 + redesign wayfinding"* (PR #69) |
| Gap de 4 anos e 8 meses | 30/09/2021 → 09/06/2026 |
| 5 releases em 8 dias | tags: v1.0.0 `2026-06-11`, v1.1.0 e v1.2.0 `2026-06-15`, v1.3.0 e v1.4.0 `2026-06-18` |
| 165 commits | `git rev-list --count HEAD` |
| 170 testes em 19 arquivos | `tests/unit/` — contagem de `it(`/`test(` |
| 10 rotas, 26 componentes, 21 módulos, 7 composables | contagem em `pages/`, `components/`, `lib/`, `composables/` |
| 3 hooks de git | `.husky/` — `pre-commit` (lint-staged), `commit-msg` (commitlint), `pre-push` |
| CI: lint → typecheck → test | `.github/workflows/ci.yml` |
| release-please + PAT | `.github/workflows/release-please.yml`; `CONTRIBUTING.md` — *"o `GITHUB_TOKEN` não dispara o run que cria a tag/release"*; commit `7935d95` *"release em 1 decisão humana"* |
| Back-merge main → develop | `40256f6` e `release-please.yml` |
| 7 bumps do Dependabot num dia | commits de 2026-07-28, PRs #106–#112; `39f5d88` cita CVE-2026-13149 e CVE-2026-14257 |
| Identificadores em inglês | `78e28aa` — *"renomear identificadores, rotas e arquivos para inglês"*; regra em `AGENTS.md` / `CONTRIBUTING.md` |

⚠️ **Conferir antes de publicar**: `165 commits` é a contagem em `HEAD` no dia 29/07/2026 —
vai crescer. Rode `git rev-list --count HEAD` antes de postar, ou remova o número.
