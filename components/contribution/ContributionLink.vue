<template>
  <a
    v-if="state.isEnabled"
    class="contribution-link"
    :href="state.href"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ label }}
  </a>
  <span v-else class="contribution-link contribution-link--disabled" aria-disabled="true">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getContributionLinkState } from '../../lib/contribution'

const props = withDefaults(
  defineProps<{
    href?: string
    context?: 'new-group' | 'correction'
  }>(),
  {
    href: '',
    context: 'new-group',
  },
)

const label = computed(() => (props.context === 'correction' ? 'Sugerir correção' : 'Sugerir grupo'))
const state = computed(() => getContributionLinkState(props.href))
</script>

<style scoped>
.contribution-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  background: var(--color-sign-yellow);
  color: var(--color-asphalt);
  font-weight: 800;
  text-decoration: none;
}

.contribution-link--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
