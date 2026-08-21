<script setup lang="ts">
import type { RecordDetail } from '@/lib/recordDetail'
import { computed } from 'vue'
import { formatCurrency, formatPeriodLabel } from '@/services/expenseService'
import { hasDescription } from '@/lib/recordDetail'
import { getCategoryIcon } from '@/lib/categoryVisuals'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const props = defineProps<{
  open: boolean
  record: RecordDetail | null
}>()

const emit = defineEmits<{
  close: []
}>()

const icon = computed(() => (props.record ? getCategoryIcon(props.record.category) : null))

const previewDescription = computed(() => {
  const record = props.record
  if (!record) return ''
  if (record.kind === 'template') {
    return `Vista previa de la plantilla ${record.name}, categoría ${record.category}`
  }
  return `Vista previa del gasto ${record.name}, categoría ${record.category}`
})

const paidAtLabel = computed(() => {
  const paidAt = props.record?.paidAt
  if (!paidAt || typeof paidAt !== 'object' || !('toDate' in paidAt)) {
    return null
  }

  const toDate = (paidAt as { toDate: () => Date }).toDate
  if (typeof toDate !== 'function') {
    return null
  }

  return toDate.call(paidAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})
</script>

<template>
  <Sheet :open="open" @update:open="(isOpen) => !isOpen && emit('close')">
    <SheetContent
      v-if="record"
      side="right"
      class="flex flex-col w-full sm:max-w-md h-full min-h-0 overflow-hidden"
    >
      <SheetHeader>
        <SheetTitle class="pr-8">{{ record.name }}</SheetTitle>
        <SheetDescription class="sr-only">{{ previewDescription }}</SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 px-2 sm:px-3 py-6 min-h-0 overflow-y-auto overscroll-contain">
        <div class="space-y-4 bg-card shadow-card p-5 border border-border/70 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-brand-soft rounded-xl size-11 shrink-0">
              <component :is="icon" class="size-4 text-brand" />
            </div>
            <div class="min-w-0">
              <p class="font-bold tabular-nums text-2xl tracking-tight">
                {{ formatCurrency(record.amount) }}
              </p>
              <p class="mt-1 text-muted-foreground text-xs">{{ record.category }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <Badge v-if="record.kind === 'template'" variant="outline">
              {{ record.isActive ? 'Activa' : 'Inactiva' }}
            </Badge>
            <Badge
              v-if="record.status"
              variant="outline"
              :class="record.status === 'paid' ? 'badge-paid' : 'badge-pending'"
            >
              {{ record.status === 'paid' ? 'Pagado' : 'Pendiente' }}
            </Badge>
            <Badge v-if="record.source === 'manual'" variant="secondary">Adicional</Badge>
          </div>
        </div>

        <div class="space-y-3 bg-card shadow-card p-5 border border-border/70 rounded-2xl text-sm">
          <p v-if="record.dueDay" class="flex justify-between gap-3">
            <span class="text-muted-foreground">Día de pago</span>
            <span class="font-medium">Día {{ record.dueDay }}</span>
          </p>
          <p v-else class="flex justify-between gap-3">
            <span class="text-muted-foreground">Día de pago</span>
            <span class="font-medium">Sin día fijo</span>
          </p>
          <p v-if="record.periodKey" class="flex justify-between gap-3">
            <span class="text-muted-foreground">Período</span>
            <span class="font-medium capitalize">{{ formatPeriodLabel(record.periodKey) }}</span>
          </p>
          <p v-if="paidAtLabel" class="flex justify-between gap-3">
            <span class="text-muted-foreground">Pagado el</span>
            <span class="font-medium">{{ paidAtLabel }}</span>
          </p>
        </div>

        <div v-if="hasDescription(record.description)" class="space-y-2 bg-card shadow-card p-5 border border-border/70 rounded-2xl">
          <p class="font-medium text-sm">Nota</p>
          <p class="text-muted-foreground text-sm whitespace-pre-wrap wrap-break-word">
            {{ record.description }}
          </p>
        </div>
        <p v-else class="text-muted-foreground text-sm px-1">
          Esta ficha no tiene nota.
        </p>
      </div>

      <SheetFooter class="pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
        <SheetClose as-child>
          <Button variant="outline" class="w-full min-h-11" @click="emit('close')">Cerrar</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
