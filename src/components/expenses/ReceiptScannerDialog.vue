<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CreateManualExpenseInput } from '@/types/expense'
import { scanReceiptAndExtract, ReceiptScanError } from '@/services/receiptService'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  FileText,
} from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    periodKey?: string
  }>(),
  {
    periodKey: undefined,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  extracted: [payload: CreateManualExpenseInput]
  fallbackManual: []
}>()

const galleryInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

type ScanStatus = 'idle' | 'ocr' | 'ai' | 'error'
const status = ref<ScanStatus>('idle')
const errorMessage = ref('')
const currentFile = ref<File | null>(null)

const isProcessing = computed(() => status.value === 'ocr' || status.value === 'ai')

const progressValue = computed(() => {
  if (status.value === 'ocr') return 45
  if (status.value === 'ai') return 85
  return 0
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      resetState()
    }
  },
)

function resetState() {
  status.value = 'idle'
  errorMessage.value = ''
  currentFile.value = null
  if (galleryInput.value) galleryInput.value.value = ''
  if (cameraInput.value) cameraInput.value.value = ''
}

function handleClose() {
  if (isProcessing.value) return
  emit('update:open', false)
}

function triggerGallery() {
  galleryInput.value?.click()
}

function triggerCamera() {
  cameraInput.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  currentFile.value = file
  errorMessage.value = ''
  status.value = 'ocr'

  try {
    const expense = await scanReceiptAndExtract(
      file,
      props.periodKey,
      (stage) => {
        status.value = stage
      },
    )

    emit('extracted', expense)
    emit('update:open', false)
  } catch (err: unknown) {
    status.value = 'error'
    if (err instanceof ReceiptScanError) {
      errorMessage.value = err.message
    } else if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al escanear el comprobante.'
    }
  }
}

function handleRetry() {
  resetState()
}

function handleFallbackManual() {
  emit('update:open', false)
  emit('fallbackManual')
}
</script>

<template>
  <!-- Inputs ocultos para captura -->
  <input
    ref="galleryInput"
    type="file"
    accept="image/png,image/jpeg,image/jpg,image/webp"
    class="hidden"
    @change="onFileSelected"
  />
  <input
    ref="cameraInput"
    type="file"
    accept="image/*"
    capture="environment"
    class="hidden"
    @change="onFileSelected"
  />

  <AlertDialog :open="open" @update:open="(val) => !isProcessing && emit('update:open', val)">
    <AlertDialogContent class="sm:max-w-md">
      <AlertDialogHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Sparkles class="size-5" />
            </div>
            <AlertDialogTitle class="text-base sm:text-lg">
              Escanear comprobante
            </AlertDialogTitle>
          </div>
          <Button
            v-if="!isProcessing"
            variant="ghost"
            size="icon"
            class="size-8 rounded-full text-muted-foreground hover:text-foreground"
            @click="handleClose"
          >
            <X class="size-4" />
          </Button>
        </div>
        <AlertDialogDescription class="text-xs sm:text-sm">
          Sube una foto o factura para que la IA extraiga el nombre, monto, categoría y fecha automáticamente.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <!-- Estado: Espera / Selección de archivo (Idle) -->
      <div v-if="status === 'idle'" class="space-y-4 py-2">
        <!-- Opciones móviles rápidas -->
        <div class="grid grid-cols-2 gap-2 sm:hidden">
          <Button
            type="button"
            variant="outline"
            class="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-dashed border-2 hover:border-brand hover:bg-brand/5"
            @click="triggerCamera"
          >
            <Camera class="size-6 text-brand" />
            <span class="text-xs font-medium">Tomar foto</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            class="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-dashed border-2 hover:border-brand hover:bg-brand/5"
            @click="triggerGallery"
          >
            <ImageIcon class="size-6 text-brand" />
            <span class="text-xs font-medium">Subir imagen</span>
          </Button>
        </div>

        <!-- Zona Drag & Drop (Desktop y pantallas medianas) -->
        <div
          class="hidden sm:flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-brand bg-brand/5' : 'border-border/80 hover:border-brand/60 hover:bg-muted/30'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="triggerGallery"
        >
          <div class="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <UploadCloud class="size-6" />
          </div>
          <div>
            <p class="text-sm font-medium">Arrastra tu comprobante aquí o haz clic para explorar</p>
            <p class="text-xs text-muted-foreground mt-0.5">PNG, JPG o WEBP (máx. 10 MB)</p>
          </div>
        </div>

        <p class="text-[11px] text-muted-foreground text-center">
          La imagen se analiza en memoria y no se almacena en el servidor.
        </p>
      </div>

      <!-- Estado: Procesando (OCR / IA) -->
      <div v-else-if="isProcessing" class="space-y-4 py-6 text-center">
        <div class="relative mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Loader2 class="size-7 animate-spin" />
        </div>

        <div class="space-y-1.5">
          <p class="text-sm font-medium text-foreground">
            {{ status === 'ocr' ? 'Leyendo imagen con OCR...' : 'Estructurando datos con IA...' }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ status === 'ocr' ? 'Detectando texto y montos en el documento.' : 'Infiriendo categoría, comercio y vencimiento.' }}
          </p>
        </div>

        <div class="space-y-1 px-4">
          <Progress :model-value="progressValue" class="h-2" />
          <p class="text-[10px] text-muted-foreground text-right">
            {{ status === 'ocr' ? 'Paso 1 de 2' : 'Paso 2 de 2' }}
          </p>
        </div>
      </div>

      <!-- Estado: Error -->
      <div v-else-if="status === 'error'" class="space-y-4 py-4 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle class="size-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">No pudimos procesar el comprobante</p>
          <p class="text-xs text-muted-foreground px-2">
            {{ errorMessage }}
          </p>
        </div>
      </div>

      <AlertDialogFooter class="flex flex-row gap-2 sm:justify-end">
        <template v-if="status === 'idle'">
          <Button variant="outline" class="flex-1 sm:flex-initial" @click="handleClose">
            Cancelar
          </Button>
          <Button class="hidden sm:inline-flex flex-1 sm:flex-initial gap-1.5" @click="triggerGallery">
            <FileText class="size-4" />
            Elegir archivo
          </Button>
        </template>

        <template v-else-if="status === 'error'">
          <Button variant="outline" class="flex-1 sm:flex-initial" @click="handleFallbackManual">
            Ingreso manual
          </Button>
          <Button class="flex-1 sm:flex-initial" @click="handleRetry">
            Reintentar
          </Button>
        </template>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
