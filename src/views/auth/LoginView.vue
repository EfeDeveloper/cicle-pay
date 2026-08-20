<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import GoogleIcon from '@/components/auth/GoogleIcon.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/')) return '/'
  if (value.startsWith('//')) return '/'
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) return '/'
  return value
}

const form = reactive({
  email: '',
  password: '',
})

const touched = reactive({
  email: false,
  password: false,
})

const errors = reactive({
  email: '',
  password: '',
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
  errors.password = ''
  return true
}

function validateForm(): boolean {
  return validateEmail() && validatePassword()
}

async function submitEmailLogin() {
  touched.email = true
  touched.password = true
  authStore.clearError()

  if (!validateForm()) {
    return
  }

  try {
    await authStore.loginEmail(form.email.trim(), form.password)
    const redirect = safeRedirectPath(route.query.redirect)
    await router.replace(redirect)
  } catch {
    // Error global manejado por store
  }
}

async function submitGoogleLogin() {
  authStore.clearError()

  try {
    await authStore.loginGoogle()
    const redirect = safeRedirectPath(route.query.redirect)
    await router.replace(redirect)
  } catch {
    // Error global manejado por store
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Iniciar sesion</CardTitle>
      <CardDescription>Entra con tu cuenta para acceder a tu dashboard.</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <form class="space-y-4" novalidate @submit.prevent="submitEmailLogin">
        <div class="space-y-1.5">
          <Label for="login-email">Correo</Label>
          <Input
            id="login-email"
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
          <Label for="login-password">Contrasena</Label>
          <Input
            id="login-password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="********"
            :disabled="authStore.isLoading"
            :aria-invalid="touched.password && !!errors.password"
            @blur="touched.password = true; validatePassword()"
          />
          <p v-if="touched.password && errors.password" class="text-destructive text-xs">
            {{ errors.password }}
          </p>
        </div>

        <p v-if="authStore.error" class="text-destructive text-xs" aria-live="polite">{{ authStore.error }}</p>

        <Button class="w-full" type="submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Ingresando...' : 'Ingresar' }}
        </Button>
      </form>

      <div class="flex items-center gap-3 text-muted-foreground text-xs">
        <span class="flex-1 bg-border h-px" />
        <span>o</span>
        <span class="flex-1 bg-border h-px" />
      </div>

      <Button
        class="w-full"
        type="button"
        variant="outline"
        :disabled="authStore.isLoading"
        @click="submitGoogleLogin"
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <div class="flex justify-between items-center text-muted-foreground text-sm">
        <RouterLink class="hover:underline" to="/auth/forgot-password">Olvide mi contrasena</RouterLink>
        <RouterLink class="hover:underline" to="/auth/register">Crear cuenta</RouterLink>
      </div>
    </CardContent>
  </Card>
</template>
