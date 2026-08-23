<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { VisSingleContainer, VisDonut, VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'
import { formatCurrency } from '@/services/expenseService'
import { FileText, Percent } from 'lucide-vue-next'

const props = defineProps<{
  paidAmount: number
  pendingAmount: number
  fixedPendingAmount: number
  variablePendingAmount: number
  pendingCount: number
}>()

const total = computed(() => props.paidAmount + props.pendingAmount)

const donutConfig: ChartConfig = {
  paid: {
    label: 'Pagado',
    color: 'var(--color-emerald-700, #047857)',
  },
  pending: {
    label: 'Pendiente',
    color: 'var(--color-rose-500, #f43f5e)',
  },
}

const flowConfig: ChartConfig = {
  flow: {
    label: 'Flujo',
    color: 'var(--color-emerald-700, #047857)',
  },
}

const donutData = computed(() => {
  if (total.value <= 0) {
    return [
      { key: 'paid', amount: 1, color: 'var(--color-emerald-700, #047857)' },
      { key: 'pending', amount: 0, color: 'var(--color-rose-500, #f43f5e)' },
    ]
  }
  return [
    { key: 'paid', amount: props.paidAmount, color: 'var(--color-emerald-700, #047857)' },
    { key: 'pending', amount: props.pendingAmount, color: 'var(--color-rose-500, #f43f5e)' },
  ]
})

// Smooth monotonic curve for projected cash flow over the period cycle
const flowData = computed(() => {
  const start = total.value > 0 ? total.value : 100000
  return [
    { x: 0, y: start },
    { x: 1, y: Math.round(start * 0.86) },
    { x: 2, y: Math.round(start * 0.65) },
    { x: 3, y: Math.round(start * 0.40) },
    { x: 4, y: Math.round(start * 0.18) },
    { x: 5, y: Math.round(start * 0.02) },
  ]
})

function formatAxisCurrency(value: number): string {
  if (!value || value <= 0) return '0'
  if (value >= 1_000_000) {
    const valM = value / 1_000_000
    return `$${Number.isInteger(valM) ? valM : valM.toFixed(1)}M`
  }
  if (value >= 1_000) {
    const valK = value / 1_000
    return `$${Number.isInteger(valK) ? valK : valK.toFixed(1)}K`
  }
  return `$${value}`
}
</script>

<template>
  <Card class="bg-card border border-border shadow-card rounded-2xl md:rounded-3xl overflow-hidden h-full flex flex-col justify-between">
    <CardContent class="p-5 md:p-6 flex flex-col justify-between h-full space-y-4">
      <p class="font-bold text-foreground text-sm">
        Estado General de Pagos
      </p>

      <!-- Upper section: Donut Chart & Detalle de Pendientes -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <!-- Donut Chart with shadcn-vue / unovis -->
        <div class="sm:col-span-6 flex flex-col items-center justify-center">
          <ChartContainer :config="donutConfig" class="size-24">
            <VisSingleContainer :data="donutData" class="size-full">
              <VisDonut
                :value="(d: any) => d.amount"
                :color="(d: any) => d.color"
                :arc-width="14"
              />
            </VisSingleContainer>
          </ChartContainer>

          <!-- Legend matching mock squares -->
          <div class="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 mt-2 text-[10px] text-muted-foreground">
            <span class="inline-flex items-center gap-1">
              <span class="size-2 bg-emerald-700 dark:bg-emerald-600 rounded-xs" />
              {{ formatCurrency(paidAmount) }} Pagado
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="size-2 bg-rose-500 rounded-xs" />
              {{ formatCurrency(pendingAmount) }} Pendiente
            </span>
          </div>
        </div>

        <!-- Detalle de Pendientes -->
        <div class="sm:col-span-6 space-y-1.5 border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-3">
          <p class="font-bold text-foreground text-xs">
            Detalle de Pendientes
          </p>

          <div class="space-y-1 text-xs">
            <div class="flex items-center justify-between gap-1 text-muted-foreground">
              <span class="inline-flex items-center gap-1 text-[11px]">
                <FileText class="size-3 text-muted-foreground" />
                Gastos Fijos
              </span>
              <span class="font-medium text-foreground tabular-nums text-[11px]">
                {{ formatCurrency(fixedPendingAmount) }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-1 text-muted-foreground">
              <span class="inline-flex items-center gap-1 text-[11px]">
                <Percent class="size-3 text-muted-foreground" />
                Gastos Variables
              </span>
              <span class="font-medium text-foreground tabular-nums text-[11px]">
                {{ formatCurrency(variablePendingAmount) }}
              </span>
            </div>
          </div>

          <p class="text-[11px] text-muted-foreground pt-0.5">
            {{ pendingCount }} {{ pendingCount === 1 ? 'gasto restante' : 'gastos restantes' }}
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-border/40 pt-3 space-y-2">
        <p class="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
          FLUJO DE EFECTIVO PROYECTADO
        </p>

        <!-- Area Chart expanded horizontally to maximize chart area -->
        <ChartContainer :config="flowConfig" class="h-24 w-full">
          <VisXYContainer
            :data="flowData"
            :margin="{ top: 4, bottom: 4, left: 26, right: 0 }"
            class="h-full w-full"
          >
            <VisArea
              :x="(d: any) => d.x"
              :y="(d: any) => d.y"
              color="var(--color-emerald-700, #047857)"
              :opacity="0.2"
            />
            <VisLine
              :x="(d: any) => d.x"
              :y="(d: any) => d.y"
              color="var(--color-emerald-700, #047857)"
              :line-width="2.25"
            />
            <VisAxis
              type="y"
              :tick-format="formatAxisCurrency"
              :grid-line="true"
              :tick-line="false"
              :domain-line="false"
              :num-ticks="4"
            />
          </VisXYContainer>
        </ChartContainer>
      </div>
    </CardContent>
  </Card>
</template>
