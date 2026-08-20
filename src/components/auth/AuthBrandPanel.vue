<script setup lang="ts">
import { Repeat } from '@lucide/vue'

withDefaults(
  defineProps<{
    tagline?: string
    compact?: boolean
  }>(),
  {
    tagline: 'Controla tus gastos recurrentes sin perder el ritmo del mes.',
    compact: false,
  },
)
</script>

<template>
  <div
    v-if="compact"
    class="flex items-center gap-2.5"
  >
    <div class="flex justify-center items-center bg-brand rounded-xl size-9">
      <Repeat class="size-4 text-brand-foreground" />
    </div>
    <div>
      <p class="font-semibold text-foreground text-lg leading-none tracking-tight">CyclePay</p>
      <p class="mt-1 text-muted-foreground text-xs">{{ tagline }}</p>
    </div>
  </div>

  <div
    v-else
    class="hidden lg:flex relative flex-col justify-between bg-primary p-10 xl:p-14 min-h-screen overflow-hidden text-primary-foreground"
  >
    <div class="top-[-20%] left-[-10%] absolute bg-brand/40 blur-3xl rounded-full size-72 pointer-events-none" />
    <div class="right-[-15%] bottom-[-10%] absolute bg-brand/25 blur-3xl rounded-full size-80 pointer-events-none" />

    <div class="z-10 relative flex items-center gap-2.5">
      <div class="flex justify-center items-center bg-brand rounded-xl size-10">
        <Repeat class="size-5 text-brand-foreground" />
      </div>
      <p class="font-semibold text-xl tracking-tight">CyclePay</p>
    </div>

    <div class="z-10 relative space-y-4 max-w-md">
      <p class="font-medium text-brand-soft text-xs uppercase tracking-[0.2em]">Finanzas personales</p>
      <h1 class="font-bold text-4xl leading-tight tracking-tight">
        Tus pagos del mes, en un solo vistazo.
      </h1>
      <p class="text-primary-foreground/70 text-sm leading-relaxed">
        {{ tagline }}
      </p>
    </div>

    <p class="z-10 relative text-primary-foreground/50 text-xs">CyclePay v0.1.0</p>
  </div>
</template>
