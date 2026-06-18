# Changelog

## [1.3.0](https://github.com/adams-alves-dev/pedala-sampa/compare/v1.2.0...v1.3.0) (2026-06-18)


### ✨ Funcionalidades

* curadoria assistida, avisos no Discord e múltiplas agendas por grupo ([8d9c1ae](https://github.com/adams-alves-dev/pedala-sampa/commit/8d9c1ae5c88da8c62d053a5c4f54e20fef3f04e5))
* **curation:** CLI de curadoria assistida (draft-only) ([719c610](https://github.com/adams-alves-dev/pedala-sampa/commit/719c6102fe5c11e4445401758160ee363ce75cce))
* **curation:** CLI de curadoria assistida (draft-only) ([520cae8](https://github.com/adams-alves-dev/pedala-sampa/commit/520cae812023aea86b0900685a89e7c1a9f8be1c))
* **schedules:** corrigir e remover por agenda específica ([834c8b8](https://github.com/adams-alves-dev/pedala-sampa/commit/834c8b88cb4188e14ff7c3443fa1e98f730d33d1))
* **schedules:** várias agendas por grupo + fluxo de adicionar agenda ([9690e5e](https://github.com/adams-alves-dev/pedala-sampa/commit/9690e5e87708e6c54bbd115f3a642f1a2f454936))
* **schedules:** várias agendas por grupo + fluxo de adicionar agenda ([d2759fb](https://github.com/adams-alves-dev/pedala-sampa/commit/d2759fb5e1f9a307e4e07358a03f98541c5fa70f))
* **suggestions:** aviso no Discord a cada nova sugestão ([d3642fa](https://github.com/adams-alves-dev/pedala-sampa/commit/d3642fa317a481292758479e227ad1c3f1484a69))
* **suggestions:** aviso no Discord a cada nova sugestão ([9bd705b](https://github.com/adams-alves-dev/pedala-sampa/commit/9bd705bda757d055f9b3be6884d32bea3ffe28fd))
* **suggestions:** nome do grupo alvo no aviso do Discord (além do id) ([ba19b77](https://github.com/adams-alves-dev/pedala-sampa/commit/ba19b7731e4569290a2533074671884e5d556311))
* **suggestions:** rótulo descritivo do id da sugestão no aviso do Discord ([b41046c](https://github.com/adams-alves-dev/pedala-sampa/commit/b41046cd38e95aa831b5c632c58801fe5392c443))


### 🐛 Correções

* **schedules:** endurece o fluxo de agendas (revisão do PR [#99](https://github.com/adams-alves-dev/pedala-sampa/issues/99)) ([57fbc77](https://github.com/adams-alves-dev/pedala-sampa/commit/57fbc775f280aca99ccf5351dadca3dbf7575ede))


### ♻️ Refatorações

* **curation:** robustez da CLI (paginação, slug em draft, atomicidade) ([5d13ba7](https://github.com/adams-alves-dev/pedala-sampa/commit/5d13ba79059a449ed6bbdf5f8586e20711ba29fa))
* **suggestions:** timeout, aviso de PII e testes do notify (code review) ([947f40e](https://github.com/adams-alves-dev/pedala-sampa/commit/947f40eca9ec47f30f39f6a2048ad027da6af64b))

## [1.2.0](https://github.com/adams-alves-dev/pedala-sampa/compare/v1.1.0...v1.2.0) (2026-06-15)


### ✨ Funcionalidades

* **contribution:** derivar o ritmo a partir da duração do pedal ([bac185f](https://github.com/adams-alves-dev/pedala-sampa/commit/bac185f156a331bf544713870058ab7c2690945d))
* **contribution:** derivar o ritmo a partir da duração do pedal ([ebfb177](https://github.com/adams-alves-dev/pedala-sampa/commit/ebfb177f3188a75e0cf11ec84e009276e42c8c9d))


### 💄 Estilo

* **contribution:** dar mais destaque ao helper de duração ([9457f94](https://github.com/adams-alves-dev/pedala-sampa/commit/9457f9407ac85de39e3e043e29123ffb673a7e7e))

## [1.1.0](https://github.com/adams-alves-dev/pedala-sampa/compare/v1.0.0...v1.1.0) (2026-06-15)


### ✨ Funcionalidades

* **contribuicao:** escolher ponto de saída clicando no mapa ([4c35544](https://github.com/adams-alves-dev/pedala-sampa/commit/4c3554467c409813c0d105f38b538a312ac61f24))
* **contribuicao:** restringir o ponto de saída à Grande São Paulo no mapa ([04b8bd5](https://github.com/adams-alves-dev/pedala-sampa/commit/04b8bd504b76f992e026b3abbc0837d39a535389))
* **contribuicao:** sugestões da comunidade com curadoria via Hygraph ([7c73e1c](https://github.com/adams-alves-dev/pedala-sampa/commit/7c73e1c2e5fb457edc4d6c8d3ba87acbf7ee9898))
* sugestões da comunidade com curadoria (criar, corrigir, remover grupo) ([f9b2a3d](https://github.com/adams-alves-dev/pedala-sampa/commit/f9b2a3d5bb0b06de117ce0a55172a6db797fb68a))


### 🐛 Correções

* alinhar mutation ao schema real do Hygraph (campo group, reviewStatus explícito) ([8b2aac8](https://github.com/adams-alves-dev/pedala-sampa/commit/8b2aac8a3cb793459f7a21b17d6748297046dca5))
* aplicar apontamentos do segundo review + CTA invisível na própria página ([5da2094](https://github.com/adams-alves-dev/pedala-sampa/commit/5da2094155fa2a0cd07af2f59e63425116e44eef))
* **contribuicao:** submit quebrava com campos numéricos preenchidos ([bce73a8](https://github.com/adams-alves-dev/pedala-sampa/commit/bce73a853c3bdf080bb5b4d9804f7d28c9aafd45))
* **grupo:** exibir com dignidade grupos sem ritmo/distância informados ([28eca33](https://github.com/adams-alves-dev/pedala-sampa/commit/28eca33a4622473c2782c3e70c94ed9f74a5cdfd))
* **map:** center do mapa incompatível com a tipagem do LMap ([53d83eb](https://github.com/adams-alves-dev/pedala-sampa/commit/53d83ebfbb38d6a79b5cf7d5c20f350cb1a59412))
* **security:** restringir linkUrl a schemes http(s) ([819190d](https://github.com/adams-alves-dev/pedala-sampa/commit/819190d4333024e7b9e99d271ae06a430e8924a9))
* **tema:** consolidar tinta de superfícies amarelas em --color-on-sun ([c875ab5](https://github.com/adams-alves-dev/pedala-sampa/commit/c875ab5886e7a89c4de24b8bedf10cbbd4a5f970))
* **tema:** declarar color-scheme nos temas para widgets nativos ([65f554c](https://github.com/adams-alves-dev/pedala-sampa/commit/65f554c66b1a26f8ade20fa1051255fb34003e3b))
* **tema:** tinta escura no pin selecionado em dark mode ([ee36909](https://github.com/adams-alves-dev/pedala-sampa/commit/ee369092211878db4bf81bbbf61b11b790ac6d5f))
* **ui:** bloco de hover dos CTAs via pseudo-elementos (sem filter) ([c53177d](https://github.com/adams-alves-dev/pedala-sampa/commit/c53177d078bd82c362167af27a7e94f826dc63ec))
* **ui:** escurecer o fundo no hover dos CTAs amarelos ([d028842](https://github.com/adams-alves-dev/pedala-sampa/commit/d028842ef383ca997d4b37242f6659e3a957ee0b))
* **ui:** hover dos CTAs amarelos = bloco verde deslocado (igual ao .ps-btn--solid) ([ee14559](https://github.com/adams-alves-dev/pedala-sampa/commit/ee145597963336a364f6be5191c66bf2f4151a5e))
* **ui:** hover dos CTAs amarelos usa drop-shadow (clip-path recortava box-shadow) ([26d9ebd](https://github.com/adams-alves-dev/pedala-sampa/commit/26d9ebd0e9e234eb819946bf04b108970001ba39))
* **ui:** hover nos links inline de contribuição ([fe6569b](https://github.com/adams-alves-dev/pedala-sampa/commit/fe6569b4ae649fcf3a4ae6291b18daa67850664b))
* **ui:** reforçar o hover dos botões de sinalização ([1a54353](https://github.com/adams-alves-dev/pedala-sampa/commit/1a543538e29f81fb9895f27de74416ba07aff0e6))
* **ui:** texto do CTA do header não clareia no hover ([a1b9184](https://github.com/adams-alves-dev/pedala-sampa/commit/a1b9184ffd4e226cebe7103068251cafa5d6b8f5))


### ♻️ Refatorações

* aplicar sugestões do code review do PR [#83](https://github.com/adams-alves-dev/pedala-sampa/issues/83) ([76c30d9](https://github.com/adams-alves-dev/pedala-sampa/commit/76c30d9814cea8fbb1c34c1381c3fc89076f86af))
* renomear identificadores, rotas e arquivos para inglês ([78e28aa](https://github.com/adams-alves-dev/pedala-sampa/commit/78e28aa109f50353d628db0a029308621444b4e2))
* **tema:** renomear temas para light/dark (identificadores em inglês) ([65d98e1](https://github.com/adams-alves-dev/pedala-sampa/commit/65d98e1e9c39135bf3f77e27d802ea1958846749))


### 📝 Documentação

* campo de status da sugestão vira reviewStatus (status é reservado no Hygraph) ([06cbaef](https://github.com/adams-alves-dev/pedala-sampa/commit/06cbaef223354f8d02fab047d2d190aea4d931d5))


### 💄 Estilo

* aplica Prettier como baseline de formatação ([d2b469f](https://github.com/adams-alves-dev/pedala-sampa/commit/d2b469f0bfe9927fa27f791cf5a14678d4904dd2))
