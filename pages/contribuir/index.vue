<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow contribuir-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Sugerir um grupo novo</h1>
      <p class="ps-lead contribuir-lead">
        Conhece um pedal que ainda não está no mapa? Preencha o que souber — a sugestão passa por
        revisão antes de ir ao ar.
      </p>

      <SugestaoCreateForm />

      <p class="ps-body contribuir-alt">
        Quer corrigir um grupo que já existe?
        <NuxtLink to="/contribuir/correcao">Sugerir correção</NuxtLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import SugestaoCreateForm from '../../components/contribution/SugestaoCreateForm.vue'

useSeoMeta({
  title: 'Sugerir grupo - Pedala Sampa',
  description: 'Sugira um grupo de pedal novo para o mapa colaborativo do Pedala Sampa.',
})
</script>

<style scoped>
.contribuir-eyebrow {
  margin: var(--space-6) 0 var(--space-2);
}

.contribuir-lead {
  max-width: 680px;
  margin: var(--space-4) 0 var(--space-8);
}

.contribuir-alt {
  margin-top: var(--space-8);
  color: var(--color-asphalt-55);
}
</style>
