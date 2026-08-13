import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from 'firebase/auth'
import {
  onAuthStateChange,
  sendResetPassword,
  signInWithEmailPassword,
  signInWithGoogle,
  signOutUser,
  signUpWithEmailPassword,
} from '@/services/authService'

function mapErrorToSpanish(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Ocurrio un error inesperado. Intenta nuevamente.'
  }

  const code = (error as Error & { code?: string }).code ?? ''
  const knownErrors: Record<string, string> = {
    'auth/invalid-email': 'El correo no tiene un formato valido.',
    'auth/missing-password': 'Ingresa tu contrasena.',
    'auth/invalid-credential': 'Correo o contrasena incorrectos.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Correo o contrasena incorrectos.',
    'auth/email-already-in-use': 'Este correo ya esta registrado.',
    'auth/weak-password': 'La contrasena debe tener al menos 8 caracteres.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta nuevamente en unos minutos.',
    'auth/network-request-failed': 'No fue posible conectar con el servidor. Revisa tu internet.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar el acceso.',
    'auth/cancelled-popup-request': 'Ya hay una ventana de Google abierta. Finaliza esa primero.',
    'auth/popup-blocked': 'El navegador bloqueo la ventana emergente de Google.',
  }

  return knownErrors[code] ?? 'No fue posible completar la autenticacion.'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthReady = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let stopAuthObserver: (() => void) | null = null
  let authReadyPromise: Promise<void> | null = null

  function clearError() {
    error.value = null
  }

  async function withLoading<T>(runner: () => Promise<T>): Promise<T> {
    isLoading.value = true
    error.value = null
    try {
      return await runner()
    } catch (err) {
      error.value = mapErrorToSpanish(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function initAuthListener(): Promise<void> {
    if (isAuthReady.value) {
      return Promise.resolve()
    }

    if (authReadyPromise) {
      return authReadyPromise
    }

    authReadyPromise = new Promise((resolve) => {
      let resolved = false
      stopAuthObserver = onAuthStateChange((nextUser) => {
        user.value = nextUser
        isAuthReady.value = true

        if (!resolved) {
          resolved = true
          resolve()
        }
      })
    })

    return authReadyPromise
  }

  async function loginEmail(email: string, password: string): Promise<void> {
    await withLoading(async () => {
      await signInWithEmailPassword(email, password)
    })
  }

  async function loginGoogle(): Promise<void> {
    await withLoading(async () => {
      await signInWithGoogle()
    })
  }

  async function registerEmail(email: string, password: string): Promise<void> {
    await withLoading(async () => {
      await signUpWithEmailPassword(email, password)
      await signOutUser()
    })
  }

  async function resetPassword(email: string): Promise<void> {
    await withLoading(async () => {
      await sendResetPassword(email)
    })
  }

  async function logout(): Promise<void> {
    await withLoading(async () => {
      await signOutUser()
    })
  }

  function disposeAuthListener() {
    if (stopAuthObserver) {
      stopAuthObserver()
      stopAuthObserver = null
    }
  }

  return {
    user,
    isAuthReady,
    isLoading,
    error,
    clearError,
    initAuthListener,
    loginEmail,
    loginGoogle,
    registerEmail,
    resetPassword,
    logout,
    disposeAuthListener,
  }
})
