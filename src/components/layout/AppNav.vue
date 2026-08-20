<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { LogOut, Menu, Repeat } from '@lucide/vue'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { APP_NAV_ITEMS, PAGE_TITLES } from './navItems'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileOpen = ref(false)

const userLabel = computed(() => {
  const email = authStore.user?.email?.trim()
  if (!email) {
    return 'Usuario autenticado'
  }

  return email.split('@')[0]
})

const userEmail = computed(() => authStore.user?.email?.trim() ?? userLabel.value)

const isLoggingOut = computed(() => authStore.isLoading)

const pageTitle = computed(() => PAGE_TITLES[route.name as string] ?? 'CyclePay')

function isActive(name: string) {
  return route.name === name
}

function closeMobileNav() {
  mobileOpen.value = false
}

async function handleLogout() {
  closeMobileNav()
  try {
    await authStore.logout()
    await router.push('/auth/login')
  } catch {
    // authStore.error already contains a localized message.
  }
}
</script>

<template>
  <header class="bg-background/90 border-border/70 border-b backdrop-blur-md shrink-0">
    <!-- Desktop -->
    <div class="hidden md:flex items-center gap-3 px-4 lg:px-6 h-16">
      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <div class="flex justify-center items-center bg-brand rounded-xl size-8">
          <Repeat class="size-4 text-brand-foreground" />
        </div>
        <span class="hidden lg:inline font-semibold text-foreground text-base tracking-tight">
          CyclePay
        </span>
      </RouterLink>

      <nav
        class="flex flex-1 justify-center items-center min-w-0"
        aria-label="Navegación principal"
      >
        <div class="flex flex-nowrap items-center gap-0.5 bg-muted/80 p-1 rounded-full">
          <RouterLink
            v-for="item in APP_NAV_ITEMS"
            :key="item.name"
            :to="item.to"
            class="inline-flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors"
            :class="
              isActive(item.name)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
          >
            <component :is="item.icon" class="size-4 shrink-0" />
            <span class="hidden lg:inline">{{ item.label }}</span>
            <span class="lg:hidden sr-only">{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="flex items-center gap-2 shrink-0">
        <p
          class="hidden xl:block max-w-[10rem] text-muted-foreground text-xs truncate"
          :title="userEmail"
        >
          {{ userLabel }}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          :disabled="isLoggingOut"
          @click="handleLogout"
        >
          <LogOut class="size-4" />
          <span class="hidden lg:inline">{{ isLoggingOut ? 'Cerrando...' : 'Salir' }}</span>
        </Button>
      </div>
    </div>

    <!-- Móvil -->
    <div class="md:hidden flex justify-between items-center gap-3 px-4 h-14">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="flex justify-center items-center bg-brand rounded-xl size-8 shrink-0">
          <Repeat class="size-4 text-brand-foreground" />
        </div>
        <h1 class="font-semibold text-foreground text-base truncate">{{ pageTitle }}</h1>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Abrir menú"
        @click="mobileOpen = true"
      >
        <Menu class="size-5" />
      </Button>
    </div>
  </header>

  <Sheet :open="mobileOpen" @update:open="mobileOpen = $event">
    <SheetContent side="right" class="flex flex-col gap-0 p-0">
      <SheetHeader class="border-border/70 px-5 py-5 border-b">
        <div class="flex items-center gap-2.5">
          <div class="flex justify-center items-center bg-brand rounded-xl size-8">
            <Repeat class="size-4 text-brand-foreground" />
          </div>
          <SheetTitle>CyclePay</SheetTitle>
        </div>
        <SheetDescription class="sr-only">Navegación principal</SheetDescription>
      </SheetHeader>

      <nav class="flex flex-col flex-1 gap-1 px-3 py-4" aria-label="Navegación principal">
        <RouterLink
          v-for="item in APP_NAV_ITEMS"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-full font-medium text-sm transition-colors"
          :class="
            isActive(item.name)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
          @click="closeMobileNav"
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="space-y-3 px-5 py-4 border-border/70 border-t">
        <p class="text-muted-foreground text-xs truncate" :title="userEmail">{{ userEmail }}</p>
        <Button
          type="button"
          variant="secondary"
          class="justify-start w-full"
          :disabled="isLoggingOut"
          @click="handleLogout"
        >
          <LogOut class="size-4" />
          {{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
