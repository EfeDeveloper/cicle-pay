<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Repeat, LayoutDashboard, Clock, History, LayoutTemplate } from '@lucide/vue'

const route = useRoute()

const navItems = [
  { to: '/', name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pending', name: 'pending', label: 'Gastos', icon: Clock },
  { to: '/history', name: 'history', label: 'Historial', icon: History },
  { to: '/templates', name: 'templates', label: 'Plantillas', icon: LayoutTemplate },
]

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <div class="flex flex-col h-full bg-sidebar">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 h-14 px-4 border-b border-sidebar-border shrink-0">
      <div class="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
        <Repeat class="w-4 h-4 text-primary-foreground" />
      </div>
      <span class="text-base font-semibold text-sidebar-foreground">CyclePay</span>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        :class="{
          'bg-sidebar-accent text-sidebar-accent-foreground': isActive(item.name),
        }"
      >
        <component :is="item.icon" class="w-4 h-4 shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-sidebar-border">
      <p class="text-xs text-muted-foreground">CyclePay v0.1.0</p>
    </div>
  </div>
</template>
