<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ExpenseTemplate } from '@/types/expense'
import ExpenseBaseFieldsSection from '@/components/expenses/ExpenseBaseFieldsSection.vue'
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
        <ExpenseBaseFieldsSection
          id-prefix="template"
          v-model:name="form.name"
          v-model:description="form.description"
          v-model:amount="form.amount"
          v-model:category="form.category"
          v-model:dueDay="form.dueDay"
          :errors="errors"
        >
          <template #config-extra>
            <div class="flex justify-between items-center bg-muted/40 px-3 py-2.5 border rounded-lg">
              <div>
                <p class="font-medium text-sm">Plantilla activa</p>
                <p class="text-muted-foreground text-xs">Disponible para generar gastos al iniciar mes</p>
              </div>
              <Switch v-model="form.isActive" />
            </div>
          </template>
        </ExpenseBaseFieldsSection>
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
