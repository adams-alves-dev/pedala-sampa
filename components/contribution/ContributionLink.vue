<template>
  <a
    v-if="state.isEnabled"
    class="contribution-link"
    :class="{ 'contribution-link--fab': fab, 'contribution-link--ghost': variant === 'ghost' }"
    :href="state.href"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="label + ' (abre em nova aba)'"
  >
    <PsIcon v-if="icon" :name="icon" :size="15" />
    <span>{{ label }}</span>
    <svg v-if="fab" class="cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </a>
  <span v-else class="contribution-link contribution-link--disabled" aria-disabled="true">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getContributionLinkState } from '../../lib/contribution'
import type { IconName } from '../../lib/icons'

const props = withDefaults(
  defineProps<{
    href?: string
    context?: 'new-group' | 'correction'
    fab?: boolean
    icon?: IconName
    variant?: 'cta' | 'ghost'
  }>(),
  {
    href: '',
    context: 'new-group',
    fab: false,
    icon: undefined,
    variant: 'cta',
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
  gap: var(--space-2);
  min-height: 42px;
  padding: 0 var(--space-5);
  background: var(--color-sun);
  color: var(--color-asphalt);
  font-weight: 800;
  font-size: var(--text-sm);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
  clip-path: polygon(var(--space-1) 0, 100% 0, calc(100% - var(--space-1)) 100%, 0 100%);
}

.contribution-link:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--color-asphalt);
}

.contribution-link--ghost {
  background: transparent;
  color: var(--color-asphalt);
  border: 2px solid var(--color-border);
  clip-path: none;
}

.contribution-link--ghost:hover {
  border-color: var(--color-asphalt);
  transform: none;
  box-shadow: none;
}

.contribution-link--disabled {
  cursor: not-allowed;
  opacity: 0.45;
  clip-path: none;
}

.contribution-link--disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>
