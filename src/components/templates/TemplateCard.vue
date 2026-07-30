<script setup lang="ts">
import type { ExpenseTemplate } from '@/types/expense'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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

const props = defineProps<{
  template: ExpenseTemplate
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: [isActive: boolean]
}>()

function handleToggle(val: boolean) {
  emit('toggle', val)
}
</script>

<template>
  <Card
    class="transition-opacity"
    :class="{ 'opacity-60': !template.isActive }"
  >
    <CardHeader class="pb-2">
      <div class="flex items-start justify-between gap-2">
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-foreground truncate">{{ template.name }}</p>
          <Badge
            variant="outline"
            class="mt-1 text-[10px] px-1.5 py-0 h-4"
            :class="template.isActive ? '' : 'badge-inactive'"
          >
            {{ template.category }}
          </Badge>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1.5 shrink-0">
          <Switch
            :checked="template.isActive"
            @update:checked="handleToggle"
            :aria-label="`Toggle ${template.name}`"
          />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-7 w-7">
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
    </CardHeader>
    <CardContent class="pt-0">
      <p class="text-xl font-bold tabular-nums text-foreground">
        {{ formatCurrency(template.amount) }}
      </p>
      <p class="text-xs text-muted-foreground mt-1">
        {{ template.isActive ? '✓ Activa — se genera mensualmente' : '✗ Inactiva' }}
      </p>
    </CardContent>
  </Card>
</template>
