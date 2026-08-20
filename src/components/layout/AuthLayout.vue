<script setup lang="ts">
import { RouterView } from 'vue-router'
import AuthBrandPanel from '@/components/auth/AuthBrandPanel.vue'
</script>

<template>
  <div class="relative bg-background min-h-screen overflow-hidden">
    <div
      class="lg:hidden -top-32 -right-16 absolute bg-brand/15 blur-3xl rounded-full size-64 pointer-events-none"
    />
    <div
      class="lg:hidden -bottom-24 -left-12 absolute bg-brand/10 blur-3xl rounded-full size-56 pointer-events-none"
    />

    <div class="lg:grid lg:grid-cols-2 min-h-screen">
      <AuthBrandPanel />

      <div class="z-10 relative flex flex-col justify-center mx-auto px-4 py-10 w-full max-w-md min-h-screen">
        <AuthBrandPanel class="lg:hidden mb-8" compact />
        <RouterView />
      </div>
    </div>
  </div>
</template>
