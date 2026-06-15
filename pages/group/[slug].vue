<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p v-if="pending" class="ps-body group-status">Carregando grupo…</p>

      <template v-else-if="error || !group">
        <h1 class="ps-h1 group-notfound">Grupo não encontrado</h1>
        <p class="ps-lead">
          Esse grupo pode ter sido removido.
          <NuxtLink to="/" class="group-notfound__link">Volte ao mapa</NuxtLink>
          para explorar os demais.
        </p>
      </template>

      <GroupDetails v-else :group="group" />
    </div>
  </main>
</template>

<script setup lang="ts">
import GroupDetails from '../../components/group/GroupDetails.vue'
import { useGroup } from '../../composables/useGroup'

const route = useRoute()
const slug = String(route.params.slug)
const { data: group, pending, error } = await useGroup(slug)

const title = () =>
  group.value
    ? `${group.value.name} - Pedala Sampa`
    : 'Grupo não encontrado - Pedala Sampa'
const description = () =>
  group.value
    ? `Veja ponto de saída, horário, nível, distância e ritmo do grupo ${group.value.name} em São Paulo.`
    : 'Grupo de pedal não encontrado no Pedala Sampa.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary',
})
</script>

<style scoped>
.group-status {
  margin-top: var(--space-6);
  color: var(--color-asphalt-55);
}

.group-notfound {
  margin-top: var(--space-6);
}

.group-notfound__link {
  text-decoration: underline;
  font-weight: 800;
}
</style>
