<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow about-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Um mapa colaborativo dos grupos de pedal de São Paulo.</h1>
      <p class="ps-lead about-lead">
        O Pedala Sampa ajuda ciclistas a descobrir grupos por região, dia, horário, nível, distância
        e ritmo — perto de casa ou do trabalho.
      </p>

      <div class="about-grid">
        <article v-for="card in cards" :key="card.num" class="about-card">
          <span class="about-ic"><PsIcon :name="card.icon" :size="22" /></span>
          <span class="num">{{ card.num }}</span>
          <h2 class="ps-h3">{{ card.title }}</h2>
          <p class="ps-body about-card__text">{{ card.text }}</p>
        </article>
      </div>

      <div class="about-cta">
        <ContributionLink context="new-group" icon="plus" />
        <ContributionLink context="correction" icon="pencil" variant="ghost" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import ContributionLink from '../components/contribution/ContributionLink.vue'
import type { IconName } from '../lib/icons'

const cards: Array<{ num: string; icon: IconName; title: string; text: string }> = [
  {
    num: '01',
    icon: 'layers',
    title: 'Como funciona',
    text: 'Os grupos cadastrados aparecem no mapa e na lista. Cada um traz ponto de saída, agenda e dados práticos do pedal.',
  },
  {
    num: '02',
    icon: 'users',
    title: 'Colaboração',
    text: 'As informações mudam. A comunidade mantém o mapa vivo sugerindo grupos e correções.',
  },
  {
    num: '03',
    icon: 'pencil',
    title: 'Como contribuir',
    text: 'Sugira um grupo novo ou corrija dados desatualizados por um formulário rápido.',
  },
]

useSeoMeta({
  title: 'Sobre - Pedala Sampa',
  description: 'Conheça o Pedala Sampa, um mapa colaborativo de grupos de pedal em São Paulo.',
})
</script>

<style scoped>
.about-eyebrow {
  margin: var(--space-6) 0 var(--space-2);
}

.about-lead {
  max-width: 680px;
  margin-top: var(--space-4);
}

.about-card__text {
  margin: 0;
  color: var(--color-asphalt-55);
}

.about-cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
