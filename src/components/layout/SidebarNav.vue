<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { Repeat, LayoutDashboard, Clock, History, LayoutTemplate, LogOut } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userLabel = computed(() => {
  const email = authStore.user?.email?.trim()
  if (!email) {
    return 'Usuario autenticado'
  }

  const maxLength = 30
  if (email.length <= maxLength) {
    return email
  }

  return `${email.slice(0, maxLength - 1)}…`
})

const isLoggingOut = computed(() => authStore.isLoading)

const navItems = [
  { to: '/', name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pending', name: 'pending', label: 'Gastos', icon: Clock },
  { to: '/history', name: 'history', label: 'Historial', icon: History },
  { to: '/templates', name: 'templates', label: 'Plantillas', icon: LayoutTemplate },
]

function isActive(name: string) {
  return route.name === name
}

async function handleLogout() {
  try {
    await authStore.logout()
    await router.push('/auth/login')
  } catch {
    // authStore.error already contains a localized message.
  }
}
</script>

<template>
  <div class="flex flex-col bg-sidebar h-full">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-4 border-sidebar-border border-b h-14 shrink-0">
      <div class="flex justify-center items-center bg-primary rounded-md w-8 h-8">
        <Repeat class="w-4 h-4 text-primary-foreground" />
      </div>
      <span class="font-semibold text-sidebar-foreground text-base">CyclePay</span>
    </div>

    <!-- Nav items -->
    <nav class="flex flex-col flex-1 gap-1 px-3 py-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 hover:bg-sidebar-accent px-3 py-2 rounded-md font-medium text-sidebar-foreground text-sm transition-colors hover:text-sidebar-accent-foreground"
        :class="{
          'bg-sidebar-accent text-sidebar-accent-foreground': isActive(item.name),
        }"
      >
        <component :is="item.icon" class="w-4 h-4 shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="space-y-3 px-4 py-3 border-sidebar-border border-t">
      <div class="space-y-1">
        <p class="text-[11px] text-muted-foreground uppercase tracking-wide">Sesion activa</p>
        <p class="text-sidebar-foreground text-sm truncate" :title="userLabel">{{ userLabel }}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        class="justify-start w-full"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        <LogOut class="w-4 h-4" />
        {{ isLoggingOut ? 'Cerrando sesion...' : 'Cerrar sesion' }}
      </Button>
      <p class="text-muted-foreground text-xs">CyclePay v0.1.0</p>
    </div>
  </div>
</template>
