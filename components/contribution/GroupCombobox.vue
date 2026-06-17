<template>
  <div class="combobox">
    <label class="ps-fieldlabel" :for="`${uid}-input`">Grupo *</label>

    <div class="combobox__control">
      <input
        :id="`${uid}-input`"
        ref="inputRef"
        v-model="query"
        class="ps-input combobox__input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="`${uid}-listbox`"
        :aria-activedescendant="activeId"
        :placeholder="pending ? 'Carregando grupos…' : placeholder"
        :disabled="pending"
        @input="onInput"
        @focus="open = true"
        @keydown="onKeydown"
        @blur="open = false"
      />
      <span
        v-if="selectedKind"
        class="combobox__badge"
        :class="`combobox__badge--${selectedKind}`"
        aria-hidden="true"
      >
        <PsIcon
          :name="selectedKind === 'existing' ? 'check' : 'plus'"
          :size="13"
        />
        {{ selectedKind === 'existing' ? 'grupo existente' : 'grupo novo' }}
      </span>
    </div>

    <ul
      v-show="open"
      :id="`${uid}-listbox`"
      class="combobox__list"
      role="listbox"
      aria-label="Grupos"
    >
      <li
        v-for="(group, index) in filtered"
        :id="`${uid}-opt-${index}`"
        :key="group.id"
        class="combobox__opt"
        :class="{ 'is-active': index === activeIndex }"
        role="option"
        :aria-selected="index === activeIndex"
        @mousedown.prevent="choose(index)"
        @mousemove="activeIndex = index"
      >
        <span class="combobox__opt-name">{{ group.name }}</span>
        <span class="combobox__opt-meta">{{ scheduleCount(group) }}</span>
      </li>

      <li
        :id="`${uid}-opt-new`"
        class="combobox__opt combobox__opt--new"
        :class="{ 'is-active': activeIndex === filtered.length }"
        role="option"
        :aria-selected="activeIndex === filtered.length"
        @mousedown.prevent="chooseNew()"
        @mousemove="activeIndex = filtered.length"
      >
        <PsIcon name="plus" :size="14" />
        <span>
          Criar
          <strong v-if="query.trim()">“{{ query.trim() }}”</strong>
          <template v-else>um grupo</template>
          novo
        </span>
      </li>
    </ul>

    <p :id="`${uid}-hint`" class="combobox__hint">
      Escolha o grupo da lista para não duplicar. Não achou? Crie um novo.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { GroupSelection } from '../../lib/contribution'
import type { Group } from '../../types/group'

const props = withDefaults(
  defineProps<{
    groups: Group[]
    pending?: boolean
    placeholder?: string
  }>(),
  { pending: false, placeholder: 'Buscar grupo pelo nome…' },
)

const model = defineModel<GroupSelection | null>({ default: null })

const uid = useId()
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const open = ref(false)
const activeIndex = ref(0)

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

const filtered = computed(() => {
  const q = normalize(query.value)
  if (!q) {
    return props.groups
  }
  return props.groups.filter((group) => normalize(group.name).includes(q))
})

/** id da opção ativa, para `aria-activedescendant` (a "nova" fica após a lista). */
const activeId = computed<string | undefined>(() => {
  if (activeIndex.value < 0 || !open.value) {
    return undefined
  }
  return activeIndex.value < filtered.value.length
    ? `${uid}-opt-${activeIndex.value}`
    : `${uid}-opt-new`
})

const selectedKind = computed(() => model.value?.kind)

function scheduleCount(group: Group): string {
  const count = group.schedules.length
  if (count === 0) {
    return 'sem agenda'
  }
  return count === 1 ? '1 agenda' : `${count} agendas`
}

function onInput() {
  open.value = true
  // editar invalida a seleção anterior; o destaque volta para a primeira opção
  model.value = null
  activeIndex.value = 0
}

function choose(index: number) {
  const group = filtered.value[index]
  if (!group) {
    return
  }
  model.value = { kind: 'existing', group }
  query.value = group.name
  open.value = false
}

function chooseNew() {
  model.value = { kind: 'new', name: query.value.trim() }
  open.value = false
}

/** Enter/clique na opção ativa: grupo existente ou a opção "criar novo". */
function selectActive() {
  if (activeIndex.value < filtered.value.length) {
    choose(activeIndex.value)
  } else {
    chooseNew()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!open.value) {
      open.value = true
      activeIndex.value = 0
      return
    }
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      open.value = true
    }
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (event.key === 'Enter') {
    if (open.value && activeIndex.value >= 0) {
      event.preventDefault()
      selectActive()
    }
  } else if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      open.value = false
    }
  }
}

// pré-seleção externa (ex.: ?group=slug): reflete o nome do grupo no input
watch(
  model,
  (selection) => {
    if (
      selection?.kind === 'existing' &&
      query.value !== selection.group.name
    ) {
      query.value = selection.group.name
    }
  },
  { immediate: true },
)

// mantém a opção ativa visível ao navegar pelo teclado
watch(activeIndex, () => {
  if (!open.value) {
    return
  }
  nextTick(() => {
    const id = activeId.value
    if (id) {
      document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
    }
  })
})
</script>

<style scoped>
.combobox {
  position: relative;
  display: grid;
  gap: var(--space-1);
}

.combobox__control {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.combobox__input {
  flex: 1;
}

.combobox__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 2px var(--space-2);
  border: 2px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
}

.combobox__badge--existing {
  border-color: var(--color-bike-green);
  color: var(--color-green-dark);
}

.combobox__badge--new {
  border-color: var(--color-asphalt);
  color: var(--color-asphalt);
}

.combobox__list {
  position: absolute;
  z-index: 40;
  top: calc(100% - var(--space-1));
  left: 0;
  right: 0;
  max-height: 16rem;
  margin: var(--space-1) 0 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  box-shadow: var(--shadow-panel);
}

.combobox__opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
}

.combobox__opt.is-active {
  background: var(--color-concrete);
}

.combobox__opt-name {
  font-weight: 600;
}

.combobox__opt-meta {
  flex-shrink: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.combobox__opt--new {
  gap: var(--space-2);
  justify-content: flex-start;
  border-top: 2px solid var(--color-border);
  font-weight: 600;
}

.combobox__hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}
</style>
