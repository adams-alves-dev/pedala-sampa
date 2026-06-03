<script setup lang="ts">
import { computed } from 'vue'
import { ICON_PATHS, type IconName } from '../../lib/icons'

const props = withDefaults(
  defineProps<{
    name: IconName | string
    size?: number
    stroke?: number
  }>(),
  {
    size: 18,
    stroke: 1.75,
  },
)

// static, trusted paths — fall back to `info` when the name is unknown
const innerHtml = computed(() => ICON_PATHS[props.name as IconName] ?? ICON_PATHS.info)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="innerHtml"
  />
</template>
