<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { CalendarDays } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getCurrentPeriodKey } from '@/services/expenseService'
import type { DueDayFilter, DueDayMark, DayMarkKind } from '@/lib/dueDayCalendar'

const props = withDefaults(
  defineProps<{
    marks: DueDayMark[]
    mode: 'status' | 'presence'
    hasUndated: boolean
    periodKey?: string
    allowPeriodChange?: boolean
    disabled?: boolean
  }>(),
  {
    allowPeriodChange: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:periodKey': [value: string]
}>()

const modelValue = defineModel<DueDayFilter>({ required: true })
const open = ref(false)

const markByDay = computed(() => {
  const map = new Map<number, DueDayMark>()
  for (const mark of props.marks) map.set(mark.dueDay, mark)
  return map
})

function toPeriodKey(date: { year: number; month: number }): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}`
}

function fromPeriodKey(periodKey: string): CalendarDate {
  const [year, month] = periodKey.split('-').map(Number)
  return new CalendarDate(year, month, 1)
}

const placeholder = ref(
  props.periodKey ? fromPeriodKey(props.periodKey) : today(getLocalTimeZone()),
)

const placeholderBind = computed({
  get: () => placeholder.value as never,
  set: (value: { year: number; month: number; day: number }) => {
    placeholder.value = new CalendarDate(value.year, value.month, value.day)
  },
})

watch(
  () => props.periodKey,
  (key) => {
    if (!key) return
    const next = fromPeriodKey(key)
    if (placeholder.value.year !== next.year || placeholder.value.month !== next.month) {
      placeholder.value = next
    }
  },
)

watch(placeholder, (date) => {
  if (!props.allowPeriodChange) return
  const key = toPeriodKey(date)
  if (key > getCurrentPeriodKey()) {
    placeholder.value = fromPeriodKey(getCurrentPeriodKey())
    return
  }
  if (key !== props.periodKey) emit('update:periodKey', key)
})

const maxValue = computed(() => {
  if (!props.allowPeriodChange) return undefined
  const now = today(getLocalTimeZone())
  const lastDay = now.calendar.getDaysInMonth(now)
  return now.set({ day: lastDay }) as never
})

const triggerLabel = computed(() => {
  if (modelValue.value === 'none') return 'Sin día de pago'
  if (typeof modelValue.value === 'number') return `Día ${modelValue.value}`
  return 'Filtrar por día de pago'
})

function isDateDisabled(date: { year: number; month: number; day: number }) {
  if (date.year !== placeholder.value.year || date.month !== placeholder.value.month) {
    return true
  }
  if (props.allowPeriodChange && toPeriodKey(date) > getCurrentPeriodKey()) {
    return true
  }
  return !markByDay.value.has(date.day)
}

function markFor(date: { year: number; month: number; day: number }) {
  if (date.year !== placeholder.value.year || date.month !== placeholder.value.month) {
    return undefined
  }
  return markByDay.value.get(date.day)
}

function onSelect(value: { day: number } | undefined) {
  if (!value) {
    modelValue.value = null
    return
  }
  if (!markByDay.value.has(value.day)) return
  modelValue.value = modelValue.value === value.day ? null : value.day
  open.value = false
}

function selectAll() {
  modelValue.value = null
  open.value = false
}

function toggleNone() {
  modelValue.value = modelValue.value === 'none' ? null : 'none'
  open.value = false
}

function kindDots(kind: DayMarkKind): Array<'pending' | 'paid' | 'present'> {
  if (kind === 'mixed') return ['pending', 'paid']
  return [kind]
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        class="min-h-11 w-auto shrink-0 justify-start font-normal"
        :disabled="disabled"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :aria-label="triggerLabel"
      >
        <CalendarDays class="size-4" />
        {{ triggerLabel }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        locale="es-MX"
        layout="month-and-year"
        v-model:placeholder="placeholderBind"
        :is-date-disabled="isDateDisabled"
        :max-value="maxValue"
        @update:model-value="onSelect"
      >
        <template #day-addon="{ date }">
          <span
            v-if="markFor(date)"
            class="absolute inset-x-0 bottom-0.5 flex justify-center gap-0.5 pointer-events-none"
            aria-hidden="true"
          >
            <span
              v-for="dot in kindDots(markFor(date)!.kind)"
              :key="dot"
              class="size-1.5 rounded-full"
              :class="{
                'bg-amber-500': dot === 'pending',
                'bg-emerald-500': dot === 'paid',
                'bg-brand': dot === 'present',
              }"
            />
          </span>
        </template>
      </Calendar>
      <div class="flex flex-wrap gap-2 border-t border-border/70 px-3 py-2">
        <Button type="button" size="sm" variant="outline" class="min-h-11" @click="selectAll">
          Todos
        </Button>
        <Button
          v-if="hasUndated"
          type="button"
          size="sm"
          :variant="modelValue === 'none' ? 'secondary' : 'outline'"
          class="min-h-11"
          @click="toggleNone"
        >
          Sin día
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
