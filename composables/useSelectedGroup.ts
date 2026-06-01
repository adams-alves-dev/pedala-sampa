import { computed, ref } from 'vue'
import type { Group } from '../types/group'

export function useSelectedGroup(groups: Ref<Group[]>) {
  const selectedGroupSlug = ref<string | null>(null)

  const selectedGroup = computed(
    () => groups.value.find((group) => group.slug === selectedGroupSlug.value) || null,
  )

  function selectGroup(slug: string) {
    selectedGroupSlug.value = slug
  }

  function clearSelectedGroup() {
    selectedGroupSlug.value = null
  }

  return {
    selectedGroupSlug,
    selectedGroup,
    selectGroup,
    clearSelectedGroup,
  }
}
