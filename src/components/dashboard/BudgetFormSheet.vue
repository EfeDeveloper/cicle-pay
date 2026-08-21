<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCategoryIcon } from '@/lib/categoryVisuals'
import { formatCurrency } from '@/services/expenseService'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/expense'
import type { CategoryCaps, SaveBudgetInput } from '@/types/budget'

const props = withDefaults(
  defineProps<{
    open: boolean
    periodLabel: string
    hasExistingBudget: boolean
    initialTotal: number | null
    initialCategories: CategoryCaps | null
    prefilledFromPrevious: boolean
    saving?: boolean
  }>(),
  { saving: false },
)

const emit = defineEmits<{
  close: []
  saved: [payload: SaveBudgetInput]
  requestDelete: []
}>()

type CapFields = Record<ExpenseCategory, string>

function emptyCaps(): CapFields {
  return Object.fromEntries(EXPENSE_CATEGORIES.map((category) => [category, ''])) as CapFields
}

function amountText(value: unknown): string {
  if (value == null || value === '') return ''
  return String(value).trim()
}

const total = ref('')
const caps = ref<CapFields>(emptyCaps())
const totalError = ref('')
const capErrors = ref<Partial<Record<ExpenseCategory, string>>>({})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    total.value = props.initialTotal == null ? '' : String(props.initialTotal)
    const next = emptyCaps()
    if (props.initialCategories) {
      for (const category of EXPENSE_CATEGORIES) {
        const value = props.initialCategories[category]
        if (typeof value === 'number') {
          next[category] = String(value)
        }
      }
    }
    caps.value = next
    totalError.value = ''
    capErrors.value = {}
  },
)

const parsedCaps = computed(() => {
  const categories: CategoryCaps = {}
  const errors: Partial<Record<ExpenseCategory, string>> = {}

  for (const category of EXPENSE_CATEGORIES) {
    const raw = amountText(caps.value[category])
    if (!raw) continue
    const amount = Number(raw)
    if (!Number.isFinite(amount) || amount <= 0) {
      errors[category] = 'El cupo debe ser mayor a 0 o déjalo vacío'
      continue
    }
    categories[category] = amount
  }

  return { categories, errors }
})

const capSum = computed(() =>
  Object.values(parsedCaps.value.categories).reduce((sum, amount) => sum + amount, 0),
)

const parsedTotal = computed(() => Number(amountText(total.value)))
const isTotalValid = computed(() => {
  const raw = amountText(total.value)
  if (!raw) return false
  const amount = Number(raw)
  return Number.isFinite(amount) && amount > 0
})

const capsExceedTotal = computed(
  () =>
    isTotalValid.value &&
    Object.keys(parsedCaps.value.categories).length > 0 &&
    capSum.value > parsedTotal.value,
)

const canSubmit = computed(
  () => isTotalValid.value && Object.keys(parsedCaps.value.errors).length === 0,
)

function handleSave() {
  totalError.value = isTotalValid.value ? '' : 'Ingresa un tope mayor a 0'
  capErrors.value = parsedCaps.value.errors
  if (!canSubmit.value) return

  const categories = parsedCaps.value.categories
  emit('saved', {
    totalAmount: parsedTotal.value,
    ...(Object.keys(categories).length > 0 ? { categories } : {}),
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="flex flex-col w-full sm:max-w-md h-full min-h-0 overflow-hidden">
      <SheetHeader>
        <SheetTitle>{{ hasExistingBudget ? 'Editar presupuesto' : 'Definir presupuesto' }}</SheetTitle>
        <SheetDescription>
          {{
            hasExistingBudget
              ? `Actualiza el tope o los cupos de ${periodLabel}.`
              : `Fija un tope para ${periodLabel}. Los cupos por categoría son opcionales.`
          }}
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 px-2 sm:px-3 py-6 min-h-0 overflow-y-auto overscroll-contain">
        <div
          v-if="prefilledFromPrevious"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-center text-slate-700 text-xs"
        >
          Tomamos los valores del mes anterior. Se guardarán en este período.
        </div>

        <div class="space-y-4 bg-card shadow-card p-5 border border-border/70 rounded-2xl">
          <div class="space-y-1">
            <p class="font-semibold text-sm">Tope del mes</p>
            <p class="text-muted-foreground text-xs">
              Monto máximo que planeas gastar en el período.
            </p>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="budget-total">Tope</Label>
            <div class="relative">
              <span
                class="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none"
              >
                $
              </span>
              <Input
                id="budget-total"
                v-model="total"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                class="pl-6"
                :class="{ 'border-destructive': totalError }"
              />
            </div>
            <p v-if="totalError" class="text-destructive text-xs">{{ totalError }}</p>
          </div>
        </div>

        <div class="space-y-4 bg-card shadow-card p-5 border border-border/70 rounded-2xl">
          <div class="space-y-1">
            <p class="font-semibold text-sm">Cupos por categoría</p>
            <p class="text-muted-foreground text-xs">
              Opcional. Vacío significa que no vigilarás esa categoría.
            </p>
          </div>

          <div
            v-for="category in EXPENSE_CATEGORIES"
            :key="category"
            class="flex flex-col gap-1.5"
          >
            <Label :for="`budget-cap-${category}`" class="flex items-center gap-2">
              <component :is="getCategoryIcon(category)" class="size-3.5 text-brand shrink-0" />
              {{ category }}
            </Label>
            <div class="relative">
              <span
                class="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none"
              >
                $
              </span>
              <Input
                :id="`budget-cap-${category}`"
                v-model="caps[category]"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                class="pl-6"
                :class="{ 'border-destructive': capErrors[category] }"
              />
            </div>
            <p v-if="capErrors[category]" class="text-destructive text-xs">
              {{ capErrors[category] }}
            </p>
          </div>
        </div>

        <div
          v-if="capsExceedTotal"
          class="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-center text-amber-700 text-xs"
        >
          La suma de cupos ({{ formatCurrency(capSum) }}) supera el tope. Puedes guardar igual: el
          tope del mes manda.
        </div>
      </div>

      <SheetFooter class="pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2 shrink-0">
        <Button
          v-if="hasExistingBudget"
          type="button"
          variant="ghost"
          class="text-destructive hover:text-destructive"
          :disabled="saving"
          @click="emit('requestDelete')"
        >
          Quitar presupuesto
        </Button>
        <div class="flex flex-row gap-2">
          <SheetClose as-child>
            <Button type="button" variant="outline" class="flex-1" :disabled="saving">
              Cancelar
            </Button>
          </SheetClose>
          <Button type="button" class="flex-1" :disabled="saving" @click="handleSave">
            Guardar presupuesto
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
