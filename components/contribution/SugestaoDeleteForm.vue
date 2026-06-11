<template>
  <p v-if="pending" class="ps-body" role="status">Carregando dados do grupo…</p>

  <div v-else-if="!registro" class="sugestao-notfound">
    <p class="ps-body">Não encontramos esse grupo. Ele pode já ter sido removido.</p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <div v-else>
    <div class="sugestao-resumo">
      <p class="ps-label">Grupo</p>
      <p class="ps-data">{{ registro.name }}</p>
      <p v-if="registro.address" class="ps-body">{{ registro.address }}</p>
      <p v-if="registro.day || registro.startHour" class="ps-body">
        {{ [registro.day, registro.startHour].filter(Boolean).join(' · ') }}
      </p>
    </div>

    <p class="ps-body sugestao-intro">
      O pedido de remoção passa por revisão antes de qualquer mudança. Se você é quem organiza o
      pedal e não quer o grupo exposto no site, conte isso na justificativa — esse pedido tem
      prioridade.
    </p>

    <SugestaoFormBase
      submit-label="Solicitar remoção"
      justificativa-label="Motivo da remoção"
      justificativa-hint="Ex.: o grupo encerrou as atividades, ou sou o organizador e não quero o grupo no site."
      :build-request="buildRequest"
    />
  </div>
</template>

<script setup lang="ts">
import type { SugestaoRequest } from '../../types/sugestao'
import SugestaoFormBase from './SugestaoFormBase.vue'

const props = defineProps<{
  slug: string
}>()

const { buscarRegistro } = useSugestoes()

const { data: registro, pending } = useAsyncData(
  `registro:${props.slug}`,
  () => buscarRegistro(props.slug).catch(() => null),
  { server: false, default: () => null },
)

function buildRequest(common: {
  justificativa: string
  contatoEmail: string
  turnstileToken: string
  website: string
}): SugestaoRequest | { error: string } {
  if (!registro.value) {
    return { error: 'Grupo não carregado. Recarregue a página.' }
  }

  return {
    tipo: 'DELETE',
    alvoId: registro.value.id,
    ...common,
  }
}
</script>

<style scoped>
.sugestao-resumo {
  display: grid;
  gap: var(--space-1);
  max-width: 560px;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border: 2px solid var(--color-border);
}

.sugestao-resumo p {
  margin: 0;
}

.sugestao-intro {
  max-width: 560px;
  margin-bottom: var(--space-5);
}

.sugestao-notfound {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}
</style>
