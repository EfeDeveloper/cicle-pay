<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/services/expenseService'

const props = defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon?: Component
  variant?: 'default' | 'paid' | 'pending' | 'neutral'
  isCurrency?: boolean
  compact?: boolean
}>()
</script>

<template>
  <Card
    class="relative min-w-0"
    :class="
      cn({
        'overflow-hidden': !props.compact,
        'border-emerald-200/80 bg-emerald-50/40': variant === 'paid',
        'border-amber-200/80 bg-amber-50/40': variant === 'pending',
        'border-border/70': !variant || variant === 'default' || variant === 'neutral',
      })
    "
  >
    <CardContent
      :class="
        cn(
          'flex min-w-0 flex-col pt-1',
          props.compact ? 'gap-2 px-3 md:gap-3 md:px-4' : 'gap-4',
        )
      "
    >
      <div class="flex items-center justify-between gap-2 min-w-0">
        <p
          class="min-w-0 font-medium text-muted-foreground uppercase tracking-wide truncate"
          :class="props.compact ? 'text-[10px] md:text-xs' : 'text-xs'"
        >
          {{ title }}
        </p>
        <div
          v-if="icon"
          class="justify-center items-center rounded-full shrink-0"
          :class="
            cn({
              'hidden lg:flex size-10': props.compact,
              'flex size-10': !props.compact,
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
        class="min-w-0 font-bold tabular-nums tracking-tight wrap-break-word"
        :class="
          cn({
            'text-base md:text-xl lg:text-2xl leading-tight': props.compact,
            'text-2xl md:text-3xl leading-none': !props.compact,
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
        :class="{ 'hidden md:inline-flex': props.compact }"
      >
        {{ subtitle }}
      </p>
    </CardContent>
  </Card>
</template>
