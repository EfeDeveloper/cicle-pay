<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const email = ref('')
const touched = ref(false)
const emailError = ref('')
const resetDone = ref(false)

function isEmailFormatValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateEmail(): boolean {
  const emailValue = email.value.trim()
  if (!emailValue) {
    emailError.value = 'El correo es obligatorio.'
    return false
  }
  if (!isEmailFormatValid(emailValue)) {
    emailError.value = 'Ingresa un correo valido.'
    return false
  }
  emailError.value = ''
  return true
}

async function submitResetPassword() {
  touched.value = true
  authStore.clearError()
  resetDone.value = false

  if (!validateEmail()) {
    return
  }

  try {
    await authStore.resetPassword(email.value.trim())
    resetDone.value = true
  } catch {
    // Error global manejado por store
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Restablecer contrasena</CardTitle>
      <CardDescription>
        Te enviaremos un enlace para recuperar tu acceso por correo.
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <form class="space-y-4" novalidate @submit.prevent="submitResetPassword">
        <div class="space-y-1.5">
          <Label for="reset-email">Correo</Label>
          <Input
            id="reset-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="tu@correo.com"
            :disabled="authStore.isLoading"
            :aria-invalid="touched && !!emailError"
            @blur="touched = true; validateEmail()"
          />
          <p v-if="touched && emailError" class="text-destructive text-xs">{{ emailError }}</p>
        </div>

        <p v-if="authStore.error" class="text-destructive text-xs" aria-live="polite">{{ authStore.error }}</p>

        <p v-if="resetDone" class="text-emerald-700 text-xs" aria-live="polite">
          Te enviamos un correo con el enlace de recuperacion. Revisa tu bandeja principal y spam.
          Si tu cuenta fue creada con Google, inicia sesion desde el boton de Google en login.
        </p>

        <Button class="w-full" type="submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Enviando...' : 'Enviar correo de recuperacion' }}
        </Button>
      </form>

      <p class="text-muted-foreground text-sm text-center">
        <RouterLink class="font-medium text-foreground hover:underline" to="/auth/login">
          Volver a iniciar sesion
        </RouterLink>
      </p>
    </CardContent>
  </Card>
</template>
