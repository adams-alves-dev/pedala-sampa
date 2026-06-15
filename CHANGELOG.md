# Changelog

## [1.1.0](https://github.com/adams-alves-dev/pedala-sampa/compare/v1.0.0...v1.1.0) (2026-06-15)


### ✨ Funcionalidades

* **contribuicao:** escolher ponto de saída clicando no mapa ([4c35544](https://github.com/adams-alves-dev/pedala-sampa/commit/4c3554467c409813c0d105f38b538a312ac61f24))
* **contribuicao:** restringir o ponto de saída à Grande São Paulo no mapa ([04b8bd5](https://github.com/adams-alves-dev/pedala-sampa/commit/04b8bd504b76f992e026b3abbc0837d39a535389))
* **contribuicao:** sugestões da comunidade com curadoria via Hygraph ([7c73e1c](https://github.com/adams-alves-dev/pedala-sampa/commit/7c73e1c2e5fb457edc4d6c8d3ba87acbf7ee9898))
* migração Nuxt 3 + redesign wayfinding (mapa-foco, 2 temas, páginas internas) ([#69](https://github.com/adams-alves-dev/pedala-sampa/issues/69)) ([a31d54c](https://github.com/adams-alves-dev/pedala-sampa/commit/a31d54ce935f47f6ae6e06d5a7b5301dd3935615))
* sugestões da comunidade com curadoria (criar, corrigir, remover grupo) ([f9b2a3d](https://github.com/adams-alves-dev/pedala-sampa/commit/f9b2a3d5bb0b06de117ce0a55172a6db797fb68a))


### 🐛 Correções

* alinhar mutation ao schema real do Hygraph (campo group, reviewStatus explícito) ([8b2aac8](https://github.com/adams-alves-dev/pedala-sampa/commit/8b2aac8a3cb793459f7a21b17d6748297046dca5))
* aplicar apontamentos do segundo review + CTA invisível na própria página ([5da2094](https://github.com/adams-alves-dev/pedala-sampa/commit/5da2094155fa2a0cd07af2f59e63425116e44eef))
* **contribuicao:** submit quebrava com campos numéricos preenchidos ([bce73a8](https://github.com/adams-alves-dev/pedala-sampa/commit/bce73a853c3bdf080bb5b4d9804f7d28c9aafd45))
* fallback de overflow para Safari antigo + a11y do foco no sheet ([d7b6c50](https://github.com/adams-alves-dev/pedala-sampa/commit/d7b6c507473d9f2ad3fb9245dc95a7330e5dbcba))
* **grupo:** exibir com dignidade grupos sem ritmo/distância informados ([28eca33](https://github.com/adams-alves-dev/pedala-sampa/commit/28eca33a4622473c2782c3e70c94ed9f74a5cdfd))
* impedir scroll fantasma do container do mapa no mobile (toolbar fora da tela) ([d3e7d2b](https://github.com/adams-alves-dev/pedala-sampa/commit/d3e7d2beab0a220870976941ab870b3e68df81cb))
* **map:** center do mapa incompatível com a tipagem do LMap ([53d83eb](https://github.com/adams-alves-dev/pedala-sampa/commit/53d83ebfbb38d6a79b5cf7d5c20f350cb1a59412))
* **map:** reenquadrar o mapa nos pins visíveis ao mudar os filtros ([a5a3860](https://github.com/adams-alves-dev/pedala-sampa/commit/a5a3860f42bedc980a1c4497a150122ccdb58e65))
* **mobile-sheet:** melhora gesto de drag e baixa snap inicial para peek ([#76](https://github.com/adams-alves-dev/pedala-sampa/issues/76)) ([2b6e6c2](https://github.com/adams-alves-dev/pedala-sampa/commit/2b6e6c228af25018c205ef440d93dd9b82539a85))
* **mobile:** impedir scroll fantasma que empurrava a busca para fora da tela ([5148c7e](https://github.com/adams-alves-dev/pedala-sampa/commit/5148c7e381c87b1f1137c06c40d781cc8592b30c))
* reenquadrar o mapa nos pins visíveis quando os filtros mudam ([861e18c](https://github.com/adams-alves-dev/pedala-sampa/commit/861e18c351f68c5655ce1e6fd146cd7468a2fabb))
* **security:** resolve alertas Dependabot transitivos (cross-spawn, browserslist) ([#73](https://github.com/adams-alves-dev/pedala-sampa/issues/73)) ([880621a](https://github.com/adams-alves-dev/pedala-sampa/commit/880621abd0dfe49568202dfee89cac1cfdfe8035))
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
* aplicar sugestões do code review no refit do mapa ([16481ec](https://github.com/adams-alves-dev/pedala-sampa/commit/16481ec2c64a28e58beb8bfd5ae50e9060701c11))
* renomear identificadores, rotas e arquivos para inglês ([78e28aa](https://github.com/adams-alves-dev/pedala-sampa/commit/78e28aa109f50353d628db0a029308621444b4e2))
* **tema:** renomear temas para light/dark (identificadores em inglês) ([65d98e1](https://github.com/adams-alves-dev/pedala-sampa/commit/65d98e1e9c39135bf3f77e27d802ea1958846749))


### 📝 Documentação

* atualiza contato do README para o LinkedIn ([#74](https://github.com/adams-alves-dev/pedala-sampa/issues/74)) ([c1abde3](https://github.com/adams-alves-dev/pedala-sampa/commit/c1abde32b4d41c1e4c06efad72306fdfbed3c579))
* atualiza README para o novo momento (Nuxt 3 + redesign) ([#71](https://github.com/adams-alves-dev/pedala-sampa/issues/71)) ([05c908b](https://github.com/adams-alves-dev/pedala-sampa/commit/05c908b14c41645d9a173240effbe5ccd99405f7))
* campo de status da sugestão vira reviewStatus (status é reservado no Hygraph) ([06cbaef](https://github.com/adams-alves-dev/pedala-sampa/commit/06cbaef223354f8d02fab047d2d190aea4d931d5))


### 💄 Estilo

* aplica Prettier como baseline de formatação ([d2b469f](https://github.com/adams-alves-dev/pedala-sampa/commit/d2b469f0bfe9927fa27f791cf5a14678d4904dd2))
* **header:** remover canto chanfrado e deixar a barra chapada ([021c822](https://github.com/adams-alves-dev/pedala-sampa/commit/021c822177b39d3cc1c2ccaedd0379347eccc8ec))
* remover canto chanfrado do header (retângulo chapado) ([5237a74](https://github.com/adams-alves-dev/pedala-sampa/commit/5237a74686169b839052959a746d3101fab9fb4b))
