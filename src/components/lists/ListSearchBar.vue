<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Search } from '@lucide/vue'

const modelValue = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    id?: string
    placeholder?: string
    ariaLabel?: string
  }>(),
  {
    placeholder: 'Buscar por nombre o categoría',
    ariaLabel: 'Buscar',
  },
)
</script>

<template>
  <div class="relative flex-1 min-w-0">
    <Search
      class="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2 pointer-events-none"
    />
    <Input
      :id="id"
      v-model="modelValue"
      type="search"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      class="pl-10 min-h-11"
    />
  </div>
</template>
