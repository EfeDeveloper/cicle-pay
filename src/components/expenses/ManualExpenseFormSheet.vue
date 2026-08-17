<script setup lang="ts">
import { ref, watch } from 'vue'
import { EXPENSE_CATEGORIES, type CreateManualExpenseInput } from '@/types/expense'
import { getCurrentPeriodKey } from '@/services/expenseService'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: [payload: CreateManualExpenseInput]
}>()

const form = ref({
  name: '',
  amount: '' as string | number,
  category: '',
  periodKey: getCurrentPeriodKey(),
  markAsPaid: false,
})

const errors = ref({
  name: '',
  amount: '',
  category: '',
  periodKey: '',
})

watch(
  () => props.open,
  (open) => {
    if (!open) resetForm()
  },
)

function resetForm() {
  form.value = {
    name: '',
    amount: '',
    category: '',
    periodKey: getCurrentPeriodKey(),
    markAsPaid: false,
  }
  errors.value = {
    name: '',
    amount: '',
    category: '',
    periodKey: '',
  }
}

function validate(): boolean {
  errors.value = {
    name: '',
    amount: '',
    category: '',
    periodKey: '',
  }

  let valid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
    valid = false
  }

  const amount = Number(form.value.amount)
  if (!form.value.amount || Number.isNaN(amount) || amount <= 0) {
    errors.value.amount = 'Ingresa un monto válido mayor a 0'
    valid = false
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

  emit('saved', {
    name: form.value.name.trim(),
    amount: Number(form.value.amount),
    category: form.value.category,
    periodKey: form.value.periodKey,
    status: form.value.markAsPaid ? 'paid' : 'pending',
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="flex flex-col w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Agregar gasto adicional</SheetTitle>
        <SheetDescription>
          Registra un gasto único del período sin crear una plantilla recurrente.
        </SheetDescription>
      </SheetHeader>

      <div class="flex flex-col flex-1 gap-5 py-6">
        <div class="flex flex-col gap-1.5">
          <Label for="manual-name">Nombre</Label>
          <Input
            id="manual-name"
            v-model="form.name"
            placeholder="Ej: Reparación, regalo, consulta..."
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-destructive text-xs">{{ errors.name }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="manual-amount">Monto</Label>
          <div class="relative">
            <span
              class="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none"
            >
              $
            </span>
            <Input
              id="manual-amount"
              v-model="form.amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              class="pl-6"
              :class="{ 'border-destructive': errors.amount }"
            />
          </div>
          <p v-if="errors.amount" class="text-destructive text-xs">{{ errors.amount }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="manual-category">Categoría</Label>
          <Select v-model="form.category">
            <SelectTrigger
              id="manual-category"
              :class="{ 'border-destructive': errors.category }"
            >
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
                {{ cat }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.category" class="text-destructive text-xs">{{ errors.category }}</p>
        </div>

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

        <div class="flex justify-between items-center bg-muted px-3 py-2 rounded-lg">
          <div>
            <p class="font-medium text-sm">Marcar como pagado</p>
            <p class="text-muted-foreground text-xs">Úsalo si el gasto ya fue cubierto</p>
          </div>
          <Switch v-model="form.markAsPaid" />
        </div>
      </div>

      <SheetFooter class="flex flex-row gap-2">
        <SheetClose as-child>
          <Button variant="outline" class="flex-1" @click="emit('close')">Cancelar</Button>
        </SheetClose>
        <Button class="flex-1" @click="handleSave">Guardar gasto</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
