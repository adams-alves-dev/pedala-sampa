<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow contribute-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Adicionar uma agenda</h1>
      <p class="ps-lead contribute-lead">
        Um grupo pode pedalar em mais de um dia e nível. Escolha o grupo na
        lista (ou crie um novo) e descreva a agenda — passa por revisão antes de
        ir ao ar.
      </p>

      <SuggestionScheduleForm
        :groups="groups ?? []"
        :pending="pending"
        :preselect-slug="preselectSlug"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SuggestionScheduleForm from '../../components/contribution/SuggestionScheduleForm.vue'

const route = useRoute()
const { data: groups, pending } = useGroups()

const preselectSlug = computed(() => {
  const value = route.query.group
  return typeof value === 'string' ? value : undefined
})

useSeoMeta({
  title: 'Adicionar agenda - Pedala Sampa',
  description:
    'Adicione uma nova agenda (dia, horário e nível) a um grupo de pedal do mapa colaborativo do Pedala Sampa.',
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
