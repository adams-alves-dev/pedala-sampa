# Post 5 — Processo & entrega (fechamento da série)

**Tema**: o tooling que sustenta entrega rápida sem abrir mão de qualidade, num projeto solo.
**Objetivo**: fechar a série. É o post que mais fala com quem contrata — mostra disciplina de entrega.
**Imagem**: carrossel de 7 slides (`slides/post-5-slides.html`).

---

## Texto para colar

```
Entreguei 5 versões do meu projeto em 8 dias.

Não escrevi um changelog sequer. E não escolhi nenhum número de versão.

Isso não é preguiça — é exatamente o ponto.

Num projeto pessoal, sozinho, a coisa mais fácil do mundo é pular processo. Sem teste, sem changelog, sem versionamento, commit direto na main. Não tem ninguém cobrando.

Só que "não tem ninguém cobrando" também significa "não tem ninguém para lembrar o que mudou". Três semanas depois você não sabe mais qual mudança quebrou o quê, e a única forma de descobrir é ler diff.

Então montei o tooling antes das features. E ele se pagou na primeira semana:

v1.0.0 em 11/06. v1.4.0 em 18/06. No meio: sugestões da comunidade, ritmo derivado da duração do pedal, CLI de curadoria, avisos no Discord, múltiplas agendas por grupo, canal de feedback, páginas de privacidade e termos.

TESTES BARATOS POR DESENHO
170 casos de teste, em 19 arquivos. Isso só é sustentável porque a regra de negócio não mora em componente Vue — mora em 21 módulos puros: filtros, normalizadores, schemas, formatação de tempo.

Testar função pura é escrever entrada e esperar saída. Sem montar componente, sem mockar CMS, sem esperar renderização. O componente fica com o que é dele: apresentar.

Quando testar dói, quase sempre o problema é onde a lógica está — não a ferramenta de teste.

O ERRO PEGO ANTES DO CI
Três hooks de git: lint-staged no pre-commit, commitlint no commit-msg, typecheck no pre-push.

CI vermelho é feedback caro. Chega minutos depois, quando você já está em outra coisa, e custa um push a mais para consertar. O mesmo erro pego no commit custa 4 segundos.

RELEASE EM UMA DECISÃO HUMANA
Conventional Commits alimentam o release-please, que abre a PR de release com o CHANGELOG escrito e a versão SemVer já calculada. Eu aprovo ou não aprovo. É a única decisão que sobra para mim.

Uma pegadinha que custou tempo aqui: o GITHUB_TOKEN padrão do Actions não dispara o workflow que cria a tag. Ação feita com o token do sistema não gera evento para o próprio sistema — é proteção contra loop infinito. A saída é um PAT.

E depois do release, back-merge automático de main para develop, para as branches não divergirem sozinhas.

MANUTENÇÃO É TRABALHO, NÃO INTERRUPÇÃO
Num único dia entraram 7 atualizações de dependência via Dependabot, incluindo duas CVEs. Sem drama, porque o pipeline diz em 3 minutos se alguma quebrou alguma coisa.

Onde eu fui deliberadamente chato: código, rotas, arquivos e identificadores em inglês. Interface e documentação em português. A fronteira é explícita, então ninguém precisa decidir caso a caso — nem eu, três meses depois.

O ponto que eu queria deixar, fechando esta série:

Tooling não é o que você monta quando o projeto fica grande. É o que faz um projeto pequeno entregar cinco versões numa semana com testes, changelog e versionamento — sem que nenhum dos três custe atenção.

Ferramenta boa não é a que faz você ir rápido. É a que faz o certo ser o caminho mais fácil.

🔗 O site: https://pedalasampa.netlify.app
🔗 O código: https://github.com/adams-alves-dev/pedala-sampa

Se você pedala em São Paulo e conhece um grupo que não está no mapa, é literalmente um formulário. Sem cadastro.

#devops #cicd #testes #frontend #opensource
```

---

## Variante curta (~700 caracteres)

```
Entreguei 5 versões do meu projeto em 8 dias. Não escrevi um changelog sequer.

Num projeto solo, a coisa mais fácil é pular processo — não tem ninguém cobrando. Só que também não tem ninguém para lembrar o que mudou.

170 testes que são baratos porque a regra de negócio não mora em componente: mora em 21 módulos puros. Testar função pura é entrada e saída, sem montar componente nem mockar CMS.

Três hooks de git, porque CI vermelho é feedback caro: chega minutos depois, quando você já está em outra coisa. O mesmo erro pego no commit custa 4 segundos.

Ferramenta boa não é a que faz você ir rápido. É a que faz o certo ser o caminho mais fácil.

#devops #cicd #testes
```

---

## Carrossel — 7 slides

| # | Conteúdo |
|---|---|
| 1 | **Capa** — "5 versões em 8 dias. Nenhum changelog escrito à mão." |
| 2 | **As 5 releases** — tabela v1.0.0 → v1.4.0 com o que cada uma entregou |
| 3 | **Os números** — 170 testes, 21 módulos puros, 26 componentes, 10 rotas |
| 4 | **Por que os testes foram baratos** — lógica em `lib/`, componente só apresenta |
| 5 | **O pipeline** — commit → husky → CI → release-please → deploy |
| 6 | **A pegadinha do PAT** — por que o `GITHUB_TOKEN` não dispara o workflow |
| 7 | **Fecho** — "ferramenta boa faz o certo ser o caminho mais fácil" + links |

---

## Fontes

| Afirmação | Onde se verifica |
|---|---|
| 5 releases em 8 dias | tags: v1.0.0 `2026-06-11`, v1.1.0 e v1.2.0 `2026-06-15`, v1.3.0 e v1.4.0 `2026-06-18` |
| O que cada release entregou | `CHANGELOG.md` |
| 170 testes em 19 arquivos | `tests/unit/` — contagem de `it(`/`test(` |
| 21 módulos puros, 26 componentes, 10 rotas, 7 composables | contagem em `lib/`, `components/`, `pages/`, `composables/` |
| 3 hooks de git | `.husky/` — `pre-commit` (lint-staged), `commit-msg` (commitlint), `pre-push` |
| CI: lint → typecheck → test | `.github/workflows/ci.yml` |
| release-please + PAT | `.github/workflows/release-please.yml`; `CONTRIBUTING.md` — *"o `GITHUB_TOKEN` não dispara o run que cria a tag/release"*; commit `7935d95` *"release em 1 decisão humana"* |
| Back-merge main → develop | `40256f6` e `release-please.yml` |
| 7 bumps do Dependabot num dia | commits de 2026-07-28, PRs #106–#112; `39f5d88` cita CVE-2026-13149 e CVE-2026-14257 |
| Identificadores em inglês | `78e28aa` — *"renomear identificadores, rotas e arquivos para inglês"*; regra em `AGENTS.md` / `CONTRIBUTING.md` |

⚠️ **Conferir antes de publicar**: as contagens (testes, módulos, componentes) mudam conforme o
projeto anda. Recontar, ou tirar o número, antes de postar.

📌 **Enquadramento**: este post fala do processo da entrega, não da história do repositório. O
período em que o projeto ficou sem commits foi deliberadamente deixado de fora — se for reescrever,
manter esse recorte.
