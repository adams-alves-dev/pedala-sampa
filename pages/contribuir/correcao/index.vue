<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow contribuir-eyebrow">Mapa colaborativo</p>
      <h1 class="ps-h1">Qual grupo você quer corrigir?</h1>
      <p class="ps-lead contribuir-lead">
        Escolha o grupo abaixo para abrir o formulário de correção com os dados atuais.
      </p>

      <div class="ps-field-group contribuir-busca">
        <label class="ps-fieldlabel" for="busca-grupo">Buscar grupo</label>
        <input
          id="busca-grupo"
          v-model="busca"
          class="ps-input"
          type="search"
          placeholder="Nome do grupo"
        >
      </div>

      <p v-if="pending" class="ps-body" role="status">Carregando grupos…</p>
      <ul v-else class="contribuir-lista">
        <li v-for="group in gruposFiltrados" :key="group.id">
          <NuxtLink class="contribuir-item" :to="`/contribuir/correcao/${group.slug}`">
            <strong>{{ group.name }}</strong>
            <span v-if="group.departureAddress" class="contribuir-item__addr">
              {{ group.departureAddress }}
            </span>
          </NuxtLink>
        </li>
        <li v-if="!gruposFiltrados.length" class="ps-body">Nenhum grupo encontrado.</li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: groups, pending } = useGroups()
const busca = ref('')

const gruposFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  const lista = groups.value ?? []
  if (!termo) {
    return lista
  }
  return lista.filter((group) => group.name.toLocaleLowerCase('pt-BR').includes(termo))
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
  margin: var(--space-4) 0 var(--space-6);
}

.contribuir-busca {
  max-width: 420px;
  margin-bottom: var(--space-5);
}

.contribuir-lista {
  display: grid;
  gap: var(--space-2);
  max-width: 560px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contribuir-item {
  display: grid;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  text-decoration: none;
  color: var(--color-asphalt);
}

.contribuir-item:hover {
  border-color: var(--color-asphalt);
}

.contribuir-item__addr {
  font-size: var(--text-sm);
  color: var(--color-asphalt-55);
}
</style>
