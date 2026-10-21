## Why

Registrar gastos adicionales manualmente en CyclePay requiere digitar nombre, monto, categoría y fecha a partir de recibos o facturas físicas y digitales. Permitir capturar fotos desde dispositivos móviles o subir imágenes desde desktop para procesarlas con el backend de OCR e IA agiliza la carga y reduce errores tipográficos, manteniendo el control final en el usuario mediante un formulario de revisión previo al guardado.

## What Changes

- **Menú de acción en Gastos (`PendingView`)**: Se actualiza el botón de acción para agregar gasto adicional, ofreciendo dos vías: registro manual directo o escaneo inteligente de comprobante.
- **Captura multimodal**:
  - En desktop: selector de archivos de imagen (PNG, JPG, JPEG, WEBP).
  - En móvil: opciones directas para capturar foto en vivo con la cámara (`capture="environment"`) o seleccionar imagen de la galería.
- **Servicio de integración con backend**: Nuevo cliente `receiptService` que se conecta a `cicle-pay-backend` (`VITE_BACKEND_API_URL`, por defecto `http://192.168.0.50:8092`) ejecutando:
  1. Extracción de texto vía OCR (`POST /api/v1/ocr/extract-text`).
  2. Inferencia y estructuración con IA (`POST /api/v1/ai/extract-expense`).
- **Modal de escaneo y estados de carga**: Diálogo con indicador de progreso durante las fases de OCR e inferencia con IA, junto con manejo explícito de errores (imagen ilegible, servicio no disponible o timeout).
- **Prellenado y revisión asistida**: Tras el escaneo exitoso, `ManualExpenseFormSheet` se abre con los datos extraídos para que el usuario verifique y guarde el gasto.

## Non-goals

- No se guardará ni persistirá la imagen en Firestore ni en Firebase Storage (solo se envía en memoria al backend de inferencia).
- No se realiza guardado automático silencioso sin confirmación del usuario.
- No se admiten archivos PDF ni documentos multipágina en esta fase (solo imágenes).
- No se modifica la gestión ni estructura de `ExpenseTemplate`.

## Capabilities

### Modified Capabilities
- `monthly-expenses`: Añade soporte para iniciar el registro de gastos adicionales desde escaneo de comprobantes (móvil y desktop) e incorporar el flujo de verificación y prellenado antes de persistir como gasto mensual manual (`MonthlyExpense`).

## Impact

- **UI / Dominio**: Modifica componentes de interfaz (`PendingView.vue`, `ManualExpenseFormSheet.vue`, nuevo `ReceiptScannerDialog.vue`) y añade `receiptService.ts`. No altera el modelo de dominio en Firestore (`MonthlyExpense` se guarda con `source: 'manual'` y `templateId: null`).
- **Variables de entorno**: Incorpora `VITE_BACKEND_API_URL` en `.env` y `.env.example`.
- **Dependencias**: No requiere dependencias externas adicionales; reutiliza `reka-ui`, componentes UI existentes y `@lucide/vue`.
