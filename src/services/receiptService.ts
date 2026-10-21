import type { CreateManualExpenseInput } from '@/types/expense'

export interface OcrTextResponse {
  has_text: boolean
  raw_text: string
  lines: string[]
  line_count: number
  message?: string | null
  processing_time_ms: number
  engine?: string | null
}

export interface ExtractedExpensePayload {
  name: string
  amount: number
  category: string
  description?: string | null
  dueDay?: number | null
  periodKey: string
  status: 'pending' | 'paid'
  source: 'manual'
  templateId?: null
}

export interface AiExpenseExtractResponse {
  success: boolean
  expense?: ExtractedExpensePayload | null
  processing_time_ms: number
  model?: string | null
  message?: string | null
}

export class ReceiptScanError extends Error {
  readonly code: 'INVALID_FILE' | 'FILE_TOO_LARGE' | 'NO_TEXT' | 'AI_UNAVAILABLE' | 'AI_ERROR' | 'NETWORK_ERROR'
  readonly details?: unknown

  constructor(
    message: string,
    code: 'INVALID_FILE' | 'FILE_TOO_LARGE' | 'NO_TEXT' | 'AI_UNAVAILABLE' | 'AI_ERROR' | 'NETWORK_ERROR',
    details?: unknown,
  ) {
    super(message)
    this.name = 'ReceiptScanError'
    this.code = code
    this.details = details
  }
}

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export function getBackendBaseUrl(): string {
  const url = import.meta.env.VITE_BACKEND_API_URL || 'http://192.168.0.50:8092'
  return url.replace(/\/+$/, '')
}

/**
 * Valida formato y peso del archivo antes de subirlo
 */
export function validateReceiptFile(file: File): void {
  if (!file) {
    throw new ReceiptScanError('No se seleccionó ningún archivo.', 'INVALID_FILE')
  }

  const name = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type) || file.type.startsWith('image/')

  if (!hasValidExtension && !hasValidMime) {
    throw new ReceiptScanError(
      'Formato de imagen no soportado. Usa archivos PNG, JPG, JPEG o WEBP.',
      'INVALID_FILE',
    )
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ReceiptScanError(
      'La imagen excede el tamaño máximo permitido de 10 MB.',
      'FILE_TOO_LARGE',
    )
  }
}

/**
 * Extrae texto del comprobante mediante el servicio OCR del backend
 */
export async function extractTextFromReceipt(file: File): Promise<OcrTextResponse> {
  validateReceiptFile(file)

  const formData = new FormData()
  formData.append('file', file)

  const backendUrl = getBackendBaseUrl()
  let response: Response

  try {
    response = await fetch(`${backendUrl}/api/v1/ocr/extract-text`, {
      method: 'POST',
      body: formData,
    })
  } catch (err) {
    throw new ReceiptScanError(
      'No se pudo conectar con el servicio de OCR. Verifica tu conexión y que el backend esté en ejecución.',
      'NETWORK_ERROR',
      err,
    )
  }

  if (!response.ok) {
    let errorDetail = `Error ${response.status} al procesar OCR`
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = errJson.detail
    } catch {
      // Usar error genérico
    }
    throw new ReceiptScanError(errorDetail, 'NETWORK_ERROR')
  }

  return (await response.json()) as OcrTextResponse
}

/**
 * Infiere y estructura los datos de un gasto desde texto OCR
 */
export async function extractExpenseFromOcr(
  rawText: string,
  periodKey?: string,
): Promise<AiExpenseExtractResponse> {
  if (!rawText.trim()) {
    throw new ReceiptScanError('El texto para análisis con IA está vacío.', 'NO_TEXT')
  }

  const backendUrl = getBackendBaseUrl()
  let response: Response

  try {
    response = await fetch(`${backendUrl}/api/v1/ai/extract-expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw_text: rawText,
        period_key: periodKey || undefined,
      }),
    })
  } catch (err) {
    throw new ReceiptScanError(
      'No se pudo conectar con el servicio de IA. Verifica tu conexión y que el backend esté en ejecución.',
      'NETWORK_ERROR',
      err,
    )
  }

  if (response.status === 503) {
    let msg = 'El modelo de IA no está disponible o excedió el tiempo límite.'
    try {
      const json = await response.json()
      if (json?.detail) msg = json.detail
    } catch {}
    throw new ReceiptScanError(msg, 'AI_UNAVAILABLE')
  }

  if (response.status === 422) {
    let msg = 'El texto no contiene datos suficientes para registrar un gasto.'
    try {
      const json = await response.json()
      if (json?.detail) msg = json.detail
    } catch {}
    throw new ReceiptScanError(msg, 'AI_ERROR')
  }

  if (!response.ok) {
    let errorDetail = `Error ${response.status} en el procesamiento con IA`
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = errJson.detail
    } catch {}
    throw new ReceiptScanError(errorDetail, 'AI_ERROR')
  }

  return (await response.json()) as AiExpenseExtractResponse
}

/**
 * Orquesta el flujo completo de escaneo (OCR ➔ IA)
 */
export async function scanReceiptAndExtract(
  file: File,
  periodKey?: string,
  onStageChange?: (stage: 'ocr' | 'ai') => void,
): Promise<CreateManualExpenseInput> {
  onStageChange?.('ocr')
  const ocrResult = await extractTextFromReceipt(file)

  if (!ocrResult.has_text || !ocrResult.raw_text.trim()) {
    throw new ReceiptScanError(
      'No se encontró texto legible en la imagen. Asegúrate de que la foto esté enfocada e iluminada.',
      'NO_TEXT',
    )
  }

  onStageChange?.('ai')
  const aiResult = await extractExpenseFromOcr(ocrResult.raw_text, periodKey)

  if (!aiResult.success || !aiResult.expense) {
    throw new ReceiptScanError(
      aiResult.message || 'No fue posible interpretar los datos del comprobante con IA.',
      'AI_ERROR',
    )
  }

  const expense = aiResult.expense

  return {
    name: expense.name,
    amount: Number(expense.amount),
    category: expense.category,
    periodKey: expense.periodKey || periodKey || '',
    dueDay: expense.dueDay ?? null,
    description: expense.description || undefined,
    status: expense.status || 'pending',
  }
}
