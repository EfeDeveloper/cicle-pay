<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNav from './AppNav.vue'
</script>

<template>
  <div class="flex flex-col bg-background h-screen">
    <AppNav />
    <main class="flex-1 min-w-0 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
