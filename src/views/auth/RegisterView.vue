<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})

const touched = reactive({
  email: false,
  password: false,
  confirmPassword: false,
  termsAccepted: false,
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: '',
})

function isEmailFormatValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateEmail(): boolean {
  const emailValue = form.email.trim()
  if (!emailValue) {
    errors.email = 'El correo es obligatorio.'
    return false
  }
  if (!isEmailFormatValid(emailValue)) {
    errors.email = 'Ingresa un correo valido.'
    return false
  }
  errors.email = ''
  return true
}

function validatePassword(): boolean {
  if (!form.password) {
    errors.password = 'La contrasena es obligatoria.'
    return false
  }
  if (form.password.length < 8) {
    errors.password = 'La contrasena debe tener al menos 8 caracteres.'
    return false
  }
  errors.password = ''
  return true
}

function validateConfirmPassword(): boolean {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contrasena.'
    return false
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contrasenas no coinciden.'
    return false
  }
  errors.confirmPassword = ''
  return true
}

function validateTerms(): boolean {
  if (!form.termsAccepted) {
    errors.termsAccepted = 'Debes aceptar los terminos para continuar.'
    return false
  }
  errors.termsAccepted = ''
  return true
}

function validateForm(): boolean {
  return validateEmail() && validatePassword() && validateConfirmPassword() && validateTerms()
}

async function submitRegister() {
  touched.email = true
  touched.password = true
  touched.confirmPassword = true
  touched.termsAccepted = true
  authStore.clearError()

  if (!validateForm()) {
    return
  }

  try {
    await authStore.registerEmail(form.email.trim(), form.password)
    await router.replace('/auth/login')
  } catch {
    // Error global manejado por store
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Crear cuenta</CardTitle>
      <CardDescription>Registrate para guardar tus gastos de forma segura.</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <form class="space-y-4" novalidate @submit.prevent="submitRegister">
        <div class="space-y-1.5">
          <Label for="register-email">Correo</Label>
          <Input
            id="register-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="tu@correo.com"
            :disabled="authStore.isLoading"
            :aria-invalid="touched.email && !!errors.email"
            @blur="touched.email = true; validateEmail()"
          />
          <p v-if="touched.email && errors.email" class="text-destructive text-xs">{{ errors.email }}</p>
        </div>

        <div class="space-y-1.5">
          <Label for="register-password">Contrasena</Label>
          <Input
            id="register-password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="Minimo 8 caracteres"
            :disabled="authStore.isLoading"
            :aria-invalid="touched.password && !!errors.password"
            @blur="touched.password = true; validatePassword()"
          />
          <p v-if="touched.password && errors.password" class="text-destructive text-xs">
            {{ errors.password }}
          </p>
        </div>

        <div class="space-y-1.5">
          <Label for="register-confirm-password">Confirmar contrasena</Label>
          <Input
            id="register-confirm-password"
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Repite tu contrasena"
            :disabled="authStore.isLoading"
            :aria-invalid="touched.confirmPassword && !!errors.confirmPassword"
            @blur="touched.confirmPassword = true; validateConfirmPassword()"
          />
          <p v-if="touched.confirmPassword && errors.confirmPassword" class="text-destructive text-xs">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-start gap-2">
            <Checkbox
              id="register-terms"
              :model-value="form.termsAccepted"
              :disabled="authStore.isLoading"
              @update:model-value="(value) => { form.termsAccepted = value === true; touched.termsAccepted = true; validateTerms() }"
            />
            <Label class="leading-5" for="register-terms">
              Acepto los terminos basicos de uso: esta app no ofrece garantias, el acceso puede
              restringirse en cualquier momento y cada usuario es responsable del uso de su cuenta.
            </Label>
          </div>
          <p v-if="touched.termsAccepted && errors.termsAccepted" class="text-destructive text-xs">
            {{ errors.termsAccepted }}
          </p>
        </div>

        <p v-if="authStore.error" class="text-destructive text-xs" aria-live="polite">{{ authStore.error }}</p>

        <Button class="w-full" type="submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </Button>
      </form>

      <p class="text-muted-foreground text-sm text-center">
        Ya tienes cuenta?
        <RouterLink class="font-medium text-foreground hover:underline" to="/auth/login">
          Inicia sesion
        </RouterLink>
      </p>
    </CardContent>
  </Card>
</template>
