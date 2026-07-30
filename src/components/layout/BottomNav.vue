<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { LayoutDashboard, Clock, History, LayoutTemplate } from '@lucide/vue'

const route = useRoute()

const navItems = [
  { to: '/', name: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { to: '/pending', name: 'pending', label: 'Gastos', icon: Clock },
  { to: '/history', name: 'history', label: 'Historial', icon: History },
  { to: '/templates', name: 'templates', label: 'Plantillas', icon: LayoutTemplate },
]

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-background border-t border-border px-2 safe-area-bottom"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-md transition-colors text-muted-foreground"
      :class="{
        'text-primary': isActive(item.name),
      }"
    >
      <component :is="item.icon" class="w-5 h-5" />
      <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
