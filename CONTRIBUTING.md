# Contribuindo com o Pedala Sampa

Guia de desenvolvimento: padrão de commits, hooks de qualidade e a rotina de
lançamento de releases.

> Para **sugerir um grupo de pedal** ou corrigir informações, use os botões
> _Sugerir grupo_ / _Sugerir correção_ no próprio site — não é preciso mexer no
> código.

## Pré-requisitos

- **Node 22** (ver `.nvmrc`) e **Yarn** (1.x).
- `yarn install` instala as dependências **e os hooks de git** (via `husky`).

## Fluxo de branches

```
feature/*  →  develop  →  main (produção, deploy no Netlify)
```

- Trabalhe sempre em uma branch a partir da `develop`.
- Nunca faça commit direto na `main` — ela é produção e exige Pull Request.
- `develop` é a branch de integração; `main` reflete o que está no ar.

## Conventional Commits

As mensagens de commit seguem o padrão **[Conventional Commits](https://www.conventionalcommits.org/)**.
Isso não é só estética: o número da próxima versão é calculado a partir delas
(ver "Releases" abaixo). O hook `commit-msg` (commitlint) valida o formato.

```
<tipo>(<escopo opcional>): <descrição>
```

| Tipo       | Quando usar                              | Efeito na versão  |
| ---------- | ---------------------------------------- | ----------------- |
| `feat`     | Nova funcionalidade                      | minor (1.**x**.0) |
| `fix`      | Correção de bug                          | patch (1.0.**x**) |
| `perf`     | Ganho de performance                     | patch             |
| `refactor` | Refatoração sem mudança de comportamento | —                 |
| `docs`     | Apenas documentação                      | —                 |
| `style`    | Formatação/estilo (sem lógica)           | —                 |
| `test`     | Testes                                   | —                 |
| `build`    | Build/dependências                       | —                 |
| `ci`       | Configuração de CI                       | —                 |
| `chore`    | Tarefas diversas                         | —                 |

- **Breaking change:** use `feat!:` / `fix!:` ou um rodapé `BREAKING CHANGE:` →
  bump **major** (**x**.0.0).
- A descrição pode ser em **pt-BR** (acentos e maiúscula são permitidos).
- O _tipo_ é sempre em inglês; o _escopo_ é livre (ex.: `tema`, `grupo`,
  `contribuicao`, `ui`).

Exemplos:

```
feat(grupo): exibir ritmo médio na página do grupo
fix(ui): corrige hover dos CTAs amarelos no tema escuro
docs: documenta a rotina de releases
```

## Hooks de qualidade (husky)

Instalados automaticamente no `yarn install`:

| Hook         | O que roda                                                  | Quando        |
| ------------ | ----------------------------------------------------------- | ------------- |
| `pre-commit` | `lint-staged` (eslint --fix + prettier nos arquivos staged) | a cada commit |
| `commit-msg` | `commitlint` (valida o formato da mensagem)                 | a cada commit |
| `pre-push`   | `yarn typecheck` (`nuxt typecheck`)                         | a cada push   |

Os testes (`yarn test`) **não** rodam nos hooks (seriam lentos no dia a dia) —
ficam no CI.

### Scripts úteis

| Comando             | Descrição                            |
| ------------------- | ------------------------------------ |
| `yarn lint`         | ESLint (somente checagem)            |
| `yarn lint:fix`     | ESLint corrigindo o que dá           |
| `yarn format`       | Prettier escrevendo nos arquivos     |
| `yarn format:check` | Prettier só checando                 |
| `yarn typecheck`    | Checagem de tipos (`nuxt typecheck`) |
| `yarn test`         | Testes (Vitest)                      |

## CI (GitHub Actions)

Cada Pull Request (para `develop` e `main`) dispara dois workflows, como rede de
segurança além dos hooks locais:

- **CI** (`.github/workflows/ci.yml`): roda `lint`, `typecheck` e `test`.
- **commitlint** (`.github/workflows/commitlint.yml`): valida que todos os
  commits do PR seguem Conventional Commits (pega commits feitos pela web do
  GitHub ou com o hook pulado via `--no-verify`).

## Versionamento e Releases

Usamos **[SemVer](https://semver.org/)** (`MAJOR.MINOR.PATCH`), partindo de
`1.0.0`. O versionamento é automatizado pelo
**[release-please](https://github.com/googleapis/release-please)**
(`.github/workflows/release-please.yml`), que lê os Conventional Commits.

### Rotina de lançamento

1. Trabalhe em `feature/*` → PR para **`develop`**.
2. **Pronto para publicar: PR `develop` → `main` e mergeie.** Esta é a sua única
   decisão de release.
3. O push na `main` faz o release-please abrir uma **Release PR** (bump no
   `package.json` + `CHANGELOG.md`). Com o PAT configurado (ver abaixo), ela é
   **auto-mergeada**; sem o PAT, você a mergeia à mão.
4. Ao mergear a Release PR: **tag** `vX.Y.Z` + **GitHub Release** + **back-merge
   automático** `main` → `develop` (a develop recebe versão + CHANGELOG). Tudo
   automático. Se o back-merge conflitar (raro), o job falha e aí é só resolver o
   merge `main → develop` à mão.

> O `CHANGELOG.md` é **gerado** pelo release-please — não edite à mão.

### Configuração necessária no GitHub (uma vez)

1. **Settings → Actions → General → Workflow permissions**: marque _Read and write
   permissions_ e **"Allow GitHub Actions to create and approve pull requests"** —
   sem isso o release-please não consegue abrir a Release PR.
2. **Secret `RELEASE_PLEASE_TOKEN`** (opcional, liga o auto-merge da Release PR):
   um **PAT fine-grained** com acesso só a este repositório e permissões
   _Contents: Read and write_ + _Pull requests: Read and write_. Em **Settings →
   Secrets and variables → Actions → New repository secret**. É necessário porque
   o `GITHUB_TOKEN` não dispara o run que cria a tag/release. Sem o secret, o
   fluxo segue funcionando — só exige que você mergeie a Release PR manualmente.
