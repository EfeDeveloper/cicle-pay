<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        'border-emerald-200 bg-emerald-50/50': variant === 'paid',
        'border-amber-200 bg-amber-50/50': variant === 'pending',
        'border-border': !variant || variant === 'default' || variant === 'neutral',
      })
    "
  >
    <CardHeader class="pb-2">
      <div class="flex items-center justify-between">
        <CardTitle class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {{ title }}
        </CardTitle>
        <div
          v-if="icon"
          class="flex items-center justify-center w-8 h-8 rounded-full"
          :class="
            cn({
              'bg-emerald-100': variant === 'paid',
              'bg-amber-100': variant === 'pending',
              'bg-muted': !variant || variant === 'default' || variant === 'neutral',
            })
          "
        >
          <component
            :is="icon"
            class="w-4 h-4"
            :class="
              cn({
                'text-emerald-600': variant === 'paid',
                'text-amber-600': variant === 'pending',
                'text-muted-foreground': !variant || variant === 'default' || variant === 'neutral',
              })
            "
          />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p
        class="text-2xl font-bold tabular-nums"
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
      <p v-if="subtitle" class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
    </CardContent>
  </Card>
</template>
