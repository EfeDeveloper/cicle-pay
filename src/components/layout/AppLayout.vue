<script setup lang="ts">
import SidebarNav from './SidebarNav.vue'
import BottomNav from './BottomNav.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { LogOut } from '@lucide/vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userLabel = computed(() => {
  const email = authStore.user?.email?.trim()
  if (!email) {
    return 'Usuario autenticado'
  }

  const maxLength = 28
  if (email.length <= maxLength) {
    return email
  }

  return `${email.slice(0, maxLength - 1)}…`
})

const isLoggingOut = computed(() => authStore.isLoading)

async function handleLogout() {
  try {
    await authStore.logout()
    await router.push('/auth/login')
  } catch {
    // authStore.error already contains a localized message.
  }
}

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
  <div class="flex bg-background h-screen">
    <!-- Sidebar — visible en md+ -->
    <aside class="hidden md:flex md:flex-col border-border border-r md:w-64 shrink-0">
      <SidebarNav />
    </aside>

    <!-- Main content area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Mobile header -->
      <header
        class="md:hidden flex items-center bg-background px-4 border-border border-b h-14 shrink-0"
      >
        <div class="flex justify-between items-center gap-3 w-full min-w-0">
          <h1 class="font-semibold text-foreground text-lg truncate">{{ pageTitle }}</h1>
          <div class="flex items-center gap-2 min-w-0 shrink-0">
            <p class="max-w-[42vw] text-muted-foreground text-xs truncate">{{ userLabel }}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="isLoggingOut"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4" />
              {{ isLoggingOut ? 'Cerrando...' : 'Salir' }}
            </Button>
          </div>
        </div>
      </header>

      <!-- Desktop page header -->
      <header
        class="hidden md:flex justify-between items-center bg-background px-6 border-border border-b h-14 shrink-0"
      >
        <h1 class="font-semibold text-foreground text-lg">{{ pageTitle }}</h1>
      </header>

      <!-- Scrollable view area -->
      <main class="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- BottomNav — solo en mobile -->
    <BottomNav class="md:hidden" />
  </div>
</template>
