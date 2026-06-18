<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow legal-eyebrow">Termos</p>
      <h1 class="ps-h1">Termos de Uso</h1>
      <p class="ps-lead legal-lead">
        Ao usar o Pedala Sampa, você concorda com estes termos. Eles explicam o
        que o site oferece, o que esperamos de você e os limites do serviço.
      </p>
      <p class="legal-updated">Última atualização: 18 de junho de 2026.</p>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">1. Sobre o serviço</h2>
        <p class="ps-body">
          O Pedala Sampa é um mapa colaborativo e gratuito de grupos de pedal em
          São Paulo, mantido pela comunidade. Tem caráter informativo: ajuda a
          descobrir grupos, mas não organiza pedais nem representa os grupos
          listados.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">2. Informações da comunidade</h2>
        <p class="ps-body">
          Os dados dos grupos vêm de contribuições da comunidade e podem estar
          desatualizados ou incompletos.
          <strong
            >Confirme horários, ponto de saída e nível diretamente com o grupo
            antes de pedalar.</strong
          >
          Não garantimos a exatidão das informações.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">3. Suas contribuições</h2>
        <p class="ps-body">
          Ao enviar uma sugestão, correção ou mensagem, você declara que as
          informações são verdadeiras e que pode compartilhá-las. As
          contribuições passam por revisão da equipe antes de irem ao ar e podem
          ser editadas, recusadas ou removidas. Você concede ao Pedala Sampa o
          direito de exibir o conteúdo enviado no mapa colaborativo.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">4. Conduta</h2>
        <p class="ps-body">Ao usar os formulários, você concorda em não:</p>
        <ul class="legal-list">
          <li>enviar conteúdo falso, ofensivo, ilícito ou spam;</li>
          <li>
            publicar dados pessoais de terceiros sem autorização ou base legal;
          </li>
          <li>
            tentar burlar as proteções anti-abuso ou prejudicar o funcionamento
            do site.
          </li>
        </ul>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">5. Responsabilidade</h2>
        <p class="ps-body">
          O serviço é oferecido "como está", sem garantias. O Pedala Sampa não
          se responsabiliza por decisões tomadas com base nas informações do
          site nem por qualquer ocorrência durante os pedais, que são de
          responsabilidade de quem os realiza.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">6. Privacidade e alterações</h2>
        <p class="ps-body">
          O tratamento dos seus dados é descrito na
          <NuxtLink to="/privacy">Política de Privacidade</NuxtLink>. Podemos
          atualizar estes termos; a data de revisão no topo indica a versão
          vigente. Dúvidas? Fale com a gente pelo
          <NuxtLink to="/about">formulário de contato</NuxtLink>.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Termos de Uso - Pedala Sampa',
  description:
    'Termos de uso do Pedala Sampa: natureza colaborativa do mapa, suas contribuições e limites do serviço.',
})
</script>
