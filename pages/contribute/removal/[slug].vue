<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink :to="`/group/${slug}`" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao grupo
      </NuxtLink>

      <p class="ps-eyebrow contribute-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Solicitar remoção</h1>
      <p class="ps-lead contribute-lead">
        O grupo encerrou, mudou ou não quer mais aparecer no Pedala Sampa? Conte o motivo abaixo.
      </p>

      <SuggestionDeleteForm :slug="slug" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SuggestionDeleteForm from '../../../components/contribution/SuggestionDeleteForm.vue'

const route = useRoute()
const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param[0] : param
})

useSeoMeta({
  title: 'Solicitar remoção - Pedala Sampa',
  description: 'Solicite a remoção de um grupo do mapa colaborativo do Pedala Sampa.',
})
</script>

<style scoped>
.contribute-eyebrow {
  margin: var(--space-6) 0 var(--space-2);
}

.contribute-lead {
  max-width: 680px;
  margin: var(--space-4) 0 var(--space-8);
}
</style>
