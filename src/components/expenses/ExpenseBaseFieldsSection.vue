<script setup lang="ts">
import { EXPENSE_CATEGORIES } from '@/types/expense'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const name = defineModel<string>('name', { required: true })
const description = defineModel<string>('description', { required: true })
const amount = defineModel<string | number>('amount', { required: true })
const category = defineModel<string>('category', { required: true })
const dueDay = defineModel<string>('dueDay', { required: true })

const props = withDefaults(
  defineProps<{
    idPrefix: string
    namePlaceholder?: string
    descriptionPlaceholder?: string
    errors: {
      name: string
      description: string
      amount: string
      dueDay: string
      category: string
    }
  }>(),
  {
    namePlaceholder: 'Ej: Netflix, Renta, Internet...',
    descriptionPlaceholder: 'Notas breves para identificar este gasto...',
  },
)

const dueDayOptions = Array.from({ length: 31 }, (_, i) => String(i + 1))
</script>

<template>
  <div class="space-y-4 bg-card p-4 border rounded-xl">
    <div class="space-y-1">
      <p class="font-semibold text-sm">Datos principales</p>
      <p class="text-muted-foreground text-xs">Define el gasto base que se repetirá cada mes.</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label :for="`${props.idPrefix}-name`">Nombre</Label>
      <Input
        :id="`${props.idPrefix}-name`"
        v-model="name"
        :placeholder="props.namePlaceholder"
        :class="{ 'border-destructive': props.errors.name }"
      />
      <p v-if="props.errors.name" class="text-destructive text-xs">{{ props.errors.name }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label :for="`${props.idPrefix}-description`">Descripción (opcional)</Label>
      <textarea
        :id="`${props.idPrefix}-description`"
        v-model="description"
        maxlength="140"
        rows="3"
        :placeholder="props.descriptionPlaceholder"
        class="bg-transparent shadow-xs px-3 py-2 border border-input aria-invalid:border-destructive focus-visible:border-ring rounded-md outline-none aria-invalid:ring-destructive/20 focus-visible:ring-3 focus-visible:ring-ring/50 w-full min-h-20 placeholder:text-muted-foreground text-sm transition-[color,box-shadow]"
        :class="{ 'border-destructive': props.errors.description }"
      />
      <div class="flex justify-between">
        <p v-if="props.errors.description" class="text-destructive text-xs">{{ props.errors.description }}</p>
        <p class="ml-auto text-[11px] text-muted-foreground">{{ description.length }}/140</p>
      </div>
    </div>
  </div>

  <div class="space-y-4 bg-card p-4 border rounded-xl">
    <div class="space-y-1">
      <p class="font-semibold text-sm">Configuración mensual</p>
      <p class="text-muted-foreground text-xs">Ajusta el monto, la categoría y el vencimiento.</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label :for="`${props.idPrefix}-amount`">Monto</Label>
      <div class="relative">
        <span
          class="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none"
        >
          $
        </span>
        <Input
          :id="`${props.idPrefix}-amount`"
          v-model="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          class="pl-6"
          :class="{ 'border-destructive': props.errors.amount }"
        />
      </div>
      <p v-if="props.errors.amount" class="text-destructive text-xs">{{ props.errors.amount }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label :for="`${props.idPrefix}-category`">Categoría</Label>
      <Select v-model="category">
        <SelectTrigger
          :id="`${props.idPrefix}-category`"
          :class="{ 'border-destructive': props.errors.category }"
        >
          <SelectValue placeholder="Selecciona una categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
            {{ cat }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p v-if="props.errors.category" class="text-destructive text-xs">{{ props.errors.category }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label :for="`${props.idPrefix}-due-day`">Día de pago (opcional)</Label>
      <Select v-model="dueDay">
        <SelectTrigger
          :id="`${props.idPrefix}-due-day`"
          :class="{ 'border-destructive': props.errors.dueDay }"
        >
          <SelectValue placeholder="Sin día fijo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sin día fijo</SelectItem>
          <SelectItem v-for="day in dueDayOptions" :key="day" :value="day">
            Día {{ day }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p v-if="props.errors.dueDay" class="text-destructive text-xs">{{ props.errors.dueDay }}</p>
    </div>

    <slot name="config-extra" />
  </div>
</template>