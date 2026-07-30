<script setup lang="ts">
import SidebarNav from './SidebarNav.vue'
import BottomNav from './BottomNav.vue'
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    pending: 'Gastos Pendientes',
    history: 'Historial',
    templates: 'Plantillas',
  }
  return titles[route.name as string] ?? 'CyclePay'
})
</script>

<template>
  <div class="flex h-screen bg-background">
    <!-- Sidebar — visible en md+ -->
    <aside class="hidden md:flex md:flex-col md:w-64 border-r border-border shrink-0">
      <SidebarNav />
    </aside>

    <!-- Main content area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Mobile header -->
      <header
        class="flex md:hidden items-center h-14 px-4 border-b border-border bg-background shrink-0"
      >
        <h1 class="text-lg font-semibold text-foreground">{{ pageTitle }}</h1>
      </header>

      <!-- Desktop page header -->
      <header
        class="hidden md:flex items-center h-14 px-6 border-b border-border bg-background shrink-0"
      >
        <h1 class="text-lg font-semibold text-foreground">{{ pageTitle }}</h1>
      </header>

      <!-- Scrollable view area -->
      <main class="flex-1 overflow-y-auto pb-20 md:pb-0">
        <RouterView />
      </main>
    </div>

    <!-- BottomNav — solo en mobile -->
    <BottomNav class="md:hidden" />
  </div>
</template>
