<script setup lang="ts">
import { computed } from 'vue'
import type { ExpenseTemplate } from '@/types/expense'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil, Trash2 } from '@lucide/vue'
import { formatCurrency } from '@/services/expenseService'
import { getCategoryIcon } from '@/lib/categoryVisuals'
import { hasDescription } from '@/lib/recordDetail'

const props = defineProps<{
  template: ExpenseTemplate
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: [isActive: boolean]
  view: []
}>()

const icon = computed(() => getCategoryIcon(props.template.category))

function handleToggle(val: boolean) {
  emit('toggle', val)
}
</script>

<template>
  <Card
    class="shadow-card transition-opacity cursor-pointer"
    :class="{ 'opacity-60': !template.isActive }"
    role="button"
    :aria-label="`Ver detalle de ${template.name}`"
    @click="emit('view')"
  >
    <CardContent class="space-y-4">
      <div class="flex justify-between items-start gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex justify-center items-center bg-brand-soft rounded-xl size-10 shrink-0">
            <component :is="icon" class="size-4 text-brand" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-sm truncate">{{ template.name }}</p>
            <div class="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge
                variant="outline"
                class="px-1.5 py-0 h-4 text-[10px]"
                :class="template.isActive ? '' : 'badge-inactive'"
              >
                {{ template.category }}
              </Badge>
              <Badge
                v-if="hasDescription(template.description)"
                variant="secondary"
                class="px-1.5 py-0 h-4 text-[10px]"
              >
                Nota
              </Badge>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0" @click.stop>
          <Switch
            :model-value="template.isActive"
            @update:model-value="handleToggle"
            :aria-label="`Toggle ${template.name}`"
          />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="w-11 h-11">
                <MoreVertical class="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-40">
              <DropdownMenuItem @click="emit('edit')" class="gap-2">
                <Pencil class="w-3.5 h-3.5" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                @click="emit('delete')"
                class="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p class="font-bold tabular-nums text-2xl tracking-tight">
        {{ formatCurrency(template.amount) }}
      </p>
      <p class="text-muted-foreground text-xs">
        {{ template.isActive ? 'Activa — se genera mensualmente' : 'Inactiva' }}
      </p>
    </CardContent>
  </Card>
</template>
