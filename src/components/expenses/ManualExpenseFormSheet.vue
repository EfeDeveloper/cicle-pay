<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CreateManualExpenseInput } from '@/types/expense'
import { getCurrentPeriodKey } from '@/services/expenseService'
import ExpenseBaseFieldsSection from '@/components/expenses/ExpenseBaseFieldsSection.vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const props = withDefaults(
  defineProps<{
    open: boolean
    periodKey?: string
  }>(),
  {
    periodKey: undefined,
  },
)

const emit = defineEmits<{
  close: []
  saved: [payload: CreateManualExpenseInput]
}>()

const form = ref({
  name: '',
  description: '',
  amount: '' as string | number,
  dueDay: 'none',
  category: '',
  periodKey: getCurrentPeriodKey(),
  markAsPaid: false,
})

const errors = ref({
  name: '',
  description: '',
  amount: '',
  dueDay: '',
  category: '',
  periodKey: '',
})

watch(
  () => props.open,
  (open) => {
    if (open) resetForm()
  },
)

function resetForm() {
  form.value = {
    name: '',
    description: '',
    amount: '',
    dueDay: 'none',
    category: '',
    periodKey: props.periodKey ?? getCurrentPeriodKey(),
    markAsPaid: false,
  }
  errors.value = {
    name: '',
    description: '',
    amount: '',
    dueDay: '',
    category: '',
    periodKey: '',
  }
}

function validate(): boolean {
  errors.value = {
    name: '',
    description: '',
    amount: '',
    dueDay: '',
    category: '',
    periodKey: '',
  }

  let valid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
    valid = false
  }

  const description = form.value.description.trim()
  if (description.length > 140) {
    errors.value.description = 'La descripción no puede superar 140 caracteres'
    valid = false
  }

  const amount = Number(form.value.amount)
  if (!form.value.amount || Number.isNaN(amount) || amount <= 0) {
    errors.value.amount = 'Ingresa un monto válido mayor a 0'
    valid = false
  }

  if (form.value.dueDay !== 'none') {
    const day = Number(form.value.dueDay)
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errors.value.dueDay = 'Selecciona un día entre 1 y 31'
      valid = false
    }
  }

  if (!form.value.category) {
    errors.value.category = 'Selecciona una categoría'
    valid = false
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(form.value.periodKey)) {
    errors.value.periodKey = 'El período debe tener formato YYYY-MM'
    valid = false
  }

  return valid
}

function handleSave() {
  if (!validate()) return

  const description = form.value.description.trim()
  const dueDay = form.value.dueDay === 'none' ? null : Number(form.value.dueDay)

  emit('saved', {
    name: form.value.name.trim(),
    description,
    amount: Number(form.value.amount),
    dueDay,
    category: form.value.category,
    periodKey: form.value.periodKey,
    status: form.value.markAsPaid ? 'paid' : 'pending',
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="flex flex-col w-full sm:max-w-md h-full min-h-0 overflow-hidden">
      <SheetHeader>
        <SheetTitle>Agregar gasto adicional</SheetTitle>
        <SheetDescription>
          Registra un gasto único del período sin crear una plantilla recurrente.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 px-2 sm:px-3 py-6 min-h-0 overflow-y-auto overscroll-contain">
        <ExpenseBaseFieldsSection
          id-prefix="manual"
          v-model:name="form.name"
          v-model:description="form.description"
          v-model:amount="form.amount"
          v-model:category="form.category"
          v-model:dueDay="form.dueDay"
          name-placeholder="Ej: Reparación, regalo, consulta..."
          main-title="Datos del gasto"
          main-hint="Nombre y notas para identificarlo."
          config-title="Importe y categoría"
          config-hint="Monto, categoría y vencimiento de este gasto."
          :errors="errors"
        >
          <template #config-extra>
            <div class="flex flex-col gap-1.5">
              <Label for="manual-period">Período</Label>
              <Input
                id="manual-period"
                v-model="form.periodKey"
                type="month"
                :class="{ 'border-destructive': errors.periodKey }"
              />
              <p v-if="errors.periodKey" class="text-destructive text-xs">{{ errors.periodKey }}</p>
            </div>

            <div class="flex justify-between items-center bg-muted/40 px-3 py-2.5 border border-border/70 rounded-2xl">
              <div>
                <p class="font-medium text-sm">Marcar como pagado</p>
                <p class="text-muted-foreground text-xs">Úsalo si el gasto ya fue cubierto</p>
              </div>
              <Switch v-model="form.markAsPaid" />
            </div>
          </template>
        </ExpenseBaseFieldsSection>
      </div>

      <SheetFooter class="pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-row gap-2 shrink-0">
        <SheetClose as-child>
          <Button variant="outline" class="flex-1" @click="emit('close')">Cancelar</Button>
        </SheetClose>
        <Button class="flex-1" @click="handleSave">Guardar gasto</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
