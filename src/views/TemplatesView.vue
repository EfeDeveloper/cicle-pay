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
import ListSearchBar from '@/components/lists/ListSearchBar.vue'
import RecordDetailSheet from '@/components/records/RecordDetailSheet.vue'
import { filterTemplates } from '@/lib/filterTemplates'
import { toTemplateDetail, type RecordDetail } from '@/lib/recordDetail'
import { Plus } from '@lucide/vue'

const store = useTemplateStore()

onMounted(async () => {
  await store.fetchTemplates()
})

// ─── Tabs ─────────────────────────────────────────────────────────────────
const activeTab = ref<'all' | 'active' | 'inactive'>('all')
const searchQuery = ref('')

const filteredTemplates = computed(() => {
  let list = store.templates
  if (activeTab.value === 'active') list = list.filter((t) => t.isActive)
  if (activeTab.value === 'inactive') list = list.filter((t) => !t.isActive)
  return filterTemplates(list, searchQuery.value)
})

const isSearchActive = computed(() => searchQuery.value.trim().length > 0)
const activeCount = computed(() => store.templates.filter((template) => template.isActive).length)
const inactiveCount = computed(() => store.templates.length - activeCount.value)

// ─── Sheet (crear/editar) ─────────────────────────────────────────────────
const sheetOpen = ref(false)
const selectedTemplate = ref<ExpenseTemplate | undefined>(undefined)
const detailOpen = ref(false)
const detailRecord = ref<RecordDetail | null>(null)

function openDetail(template: ExpenseTemplate) {
  detailRecord.value = toTemplateDetail(template)
  detailOpen.value = true
}

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
  <div class="space-y-5 mx-auto p-4 md:p-8 max-w-5xl">
    <div class="hidden sm:block">
      <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">Recurrentes</p>
      <h2 class="font-bold text-foreground text-2xl tracking-tight">Plantillas</h2>
    </div>
    <div class="flex sm:flex-row flex-col sm:items-center gap-3">
      <ListSearchBar
        id="template-search"
        v-model="searchQuery"
        aria-label="Buscar plantillas"
      />
      <Button size="sm" @click="openCreate" class="gap-1.5 sm:shrink-0">
        <Plus class="w-4 h-4" />
        Nueva plantilla
      </Button>
    </div>
    <p class="text-muted-foreground text-xs">
      {{ activeCount }} activas ·
      {{ store.templates.length }} total
    </p>

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
          <span v-if="activeCount" class="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5">
            {{ activeCount }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="inactive">
          Inactivas
          <span v-if="inactiveCount" class="ml-1.5 text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">
            {{ inactiveCount }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Tab content -->
      <TabsContent value="all" :force-mount="true" v-show="activeTab === 'all'" class="mt-4">
        <TemplatesTabContent
          :loading="store.loading"
          :templates="filteredTemplates"
          :search-active="isSearchActive"
          @edit="openEdit"
          @delete="confirmDelete"
          @toggle="handleToggle"
          @view="openDetail"
        />
      </TabsContent>
      <TabsContent value="active" :force-mount="true" v-show="activeTab === 'active'" class="mt-4">
        <TemplatesTabContent
          :loading="store.loading"
          :templates="filteredTemplates"
          :search-active="isSearchActive"
          @edit="openEdit"
          @delete="confirmDelete"
          @toggle="handleToggle"
          @view="openDetail"
        />
      </TabsContent>
      <TabsContent value="inactive" :force-mount="true" v-show="activeTab === 'inactive'" class="mt-4">
        <TemplatesTabContent
          :loading="store.loading"
          :templates="filteredTemplates"
          :search-active="isSearchActive"
          @edit="openEdit"
          @delete="confirmDelete"
          @toggle="handleToggle"
          @view="openDetail"
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

  <RecordDetailSheet
    :open="detailOpen"
    :record="detailRecord"
    @close="detailOpen = false"
  />
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
    searchActive: Boolean,
    templates: {
      type: Array as PropType<ExpenseTemplate[]>,
      required: true,
    },
  },
  emits: ['edit', 'delete', 'toggle', 'view'],
  setup(props, { emit }) {
    return () => {
      if (props.loading) {
        return h('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' }, [
          ...Array.from({ length: 6 }, (_, i) =>
            h(SkeletonComp, { key: i, class: 'h-28 rounded-2xl' }),
          ),
        ])
      }

      if (props.templates.length === 0) {
        return h(
          'div',
          { class: 'flex flex-col items-center justify-center py-16 gap-4' },
          [
            h('div', { class: 'flex justify-center items-center bg-brand-soft rounded-full size-14' }, [
              h(LT, { class: 'size-7 text-brand' }),
            ]),
            h('div', { class: 'text-center' }, [
              h(
                'p',
                { class: 'text-sm font-medium text-foreground' },
                props.searchActive ? 'Sin coincidencias' : 'Sin plantillas',
              ),
              h(
                'p',
                { class: 'text-xs text-muted-foreground mt-1' },
                props.searchActive
                  ? 'Prueba con otro nombre o categoría'
                  : 'Crea plantillas para generar gastos automáticamente cada mes',
              ),
            ]),
          ],
        )
      }

      return h('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' }, [
        ...props.templates.map((template) =>
          h(TemplateCardComp, {
            key: template.id,
            template,
            onEdit: () => emit('edit', template),
            onDelete: () => emit('delete', template),
            onToggle: (v: boolean) => emit('toggle', template.id, v),
            onView: () => emit('view', template),
          }),
        ),
      ])
    }
  },
})

export { TemplatesTabContent }
</script>
