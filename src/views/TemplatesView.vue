<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import type { ExpenseTemplate } from '@/types/expense'
import TemplateFormSheet from '@/components/templates/TemplateFormSheet.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from '@lucide/vue'

const store = useTemplateStore()

onMounted(async () => {
  await store.fetchTemplates()
})

// ─── Tabs ─────────────────────────────────────────────────────────────────
const activeTab = ref<'all' | 'active' | 'inactive'>('all')

const filteredTemplates = computed(() => {
  if (activeTab.value === 'active') return store.templates.filter((t) => t.isActive)
  if (activeTab.value === 'inactive') return store.templates.filter((t) => !t.isActive)
  return store.templates
})

// ─── Sheet (crear/editar) ─────────────────────────────────────────────────
const sheetOpen = ref(false)
const selectedTemplate = ref<ExpenseTemplate | undefined>(undefined)

function openCreate() {
  selectedTemplate.value = undefined
  sheetOpen.value = true
}

function openEdit(template: ExpenseTemplate) {
  selectedTemplate.value = template
  sheetOpen.value = true
}

function closeSheet() {
  sheetOpen.value = false
  selectedTemplate.value = undefined
}

async function handleSaved(data: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
  if (selectedTemplate.value) {
    await store.editTemplate(selectedTemplate.value.id, data)
  } else {
    await store.addTemplate(data)
  }
  closeSheet()
}

// ─── Delete dialog ────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false)
const templateToDelete = ref<ExpenseTemplate | null>(null)

function confirmDelete(template: ExpenseTemplate) {
  templateToDelete.value = template
  deleteDialogOpen.value = true
}

async function executeDelete() {
  if (templateToDelete.value) {
    await store.removeTemplate(templateToDelete.value.id)
    templateToDelete.value = null
  }
  deleteDialogOpen.value = false
}

// ─── Toggle active ────────────────────────────────────────────────────────
async function handleToggle(id: string, isActive: boolean) {
  await store.toggleActive(id, isActive)
}
</script>

<template>
  <div class="space-y-5 mx-auto p-4 md:p-8 max-w-3xl">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-muted-foreground">
          {{ store.templates.filter((t) => t.isActive).length }} activas ·
          {{ store.templates.length }} total
        </p>
      </div>
      <Button size="sm" @click="openCreate" class="gap-1.5">
        <Plus class="w-4 h-4" />
        Nueva plantilla
      </Button>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="w-full grid grid-cols-3">
        <TabsTrigger value="all">
          Todas
          <span v-if="store.templates.length" class="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
            {{ store.templates.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="active">
          Activas
          <span v-if="store.templates.filter(t => t.isActive).length" class="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5">
            {{ store.templates.filter(t => t.isActive).length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="inactive">
          Inactivas
        </TabsTrigger>
      </TabsList>

      <!-- Tab content -->
      <TabsContent value="all" :force-mount="true" v-show="activeTab === 'all'" class="mt-4">
        <TemplatesTabContent
          :loading="store.loading"
          :templates="filteredTemplates"
          @edit="openEdit"
          @delete="confirmDelete"
          @toggle="handleToggle"
        />
      </TabsContent>
      <TabsContent value="active" :force-mount="true" v-show="activeTab === 'active'" class="mt-4">
        <TemplatesTabContent
          :loading="store.loading"
          :templates="filteredTemplates"
          @edit="openEdit"
          @delete="confirmDelete"
          @toggle="handleToggle"
        />
      </TabsContent>
      <TabsContent value="inactive" :force-mount="true" v-show="activeTab === 'inactive'" class="mt-4">
        <TemplatesTabContent
          :loading="store.loading"
          :templates="filteredTemplates"
          @edit="openEdit"
          @delete="confirmDelete"
          @toggle="handleToggle"
        />
      </TabsContent>
    </Tabs>
  </div>

  <!-- Sheet crear/editar -->
  <TemplateFormSheet
    :open="sheetOpen"
    :template="selectedTemplate"
    @close="closeSheet"
    @saved="handleSaved"
  />

  <!-- Delete confirmation dialog -->
  <AlertDialog :open="deleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. La plantilla
          <strong>{{ templateToDelete?.name }}</strong> será eliminada permanentemente.
          Los gastos ya generados no se verán afectados.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="deleteDialogOpen = false">Cancelar</AlertDialogCancel>
        <AlertDialogAction
          @click="executeDelete"
          class="bg-destructive text-white hover:bg-destructive/90"
        >
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<!-- Inline sub-component for tab content (avoid duplicating template code) -->
<script lang="ts">
import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import TemplateCardComp from '@/components/templates/TemplateCard.vue'
import SkeletonComp from '@/components/ui/skeleton/Skeleton.vue'
import { LayoutTemplate as LT } from '@lucide/vue'

const TemplatesTabContent = defineComponent({
  name: 'TemplatesTabContent',
  props: {
    loading: Boolean,
    templates: {
      type: Array as PropType<ExpenseTemplate[]>,
      required: true,
    },
  },
  emits: ['edit', 'delete', 'toggle'],
  setup(props, { emit }) {
    return () => {
      if (props.loading) {
        return h('div', { class: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
          ...Array.from({ length: 4 }, (_, i) =>
            h(SkeletonComp, { key: i, class: 'h-28 rounded-2xl' }),
          ),
        ])
      }

      if (props.templates.length === 0) {
        return h(
          'div',
          { class: 'flex flex-col items-center justify-center py-16 gap-4' },
          [
            h(LT, { class: 'w-12 h-12 text-muted-foreground' }),
            h('div', { class: 'text-center' }, [
              h('p', { class: 'text-sm font-medium text-foreground' }, 'Sin plantillas'),
              h(
                'p',
                { class: 'text-xs text-muted-foreground mt-1' },
                'Crea plantillas para generar gastos automáticamente cada mes',
              ),
            ]),
          ],
        )
      }

      return h('div', { class: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
        ...props.templates.map((template) =>
          h(TemplateCardComp, {
            key: template.id,
            template,
            onEdit: () => emit('edit', template),
            onDelete: () => emit('delete', template),
            onToggle: (v: boolean) => emit('toggle', template.id, v),
          }),
        ),
      ])
    }
  },
})

export { TemplatesTabContent }
</script>
