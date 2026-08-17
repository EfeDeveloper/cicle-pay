<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ExpenseTemplate } from '@/types/expense'
import { EXPENSE_CATEGORIES } from '@/types/expense'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
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
  template?: ExpenseTemplate
}>()

const emit = defineEmits<{
  close: []
  saved: [data: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt'>]
}>()

// ─── Form state ────────────────────────────────────────────────────────────
const form = ref({
  name: '',
  description: '',
  amount: '' as string | number,
  dueDay: 'none',
  category: '',
  isActive: true,
})

const errors = ref({
  name: '',
  description: '',
  amount: '',
  dueDay: '',
  category: '',
})

const isEditing = computed(() => !!props.template)
const dueDayOptions = Array.from({ length: 31 }, (_, i) => String(i + 1))

// Populate form when editing
watch(
  () => props.template,
  (t) => {
    if (t) {
      form.value = {
        name: t.name,
        description: t.description ?? '',
        amount: t.amount,
        dueDay: t.dueDay ? String(t.dueDay) : 'none',
        category: t.category,
        isActive: t.isActive,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// Reset when closing
watch(
  () => props.open,
  (open) => {
    if (!open) resetForm()
  },
)

function resetForm() {
  form.value = {
    name: '',
    description: '',
    amount: '',
    dueDay: 'none',
    category: '',
    isActive: true,
  }
  errors.value = { name: '', description: '', amount: '', dueDay: '', category: '' }
}

// ─── Validation ────────────────────────────────────────────────────────────
function validate(): boolean {
  errors.value = { name: '', description: '', amount: '', dueDay: '', category: '' }
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

  const amt = Number(form.value.amount)
  if (!form.value.amount || isNaN(amt) || amt <= 0) {
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
    isActive: form.value.isActive,
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="flex flex-col w-full sm:max-w-md h-full min-h-0 overflow-hidden">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Editar plantilla' : 'Nueva plantilla' }}</SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Modifica los datos de esta plantilla de gasto.'
              : 'Crea una nueva plantilla que se generará mensualmente.'
          }}
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 px-2 sm:px-3 py-6 min-h-0 overflow-y-auto overscroll-contain">
        <div class="space-y-4 bg-card p-4 border rounded-xl">
          <div class="space-y-1">
            <p class="font-semibold text-sm">Datos principales</p>
            <p class="text-muted-foreground text-xs">Define el gasto base que se repetirá cada mes.</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="template-name">Nombre</Label>
            <Input
              id="template-name"
              v-model="form.name"
              placeholder="Ej: Netflix, Renta, Internet..."
              :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-destructive text-xs">{{ errors.name }}</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="template-description">Descripción (opcional)</Label>
            <textarea
              id="template-description"
              v-model="form.description"
              maxlength="140"
              rows="3"
              placeholder="Notas breves para identificar este gasto..."
              class="bg-transparent shadow-xs px-3 py-2 border border-input aria-invalid:border-destructive focus-visible:border-ring rounded-md outline-none aria-invalid:ring-destructive/20 focus-visible:ring-3 focus-visible:ring-ring/50 w-full min-h-20 placeholder:text-muted-foreground text-sm transition-[color,box-shadow]"
              :class="{ 'border-destructive': errors.description }"
            />
            <div class="flex justify-between">
              <p v-if="errors.description" class="text-destructive text-xs">{{ errors.description }}</p>
              <p class="ml-auto text-[11px] text-muted-foreground">{{ form.description.length }}/140</p>
            </div>
          </div>
        </div>

        <div class="space-y-4 bg-card p-4 border rounded-xl">
          <div class="space-y-1">
            <p class="font-semibold text-sm">Configuración mensual</p>
            <p class="text-muted-foreground text-xs">Ajusta el monto, la categoría y el vencimiento.</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="template-amount">Monto</Label>
            <div class="relative">
              <span
                class="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none"
              >
                $
              </span>
              <Input
                id="template-amount"
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
            <Label for="template-category">Categoría</Label>
            <Select v-model="form.category">
              <SelectTrigger
                id="template-category"
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
            <Label for="template-due-day">Día de pago (opcional)</Label>
            <Select v-model="form.dueDay">
              <SelectTrigger id="template-due-day" :class="{ 'border-destructive': errors.dueDay }">
                <SelectValue placeholder="Sin día fijo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin día fijo</SelectItem>
                <SelectItem v-for="day in dueDayOptions" :key="day" :value="day">
                  Día {{ day }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.dueDay" class="text-destructive text-xs">{{ errors.dueDay }}</p>
          </div>

          <div class="flex justify-between items-center bg-muted/40 px-3 py-2.5 border rounded-lg">
            <div>
              <p class="font-medium text-sm">Plantilla activa</p>
              <p class="text-muted-foreground text-xs">Disponible para generar gastos al iniciar mes</p>
            </div>
            <Switch v-model="form.isActive" />
          </div>
        </div>
      </div>

      <SheetFooter class="pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-row gap-2 shrink-0">
        <SheetClose as-child>
          <Button variant="outline" class="flex-1" @click="emit('close')">Cancelar</Button>
        </SheetClose>
        <Button class="flex-1" @click="handleSave">
          {{ isEditing ? 'Guardar cambios' : 'Crear plantilla' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
