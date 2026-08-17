import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplate,
} from '@/services/expenseService'
import type { ExpenseTemplate } from '@/types/expense'
import { toast } from 'vue-sonner'

export const useTemplateStore = defineStore('templates', () => {
  // ─── State ─────────────────────────────────────────────────────────────
  const templates = ref<ExpenseTemplate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Actions ───────────────────────────────────────────────────────────
  async function fetchTemplates() {
    loading.value = true
    error.value = null
    try {
      templates.value = await getTemplates()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar plantillas'
      toast.error(error.value ?? 'Error al cargar plantillas')
    } finally {
      loading.value = false
    }
  }

  async function addTemplate(data: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const id = await createTemplate(data)
      await fetchTemplates()
      toast.success('Plantilla creada exitosamente')
      return id
    } catch (e) {
      toast.error('Error al crear plantilla')
      throw e
    }
  }

  async function editTemplate(id: string, data: Partial<Omit<ExpenseTemplate, 'id' | 'createdAt'>>) {
    try {
      await updateTemplate(id, data)
      // Update local state optimistically
      const idx = templates.value.findIndex((t) => t.id === id)
      if (idx !== -1) {
        templates.value[idx] = { ...templates.value[idx], ...data }
      }
      toast.success('Plantilla actualizada')
    } catch (e) {
      toast.error('Error al actualizar plantilla')
      throw e
    }
  }

  async function removeTemplate(id: string) {
    try {
      await deleteTemplate(id)
      templates.value = templates.value.filter((t) => t.id !== id)
      toast.success('Plantilla eliminada')
    } catch (e) {
      toast.error('Error al eliminar plantilla')
      throw e
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await toggleTemplate(id, isActive)
      const idx = templates.value.findIndex((t) => t.id === id)
      if (idx !== -1) {
        templates.value[idx] = { ...templates.value[idx], isActive }
      }
    } catch (e) {
      toast.error('Error al cambiar estado de plantilla')
      throw e
    }
  }

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    addTemplate,
    editTemplate,
    removeTemplate,
    toggleActive,
  }
})
