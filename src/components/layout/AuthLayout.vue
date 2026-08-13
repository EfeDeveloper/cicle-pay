<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Repeat } from '@lucide/vue'
</script>

<template>
  <div class="bg-background px-4 py-10 min-h-screen">
    <div class="flex flex-col justify-center mx-auto w-full max-w-md min-h-[calc(100vh-5rem)]">
      <div class="flex justify-center items-center gap-2 mb-6">
        <div class="flex justify-center items-center bg-primary rounded-md w-9 h-9">
          <Repeat class="w-4 h-4 text-primary-foreground" />
        </div>
        <p class="font-semibold text-xl tracking-tight">CyclePay</p>
      </div>
      <RouterView />
    </div>
  </div>
</template>
