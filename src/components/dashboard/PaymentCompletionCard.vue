<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { VisXYContainer, VisStackedBar, VisAxis } from '@unovis/vue'
import { formatCurrency, type PeriodHistoryPoint } from '@/services/expenseService'

const props = withDefaults(
  defineProps<{
    paidAmount: number
    paidCount: number
    totalCount: number
    completionRate: number
    history?: PeriodHistoryPoint[]
  }>(),
  {
    history: () => [],
  },
)

const chartConfig: ChartConfig = {
  completion: {
    label: 'Pagado',
    color: 'var(--color-emerald-600, #059669)',
  },
}

const displayRate = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round(props.completionRate)
})

const chartData = computed(() => {
  if (!props.history || props.history.length === 0) return []
  return props.history.map((item, index) => ({
    index,
    label: item.label,
    value: Math.max(item.heightPercent > 0 ? item.heightPercent : 2, 2),
    paidAmount: item.paidAmount,
    totalAmount: item.totalAmount,
    heightPercent: item.heightPercent,
  }))
})
</script>

<template>
  <Card class="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 shadow-card rounded-2xl md:rounded-3xl overflow-hidden flex flex-col justify-between">
    <CardContent class="p-5 md:p-6 flex flex-col justify-between h-full space-y-4">
      <div>
        <p class="font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
          PAGOS COMPLETADOS
        </p>

        <!-- shadcn-vue / unovis Bar Chart -->
        <div class="mt-2 w-full h-28 border-b border-emerald-100 dark:border-emerald-900/40 pb-1">
          <ChartContainer
            v-if="chartData.length > 0"
            :config="chartConfig"
            class="h-full w-full"
          >
            <VisXYContainer
              :data="chartData"
              :margin="{ top: 5, bottom: 20, left: 15, right: 5 }"
              class="h-full w-full"
            >
              <VisStackedBar
                :x="(d: any) => d.index"
                :y="(d: any) => d.value"
                color="var(--color-emerald-700, #047857)"
                :rounded-corners="3"
                :bar-padding="0.25"
              />
              <VisAxis
                type="x"
                :tick-format="(i: number) => chartData[i]?.label ?? ''"
                :grid-line="false"
                :tick-line="false"
                :domain-line="false"
              />
              <VisAxis
                type="y"
                :tick-format="() => '0'"
                :num-ticks="1"
                :grid-line="false"
                :tick-line="false"
                :domain-line="false"
              />
            </VisXYContainer>
          </ChartContainer>

          <div v-else class="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Sin historial registrado
          </div>
        </div>
      </div>

      <!-- Bottom values -->
      <div class="flex items-end justify-between pt-1">
        <div>
          <h4 class="font-bold text-foreground text-xl md:text-2xl tabular-nums tracking-tight">
            {{ formatCurrency(paidAmount) }}
          </h4>
          <p class="text-xs text-muted-foreground mt-0.5">
            Pagado
          </p>
        </div>

        <!-- Dynamic Circular Progress Gauge -->
        <div class="relative flex items-center justify-center size-10 shrink-0 bg-card rounded-full shadow-2xs">
          <svg class="size-10 -rotate-90" viewBox="0 0 36 36">
            <!-- Background track -->
            <path
              class="text-neutral-200 dark:text-neutral-800"
              stroke="currentColor"
              stroke-width="2.75"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <!-- Progress active ring -->
            <path
              class="text-emerald-700 dark:text-emerald-500 transition-all duration-500 ease-out"
              stroke="currentColor"
              stroke-width="2.75"
              stroke-linecap="round"
              fill="none"
              :stroke-dasharray="`${displayRate}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span class="absolute font-bold text-[10.5px] text-foreground tabular-nums">
            {{ displayRate }}%
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
