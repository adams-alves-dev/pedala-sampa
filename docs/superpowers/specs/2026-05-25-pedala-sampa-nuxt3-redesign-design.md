# Pedala Sampa Nuxt 3 Redesign - Contrato de Implementação V1

## 1. Resumo

O Pedala Sampa será migrado em lugar de Nuxt 2 para Nuxt 3 e redesenhado como uma ferramenta moderna para descobrir grupos de pedal em São Paulo.

A experiência da v1 deve combinar descoberta por mapa com exploração por lista, filtros básicos, detalhes rápidos dos grupos, páginas públicas compartilháveis e CTAs visíveis de contribuição apontando para um formulário externo.

Este documento é um contrato de implementação. Ele define o que deve ser construído, o que está explicitamente fora de escopo, como o sistema deve ser estruturado e como o trabalho será aceito.

## 2. Decisões Fechadas

- Framework: migrar em lugar para Nuxt 3, Vue 3 e TypeScript.
- Fonte de dados: manter o backend atual no Hygraph/GraphCMS na v1.
- Acesso a dados: isolar queries GraphQL/Hygraph dos componentes visuais.
- Modelo de dados: normalizar respostas do CMS em modelos tipados da aplicação.
- Experiência principal: página inicial com mapa e lista de grupos integrados.
- Experiência mobile: bottom sheet é obrigatório.
- Fluxo de contribuição: CTAs apontam para um formulário externo na v1.
- Estratégia de migração: substituir a estrutura atual de Nuxt 2 nesta branch.
- Geolocalização: fora do escopo da v1.
- Autenticação, admin, favoritos, notificações e publicação automática: fora do escopo da v1.
- Specs e planos futuros deste projeto devem ser escritos em português.

## 3. Objetivos

- Tornar a home útil sem exigir que o usuário entenda o mapa primeiro.
- Permitir que usuários descubram grupos por geografia, busca textual, agenda, nível, distância, período e ritmo.
- Manter páginas de grupo compartilháveis e indexáveis.
- Deixar óbvio como sugerir um novo grupo ou uma correção.
- Criar uma base Nuxt 3 sustentável e fácil de evoluir.
- Preservar a natureza colaborativa do projeto reduzindo risco de implementação.

## 4. Fora de Escopo

Os itens abaixo não fazem parte da v1:

- Geolocalização do usuário ou comportamento "perto de mim".
- Login ou contas de usuário.
- Painel administrativo.
- Fluxo interno de moderação.
- Processamento interno de envio de formulário.
- Publicação automática de grupos enviados.
- Geocodificação reversa.
- Favoritos ou grupos salvos.
- Notificações.
- Planejamento de rotas.
- Modo offline completo.

## 5. Usuários-Alvo

### 5.1 Ciclista Iniciante

Precisa encontrar um grupo acessível, compatível com seu nível, distância, ritmo e agenda.

### 5.2 Ciclista Recorrente

Precisa comparar grupos por dia, região, horário de saída e características do pedal.

### 5.3 Organizador De Grupo

Precisa de um caminho claro para sugerir um novo grupo ou atualizar informações incorretas.

### 5.4 Pessoa Nova Em Um Bairro

Precisa descobrir grupos próximos ou relevantes para uma região sem já conhecer seus nomes.

## 6. Arquitetura Da Informação

Rotas obrigatórias:

- `/`: experiência principal de exploração com mapa, lista, busca, filtros, detalhes rápidos e CTA de contribuição.
- `/grupo/[slug]`: página pública de um grupo.
- `/sobre`: página institucional explicando o projeto.

Não obrigatório na v1:

- `/contribuir`: o fluxo de contribuição usa links diretos para o formulário externo na v1.

Rotas removidas ou alteradas:

- A rota atual `pages/_grupo/_name.vue` se torna `pages/grupo/[slug].vue`.
- O padrão atual de página institucional catch-all é substituído por páginas explícitas na v1.

## 7. Contrato Do Formulário Externo

O CTA de contribuição deve usar uma URL externa configurável.

Configuração:

- Adicionar uma configuração pública de runtime, como `public.contributionFormUrl`.
- Se a URL estiver ausente, os componentes de CTA devem renderizar de forma segura e não navegar para um destino inválido.

Rótulos dos CTAs:

- Novo grupo: `Sugerir grupo`
- Correção: `Sugerir correção`

Locais obrigatórios dos CTAs:

- Header no desktop.
- Bottom sheet no mobile.
- Estado de resultados vazios.
- Detalhe rápido do grupo.
- Página pública do grupo.

O formulário externo em si está fora do escopo deste repositório, mas a spec assume que ele coleta ao menos:

- Tipo de sugestão: novo grupo ou correção.
- Nome do grupo.
- Link oficial ou perfil social.
- Ponto de saída.
- Região ou bairro.
- Dia e horário de saída.
- Nível.
- Distância aproximada.
- Ritmo médio.
- Observações.
- Contato de quem enviou a sugestão.

## 8. Direção Visual

Conceito: guia urbano dos grupos de pedal de São Paulo.

A UI deve parecer cívica, urbana, útil e energética. Ela usa referências de mapas, sinalização de rua, infraestrutura cicloviária e wayfinding de transporte sem virar decoração gratuita.

Paleta inicial:

- Asfalto: `#151515`
- Concreto claro: `#F4F1EA`
- Branco quente: `#FFFDF7`
- Verde ciclovia: `#16A05D`
- Amarelo sinalização: `#F5C542`
- Vermelho alerta: `#E24B3C`
- Azul transporte: `#2F6FED`
- Cinza borda: `#D8D2C7`

Direção tipográfica:

- Usar uma fonte display com personalidade para marca e títulos principais.
- Usar uma fonte de leitura compacta e legível para cards, filtros e dados.
- Evitar Arial, Roboto, Inter e fontes padrão do sistema como escolha visual principal.
- As fontes devem suportar acentos em português.

Estilo dos componentes:

- Cards compactos com dimensões estáveis.
- Border radius restrito, em torno de 8px ou menos, exceto quando um componente justificar outra escolha.
- Badges comunicam dia, nível, período e distância.
- Ícones são usados para controles comuns se uma biblioteca compatível com Nuxt 3 for adicionada durante a implementação.
- Cor não pode ser o único recurso para comunicar estado.

## 9. Modelo De Dados

Os componentes da aplicação devem usar tipos normalizados em vez de respostas cruas do Hygraph.

```ts
export type Group = {
  id: string
  name: string
  slug: string
  region?: string
  departureAddress?: string
  departureLocation: GeoPoint
  link?: GroupLink
  schedules: GroupSchedule[]
}

export type GeoPoint = {
  latitude: number
  longitude: number
}

export type GroupLink = {
  label?: string
  url?: string
  html?: string
}

export type GroupSchedule = {
  id: string
  day: string
  startHour: string
  effort: string
  distanceKm: number
  rhythmKmH: number
  rating?: number
}

export type GroupFilters = {
  query: string
  days: string[]
  efforts: string[]
  distanceRange?: 'up-to-20' | '20-to-40' | 'over-40'
  periods: Array<'morning' | 'afternoon' | 'night'>
  rhythms: Array<'light' | 'moderate' | 'strong'>
}
```

Observações:

- `region` é opcional na v1 porque o modelo atual do CMS pode não fornecê-lo.
- `departureAddress` é opcional porque alguns registros podem não ter endereço.
- `link.url` é preferido para o novo comportamento de UI; links ricos em HTML existentes são suportados durante a migração quando uma URL simples não estiver disponível.
- A aplicação deve tolerar campos opcionais ausentes sem quebrar.

## 10. Arquitetura Técnica

### 10.1 Stack

- Nuxt 3.
- Vue 3.
- TypeScript.
- Variáveis CSS em stylesheet global, com estilos escopados por componente quando útil.
- Leaflet ou wrapper Leaflet compatível com Nuxt 3.
- Hygraph via GraphQL.

### 10.2 Estrutura Proposta

```text
app.vue
nuxt.config.ts
pages/
  index.vue
  grupo/
    [slug].vue
  sobre.vue
components/
  app/
    AppHeader.vue
  explore/
    ExploreShell.vue
    GroupExplorerPanel.vue
    GroupQuickView.vue
  group/
    GroupCard.vue
    GroupDetails.vue
    GroupMetaBadges.vue
  map/
    GroupMap.vue
    MapTileLayer.vue
  filters/
    GroupFilters.vue
  contribution/
    ContributionLink.vue
composables/
  useGroups.ts
  useGroup.ts
  useGroupFilters.ts
  useSelectedGroup.ts
  useLapDuration.ts
server/
  api/
types/
  group.ts
assets/
  css/
```

Os nomes exatos das pastas podem mudar durante a implementação se as convenções do Nuxt 3 ou a clareza local sugerirem uma divisão melhor, mas os limites de responsabilidade devem permanecer.

### 10.3 Fluxo De Dados

1. A página chama um composable.
2. O composable busca dados no Hygraph.
3. A resposta crua é normalizada para `Group` ou `Group[]`.
4. Componentes recebem dados normalizados via props.
5. Lógica de filtros e estado selecionado fica fora dos componentes visuais de card/mapa.
6. Componentes visuais emitem eventos em vez de alterar estado global diretamente.

### 10.4 Estratégia De Estado

Preferir composables e estado local da página na v1.

Não adicionar Pinia a menos que a implementação mostre que o estado é compartilhado entre rotas sem relação direta ou fique difícil de entender apenas com composables.

## 11. Componentes

### 11.1 `AppHeader`

Responsabilidades:

- Renderizar a marca.
- Linkar para a home.
- Linkar para `/sobre`.
- Renderizar CTA de contribuição no desktop.
- Adaptar layout no mobile.

Aceite:

- Header é utilizável em larguras desktop e mobile.
- URL do CTA vem de runtime config ou prop.
- Links de navegação têm nomes acessíveis.

### 11.2 `ExploreShell`

Responsabilidades:

- Controlar o layout responsivo da home.
- Posicionar mapa e painel exploratório.
- Renderizar painel lateral no desktop.
- Renderizar bottom sheet no mobile.
- Coordenar grupo selecionado e detalhe rápido.

Aceite:

- Desktop mostra mapa e painel simultaneamente.
- Mobile mostra mapa mais bottom sheet.
- Layout não exige rolagem horizontal.

### 11.3 `GroupMap`

Responsabilidades:

- Renderizar o mapa base.
- Renderizar um marcador por grupo.
- Emitir slug ou id do grupo selecionado.
- Distinguir visualmente o marcador selecionado.
- Centralizar ou mover o mapa para o grupo selecionado quando solicitado.

Aceite:

- Mapa roda apenas no client.
- Coordenadas ausentes são tratadas defensivamente.
- Selecionar um marcador atualiza o estado de grupo selecionado.

### 11.4 `GroupExplorerPanel`

Responsabilidades:

- Renderizar busca.
- Renderizar filtros.
- Renderizar contador de resultados.
- Renderizar lista de grupos.
- Renderizar estados de carregamento, erro e vazio.
- Renderizar CTA de contribuição quando apropriado.

Aceite:

- Busca e filtros atualizam a lista visível.
- Estado vazio oferece ação clara para limpar filtros e CTA de contribuição.
- Painel permanece utilizável no mobile dentro do bottom sheet.

### 11.5 `GroupFilters`

Responsabilidades:

- Renderizar controles de filtro.
- Emitir estado normalizado de filtros.
- Mostrar estado de filtro ativo.
- Oferecer ação clara para limpar filtros.

Aceite:

- Filtros podem ser alterados sem reload da página.
- Filtros ativos são visíveis.
- Ação de limpar reseta todos os filtros exceto a busca, a menos que a implementação escolha limpar a busca explicitamente e rotule isso com clareza.

### 11.6 `GroupCard`

Responsabilidades:

- Renderizar resumo do grupo.
- Mostrar nome, região ou endereço, dia/horário, nível, distância e ritmo.
- Indicar estado selecionado.
- Suportar seleção por ponteiro e teclado.

Aceite:

- Card é acessível por teclado.
- Estado selecionado não é comunicado apenas por cor.
- Nomes longos não quebram o layout.

### 11.7 `GroupQuickView`

Responsabilidades:

- Renderizar detalhes rápidos do grupo selecionado.
- Linkar para a página pública do grupo.
- Linkar para o grupo/contato externo quando disponível.
- Renderizar CTA de correção.

Aceite:

- Fechar o detalhe rápido retorna o usuário ao contexto de exploração.
- Link externo ausente é tratado com fallback claro.
- CTA de correção aponta para o formulário externo configurado.

### 11.8 `ContributionLink`

Responsabilidades:

- Renderizar link externo de contribuição de forma consistente.
- Suportar contextos de novo grupo e correção.
- Incluir atributos seguros de link externo.

Aceite:

- Link usa `target="_blank"` e `rel="noopener noreferrer"` quando abre externamente.
- Componente tem estado seguro desabilitado ou fallback quando a URL não está configurada.

## 12. Experiência Da Home

### 12.1 Layout Desktop

Comportamento obrigatório:

- Header está visível.
- Mapa é a superfície dominante.
- Painel lateral contém busca, filtros, lista e CTA.
- Selecionar um card destaca o marcador.
- Selecionar um marcador destaca o card.
- Detalhes rápidos aparecem sem perder o contexto do mapa.

### 12.2 Layout Mobile

Comportamento obrigatório:

- Header é compacto.
- Mapa permanece visível atrás ou acima dos controles de exploração.
- Bottom sheet contém busca, filtros, lista e CTA.
- Bottom sheet suporta pelo menos estados recolhido e expandido.
- Detalhes rápidos aparecem dentro do bottom sheet ou como um estado do sheet.
- Alvos de toque são confortáveis e não se sobrepõem.

### 12.3 Busca

A busca deve corresponder a:

- Nome do grupo.
- Região, quando disponível.
- Endereço de saída, quando disponível.
- Dia.
- Nível.

A busca é client-side na v1.

### 12.4 Filtros

Filtros obrigatórios:

- Dia da semana.
- Nível.
- Faixa de distância.
- Período: manhã, tarde, noite.
- Ritmo: leve, moderado, forte.

Derivação de filtros:

- Período é derivado de `startHour`.
- Categoria de ritmo é derivada de `rhythmKmH`.
- Faixa de distância é derivada de `distanceKm`.

Os limites exatos devem ser implementados em um utilitário ou composable compartilhado para facilitar revisão futura.

Limites iniciais sugeridos:

- Distância:
  - `up-to-20`: `<= 20`
  - `20-to-40`: `> 20 && <= 40`
  - `over-40`: `> 40`
- Ritmo:
  - `light`: `< 16`
  - `moderate`: `>= 16 && <= 22`
  - `strong`: `> 22`
- Período:
  - `morning`: `05:00` até `11:59`
  - `afternoon`: `12:00` até `17:59`
  - `night`: `18:00` até `04:59`

## 13. Página Pública Do Grupo

Rota: `/grupo/[slug]`

Conteúdo obrigatório:

- Nome do grupo.
- Badges de resumo.
- Mapa do ponto de saída.
- Endereço de saída ou fallback de coordenadas.
- Detalhes de agenda.
- Distância.
- Ritmo.
- Duração média estimada da volta.
- Link externo do grupo/contato quando disponível.
- CTA de correção.

Comportamento obrigatório:

- Página tem metadados SEO dinâmicos.
- Grupo ausente retorna estado apropriado de não encontrado.
- Página é compartilhável sem exigir interação prévia na home.

## 14. Páginas Institucionais

### 14.1 `/sobre`

Conteúdo obrigatório:

- O que é o Pedala Sampa.
- Como o mapa colaborativo funciona.
- Como sugerir grupos ou correções.

Fonte dos dados:

- `/sobre` é implementada como conteúdo estático Nuxt na v1.
- Texto existente do CMS pode ser copiado ou adaptado, mas a rota não depende do Hygraph na v1.

### 14.2 Página De Contribuição

Nenhuma página interna de contribuição é obrigatória na v1.

Todas as ações de contribuição linkam diretamente para o formulário externo configurado. Uma versão futura pode adicionar `/contribuir`, mas o aceite da v1 não depende disso.

## 15. Requisitos Funcionais

### RF-01 - Explorar Grupos Na Home

O usuário deve conseguir ver grupos de pedal em um mapa e em uma lista.

Critérios de aceite:

- Home renderiza uma área de mapa.
- Home renderiza uma área de lista.
- Cada grupo válido aparece como marcador e card.
- Grupos sem coordenadas válidas não quebram o mapa.

### RF-02 - Selecionar Um Grupo

O usuário deve conseguir selecionar um grupo pela lista ou pelo mapa.

Critérios de aceite:

- Selecionar um card atualiza o grupo selecionado.
- Selecionar um marcador atualiza o grupo selecionado.
- Card e marcador selecionados são visualmente conectados.
- Estado selecionado é acessível sem depender apenas de cor.

### RF-03 - Buscar Grupos

O usuário deve conseguir buscar grupos usando texto.

Critérios de aceite:

- Busca atualiza resultados sem reload da página.
- Busca corresponde a nome e campos de localização disponíveis.
- Busca corresponde a dia e nível.
- Limpar a busca restaura resultados não filtrados, respeitando filtros ativos.

### RF-04 - Filtrar Grupos

O usuário deve conseguir filtrar grupos por critérios práticos do pedal.

Critérios de aceite:

- Filtro de dia funciona.
- Filtro de nível funciona.
- Filtro de faixa de distância funciona.
- Filtro de período funciona.
- Filtro de ritmo funciona.
- Filtros ativos podem ser limpos.

### RF-05 - Ver Detalhes Rápidos

O usuário deve conseguir inspecionar um grupo selecionado sem sair da home.

Critérios de aceite:

- Detalhe rápido mostra o nome do grupo selecionado.
- Detalhe rápido mostra agenda, distância, ritmo e nível.
- Detalhe rápido linka para a página pública do grupo.
- Detalhe rápido inclui CTA de correção.

### RF-06 - Ver Página Pública Do Grupo

O usuário deve conseguir abrir uma página compartilhável para cada grupo.

Critérios de aceite:

- `/grupo/[slug]` renderiza detalhes do grupo.
- Página pode ser aberta diretamente.
- Página tem title e description dinâmicos.
- Grupo ausente é tratado de forma adequada.

### RF-07 - Sugerir Grupos E Correções

O usuário deve conseguir acessar o formulário externo de sugestão pelos fluxos principais.

Critérios de aceite:

- Header inclui CTA de novo grupo no desktop.
- Exploração mobile inclui CTA de novo grupo.
- Estado vazio inclui CTA de novo grupo.
- Detalhe rápido do grupo inclui CTA de correção.
- Página pública do grupo inclui CTA de correção.

### RF-08 - Preservar Conteúdo Institucional

O usuário deve conseguir entender o que é o Pedala Sampa.

Critérios de aceite:

- `/sobre` existe.
- `/sobre` usa a nova linguagem visual.
- `/sobre` linka para o fluxo de contribuição.

### RF-09 - Tratar Estados Da Interface

A aplicação deve fornecer estados claros para carregamento, erro e ausência de resultados.

Critérios de aceite:

- Estado de carregamento aparece enquanto grupos são buscados.
- Estado de erro aparece se grupos não puderem ser carregados.
- Estado vazio aparece quando filtros retornam nenhum grupo.
- Estado vazio oferece limpar filtros e CTA de contribuição.

### RF-10 - Suportar Navegação Por Teclado

Controles centrais de exploração devem ser acessíveis por teclado.

Critérios de aceite:

- Busca pode receber foco e ser usada por teclado.
- Filtros podem receber foco e ser alterados por teclado.
- Cards de grupo podem receber foco e ser selecionados por teclado.
- CTAs podem receber foco e ser ativados por teclado.
- Estados de foco são visíveis.

## 16. Requisitos Não Funcionais

### 16.1 Performance

- Código do mapa não quebra SSR.
- Mapa é client-only ou lazy-loaded.
- Rotas sem mapa não carregam código pesado de mapa antecipadamente.
- Filtragem permanece responsiva para a quantidade esperada de grupos.
- Fontes são carregadas intencionalmente e não bloqueiam a renderização essencial desnecessariamente.

### 16.2 Acessibilidade

- Contraste de texto deve ser legível sobre os fundos.
- Elementos interativos devem ter nomes acessíveis.
- Estados de foco devem ser visíveis.
- Cards não podem depender apenas de cor para mostrar seleção.
- Bottom sheet não pode prender usuários de forma inesperada.

### 16.3 SEO

Metadados da home:

- Title: `Pedala Sampa - Grupos de pedal em São Paulo`
- Description: `Encontre grupos de pedal em São Paulo por região, dia, horário, nível, distância e ritmo.`

Metadados de grupo:

- Title: `{group.name} - Pedala Sampa`
- Description: `Veja ponto de saída, horário, nível, distância e ritmo do grupo {group.name} em São Paulo.`

Open Graph:

- Incluir nome do site.
- Incluir title e description contextuais.
- Usar imagem padrão se uma imagem for adicionada ao projeto.

### 16.4 PWA

Escopo PWA da v1:

- Manifest com name, short name, language, theme color e ícones.
- Não prometer acesso offline completo.
- Fallback offline pode ser adicionado se for baixo risco durante a implementação.

### 16.5 Manutenibilidade

- Componentes não importam documentos GraphQL diretamente.
- Mapeamento de resposta do Hygraph é centralizado.
- Limites de filtros são centralizados.
- Formatação de horário e duração é centralizada.
- Campos opcionais do CMS são tratados defensivamente.

## 17. Estados De Erro E Vazio

### 17.1 Carregando Grupos

Mostrar estado de carregamento na área de painel/lista. O mapa mostra uma superfície neutra de carregamento até que o código client-side do mapa esteja pronto.

### 17.2 Falha Ao Carregar Grupos

Mensagem:

`Não conseguimos carregar os grupos agora.`

Ações:

- Tentar novamente.
- Link para contribuição/contato apenas se for contextualmente útil.

### 17.3 Nenhum Resultado Nos Filtros

Mensagem:

`Nenhum grupo encontrado com esses filtros.`

Ações:

- Limpar filtros.
- Sugerir grupo.

### 17.4 Link Externo Ausente No Grupo

Se um grupo não tiver link externo/de contato, não renderizar link quebrado. Mostrar apenas ações disponíveis, incluindo CTA de correção.

## 18. Requisitos De Teste

Cobertura mínima da v1:

- Normalização de resposta do Hygraph para `Group`.
- Comportamento de filtros por busca, dia, nível, distância, período e ritmo.
- Formatação de duração média da volta.
- Fallback do link de contribuição quando a URL está ausente.

Testes de componente recomendados:

- Estados selecionado e não selecionado de `GroupCard`.
- Estado vazio de `GroupExplorerPanel`.
- `GroupQuickView` com e sem link externo do grupo.

Verificação de build:

- Build Nuxt deve passar antes da v1 ser considerada completa.

## 19. Plano De Migração

### Fase 1 - Fundação Nuxt 3

- Substituir configuração Nuxt 2 por configuração Nuxt 3.
- Adicionar suporte a TypeScript.
- Atualizar scripts e dependências do package.
- Confirmar comandos locais de dev e build.

### Fase 2 - Camada De Dados

- Migrar queries Hygraph.
- Criar tipos normalizados.
- Implementar `useGroups`.
- Implementar `useGroup`.
- Adicionar testes de normalização.

### Fase 3 - Design Tokens E Layout Base

- Adicionar CSS/tokens globais.
- Implementar app shell e header.
- Estabelecer breakpoints responsivos.

### Fase 4 - Home Com Mapa E Lista

- Implementar `ExploreShell`.
- Implementar `GroupMap`.
- Implementar `GroupExplorerPanel`.
- Implementar seleção sincronizada.

### Fase 5 - Busca E Filtros

- Implementar `useGroupFilters`.
- Adicionar controles de filtro.
- Adicionar contador de resultados e comportamento de reset.
- Adicionar testes da lógica de filtro.

### Fase 6 - Detalhe Rápido E Página Do Grupo

- Implementar `GroupQuickView`.
- Implementar `/grupo/[slug]`.
- Adicionar SEO de grupo.
- Adicionar tratamento de não encontrado.

### Fase 7 - CTAs De Contribuição E Páginas Institucionais

- Implementar `ContributionLink`.
- Adicionar os CTAs externos nos locais definidos.
- Migrar `/sobre`.

### Fase 8 - Polimento, PWA, Acessibilidade E Verificação

- Adicionar base do manifesto PWA.
- Revisar comportamento do bottom sheet no mobile.
- Verificar navegação por teclado.
- Verificar estados visuais.
- Rodar testes e build.

## 20. Definição De Pronto

A v1 está completa apenas quando:

- Projeto roda em Nuxt 3.
- Tipos TypeScript existem para dados de grupos.
- Home carrega grupos reais do Hygraph.
- Home mostra mapa e lista.
- Seleção de mapa e lista é sincronizada.
- Busca funciona.
- Filtros obrigatórios funcionam.
- Detalhe rápido funciona.
- Página pública do grupo funciona.
- CTA externo de contribuição aparece em todos os locais obrigatórios.
- `/sobre` existe.
- Estados de carregamento, erro e vazio existem.
- Metadados básicos de SEO existem para home e páginas de grupo.
- Layout mobile é utilizável sem rolagem horizontal.
- Navegação por teclado funciona nos controles principais.
- Testes cobrem normalização, filtros, formatação de duração e fallback da URL de contribuição.
- Build passa.

## 21. Checagens A Resolver Durante A Implementação

Estes itens não bloqueiam o escopo, mas devem ser resolvidos durante a implementação:

- Confirmar pacote Leaflet final compatível com Nuxt 3.
- Confirmar endpoint Hygraph e estratégia de token.
- Confirmar URL final do formulário externo de contribuição.
- Confirmar fontes finais com suporte a acentos em português.
