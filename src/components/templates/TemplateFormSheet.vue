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
  amount: '' as string | number,
  category: '',
  isActive: true,
})

const errors = ref({
  name: '',
  amount: '',
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
        amount: t.amount,
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
  form.value = { name: '', amount: '', category: '', isActive: true }
  errors.value = { name: '', amount: '', category: '' }
}

// ─── Validation ────────────────────────────────────────────────────────────
function validate(): boolean {
  errors.value = { name: '', amount: '', category: '' }
  let valid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
    valid = false
  }
  const amt = Number(form.value.amount)
  if (!form.value.amount || isNaN(amt) || amt <= 0) {
    errors.value.amount = 'Ingresa un monto válido mayor a 0'
    valid = false
  }
  if (!form.value.category) {
    errors.value.category = 'Selecciona una categoría'
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
    isActive: form.value.isActive,
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="w-full sm:max-w-md flex flex-col">
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

      <div class="flex-1 py-6 flex flex-col gap-5">
        <!-- Nombre -->
        <div class="flex flex-col gap-1.5">
          <Label for="template-name">Nombre</Label>
          <Input
            id="template-name"
            v-model="form.name"
            placeholder="Ej: Netflix, Renta, Internet..."
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
        </div>

        <!-- Monto -->
        <div class="flex flex-col gap-1.5">
          <Label for="template-amount">Monto</Label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none"
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
          <p v-if="errors.amount" class="text-xs text-destructive">{{ errors.amount }}</p>
        </div>

        <!-- Categoría -->
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
          <p v-if="errors.category" class="text-xs text-destructive">{{ errors.category }}</p>
        </div>

        <!-- Activa -->
        <div class="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
          <div>
            <p class="text-sm font-medium">Plantilla activa</p>
            <p class="text-xs text-muted-foreground">Se generará automáticamente cada mes</p>
          </div>
          <Switch v-model="form.isActive" />
        </div>
      </div>

      <SheetFooter class="flex flex-row gap-2">
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
