<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow contribute-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Qual grupo você quer corrigir?</h1>
      <p class="ps-lead contribute-lead">
        Escolha o grupo abaixo para abrir o formulário de correção com os dados
        atuais.
      </p>

      <div class="ps-field-group contribute-search">
        <label class="ps-fieldlabel" for="group-search">Buscar grupo</label>
        <input
          id="group-search"
          v-model="searchQuery"
          class="ps-input"
          type="search"
          placeholder="Nome do grupo"
        />
      </div>

      <p v-if="pending" class="ps-body" role="status">Carregando grupos…</p>
      <ul v-else class="contribute-list">
        <li v-for="group in filteredGroups" :key="group.id">
          <NuxtLink
            class="contribute-item"
            :to="`/contribute/correction/${group.slug}`"
          >
            <strong>{{ group.name }}</strong>
            <span v-if="group.departureAddress" class="contribute-item__addr">
              {{ group.departureAddress }}
            </span>
          </NuxtLink>
        </li>
        <li v-if="!filteredGroups.length" class="ps-body">
          Nenhum grupo encontrado.
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: groups, pending } = useGroups()
const searchQuery = ref('')

const filteredGroups = computed(() => {
  const searchTerm = searchQuery.value.trim().toLocaleLowerCase('pt-BR')
  const list = groups.value ?? []
  if (!searchTerm) {
    return list
  }
  return list.filter((group) =>
    group.name.toLocaleLowerCase('pt-BR').includes(searchTerm),
  )
})

useSeoMeta({
  title: 'Sugerir correção - Pedala Sampa',
  description:
    'Corrija informações de um grupo de pedal no mapa colaborativo do Pedala Sampa.',
})
</script>

<style scoped>
.contribute-eyebrow {
  margin: var(--space-6) 0 var(--space-2);
}

.contribute-lead {
  max-width: 680px;
  margin: var(--space-4) 0 var(--space-6);
}

.contribute-search {
  max-width: 420px;
  margin-bottom: var(--space-5);
}

.contribute-list {
  display: grid;
  gap: var(--space-2);
  max-width: 560px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contribute-item {
  display: grid;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  text-decoration: none;
  color: var(--color-asphalt);
}

.contribute-item:hover {
  border-color: var(--color-asphalt);
}

.contribute-item__addr {
  font-size: var(--text-sm);
  color: var(--color-asphalt-55);
}
</style>
