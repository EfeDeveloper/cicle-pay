<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/services/expenseService'

defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon?: Component
  variant?: 'default' | 'paid' | 'pending' | 'neutral'
  isCurrency?: boolean
}>()
</script>

<template>
  <Card
    class="relative overflow-hidden"
    :class="
      cn({
        'border-emerald-200/80 bg-emerald-50/40': variant === 'paid',
        'border-amber-200/80 bg-amber-50/40': variant === 'pending',
        'border-border/70': !variant || variant === 'default' || variant === 'neutral',
      })
    "
  >
    <CardContent class="flex flex-col gap-4 pt-1">
      <div class="flex justify-between items-start gap-3">
        <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {{ title }}
        </p>
        <div
          v-if="icon"
          class="flex justify-center items-center rounded-full size-10 shrink-0"
          :class="
            cn({
              'bg-emerald-100': variant === 'paid',
              'bg-amber-100': variant === 'pending',
              'bg-brand-soft': !variant || variant === 'default' || variant === 'neutral',
            })
          "
        >
          <component
            :is="icon"
            class="size-4"
            :class="
              cn({
                'text-emerald-600': variant === 'paid',
                'text-amber-600': variant === 'pending',
                'text-brand': !variant || variant === 'default' || variant === 'neutral',
              })
            "
          />
        </div>
      </div>

      <p
        class="font-bold tabular-nums text-3xl leading-none tracking-tight"
        :class="
          cn({
            'text-emerald-700': variant === 'paid',
            'text-amber-700': variant === 'pending',
            'text-foreground': !variant || variant === 'default' || variant === 'neutral',
          })
        "
      >
        {{ isCurrency ? formatCurrency(Number(value)) : value }}
      </p>

      <p
        v-if="subtitle"
        class="self-start bg-background/80 px-2.5 py-1 border border-border/70 rounded-full text-muted-foreground text-xs"
      >
        {{ subtitle }}
      </p>
    </CardContent>
  </Card>
</template>
