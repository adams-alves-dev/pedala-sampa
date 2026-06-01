<template>
  <div>
    <main class="group-page">
      <NuxtLink to="/" class="back-link">Voltar para o mapa</NuxtLink>
      <p v-if="pending">Carregando grupo...</p>
      <p v-else-if="error || !group">Grupo não encontrado.</p>
      <GroupDetails v-else :group="group" :contribution-form-url="contributionFormUrl" />
    </main>
  </div>
</template>

<script setup lang="ts">
import GroupDetails from '../../components/group/GroupDetails.vue'
import { useGroup } from '../../composables/useGroup'

const route = useRoute()
const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl
const slug = String(route.params.slug)
const { data: group, pending, error } = await useGroup(slug)

useSeoMeta({
  title: () => (group.value ? `${group.value.name} - Pedala Sampa` : 'Grupo não encontrado - Pedala Sampa'),
  description: () =>
    group.value
      ? `Veja ponto de saída, horário, nível, distância e ritmo do grupo ${group.value.name} em São Paulo.`
      : 'Grupo de pedal não encontrado no Pedala Sampa.',
})
</script>

<style scoped>
.group-page {
  display: grid;
  gap: var(--space-5);
  margin: 0 auto;
  max-width: 980px;
  padding: var(--space-8) var(--space-5);
}

.back-link {
  font-weight: 800;
}
</style>
