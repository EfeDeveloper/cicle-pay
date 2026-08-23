<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, PiggyBank } from '@lucide/vue'

withDefaults(
  defineProps<{
    targetAmount?: number
    targetPercent?: number
  }>(),
  {
    targetAmount: 150000,
    targetPercent: 15,
  },
)

const emit = defineEmits<{
  setGoal: []
}>()

function handleSetGoal() {
  emit('setGoal')
}
</script>

<template>
  <Card class="bg-card border border-border shadow-card rounded-2xl md:rounded-3xl overflow-hidden flex flex-col justify-between">
    <CardContent class="p-5 md:p-6 flex flex-col justify-between h-full space-y-3">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <p class="font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
          METAS DE AHORRO
        </p>
        <div class="flex items-center justify-center size-10 rounded-full bg-brand-soft text-brand shrink-0">
          <Wallet class="size-5" />
        </div>
      </div>

      <!-- Piggy Bank Icon in orange brand color -->
      <div class="flex flex-col items-center justify-center py-2">
        <PiggyBank class="size-14 md:size-16 text-brand stroke-[1.5]" />
      </div>

      <!-- Projection and CTA -->
      <div class="space-y-3 text-center">
        <div>
          <h4 class="font-bold text-foreground text-base md:text-lg tabular-nums tracking-tight">
            ${{ targetAmount.toLocaleString('es-CO') }}.00 <span class="text-xs font-normal text-muted-foreground">(Proyectado)</span>
          </h4>
          <p class="text-xs text-muted-foreground mt-0.5">
            Alcanzar {{ targetPercent }}% del ingreso
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="w-full rounded-full text-xs h-8 cursor-pointer font-medium bg-card hover:bg-accent border-border text-foreground shadow-xs"
          @click="handleSetGoal"
        >
          Establecer Meta
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
