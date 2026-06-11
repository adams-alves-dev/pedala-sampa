<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink :to="`/group/${slug}`" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao grupo
      </NuxtLink>

      <p class="ps-eyebrow contribuir-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Sugerir correção</h1>
      <p class="ps-lead contribuir-lead">
        Encontrou um dado desatualizado? Corrija abaixo — a sugestão passa por revisão antes de ir
        ao ar.
      </p>

      <SugestaoUpdateForm :slug="slug" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SugestaoUpdateForm from '../../../components/contribution/SugestaoUpdateForm.vue'

const route = useRoute()
const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param[0] : param
})

useSeoMeta({
  title: 'Sugerir correção - Pedala Sampa',
  description: 'Corrija informações de um grupo de pedal no mapa colaborativo do Pedala Sampa.',
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
</style>
