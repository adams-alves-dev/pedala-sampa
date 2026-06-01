<template>
  <main>
    <section class="about">
      <p class="eyebrow">Mapa colaborativo</p>
      <h1>Encontre grupos de pedal em São Paulo.</h1>
      <p class="lead">
        O Pedala Sampa ajuda ciclistas a descobrir grupos por região, dia, horário, nível, distância e ritmo.
      </p>
      <div class="grid">
        <article>
          <h2>Como funciona</h2>
          <p>Os grupos cadastrados aparecem no mapa e na lista da página inicial. Cada grupo tem ponto de saída, agenda e informações práticas do pedal.</p>
        </article>
        <article>
          <h2>Colaboração</h2>
          <p>As informações podem mudar. Use o formulário externo para sugerir um novo grupo ou corrigir dados desatualizados.</p>
        </article>
      </div>
      <ContributionLink :href="contributionFormUrl" context="new-group" />
    </section>
  </main>
</template>

<script setup lang="ts">
import ContributionLink from '../components/contribution/ContributionLink.vue'

const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl

useSeoMeta({
  title: 'Sobre - Pedala Sampa',
  description: 'Conheça o Pedala Sampa, um mapa colaborativo de grupos de pedal em São Paulo.',
})
</script>

<style scoped>
.about {
  max-width: 980px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-5);
}

.eyebrow {
  color: var(--color-bike-green);
  font-weight: 900;
  text-transform: uppercase;
  font-size: var(--text-sm);
}

h1 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  line-height: 0.95;
  margin: 0;
  max-width: 780px;
}

.lead {
  font-size: var(--text-lg);
  line-height: 1.6;
  max-width: 680px;
}

.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: var(--space-10) 0;
}

article {
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  background: var(--color-paper);
  padding: var(--space-5);
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
