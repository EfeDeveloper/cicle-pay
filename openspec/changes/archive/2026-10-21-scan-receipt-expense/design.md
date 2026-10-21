## Context

CyclePay gestiona gastos manuales mediante `ManualExpenseFormSheet.vue` y el store `expenseStore.ts`. Actualmente, el usuario ingresa manualmente todos los campos. Por otro lado, `cicle-pay-backend` (desplegado en `http://192.168.0.50:8092`, frontend en `http://192.168.0.50:8100`) expone dos endpoints de backend:
1. `POST /api/v1/ocr/extract-text`: recibe multipart/form-data con la imagen y devuelve texto OCR.
2. `POST /api/v1/ai/extract-expense`: procesa el texto con el LLM (Ollama) y genera el payload estructurado compatible con `CreateManualExpenseInput`.

Esta solución integra ambos endpoints al flujo de creación de gastos adicionales sin alterar las reglas de datos de Firestore ni la persistencia en `MonthlyExpense`.

## Goals / Non-Goals

**Goals:**
- Proporcionar acceso rápido desde la toolbar de Gastos (`PendingView.vue`) mediante un menú desplegable en el botón de gastos adicionales.
- Soportar selector de archivos en desktop y opciones directas de "Tomar foto" (`capture="environment"`) y "Galería" en dispositivos móviles.
- Orquestar la llamada secuencial (OCR ➔ IA) mostrando un diálogo de progreso con fases informativas claras.
- Abrir `ManualExpenseFormSheet.vue` prellenado para que el usuario valide y confirme antes de guardar.
- Manejar de forma robusta estados de error (archivo inválido, imagen sin texto, timeout o indisponibilidad del servicio de IA).

**Non-Goals:**
- Almacenar la imagen del comprobante en Firebase Storage o Firestore (la imagen es volátil para la inferencia).
- Guardar gastos directamente sin el paso de revisión del usuario.
- Modificar el ciclo de vida o plantillas de `ExpenseTemplate`.

## Decisions

### 1. Menú desplegable en la acción de agregar gasto de `PendingView.vue`
- **Decisión**: Reemplazar el botón simple por un `DropdownMenu` (`reka-ui` / `src/components/ui/dropdown-menu`):
  - *Ingreso manual*: Abre inmediatamente `ManualExpenseFormSheet` en blanco.
  - *Escanear comprobante (IA)*: Inicia el flujo de captura según el dispositivo.
- **Alternativa descartada**: Botón separado en la toolbar. Descartado para cumplir estrictamente con la especificación de `specs/monthly-expenses/spec.md` que exige mantener la distribución de la toolbar en desktop (`search`, luego `calendar`, luego `action`) sin saturar el espacio en pantallas pequeñas.

### 2. Manejo de inputs de archivo para Desktop y Móvil
- **Decisión**: El componente `ReceiptScannerDialog.vue` aloja dos inputs de archivo ocultos:
  - `<input type="file" ref="fileInput" accept="image/png,image/jpeg,image/webp">` para desktop y galería móvil.
  - `<input type="file" ref="cameraInput" accept="image/*" capture="environment">` para captura directa de cámara en móviles.
  En móvil se presenta un selector con dos opciones («Tomar foto» y «Elegir de galería»). En desktop se dispara directamente el selector de archivos.
- **Alternativa descartada**: Confiar exclusivamente en el input nativo sin `capture`. En iOS/Android, `capture="environment"` garantiza disparar la cámara trasera inmediatamente para el usuario que desea escanear un ticket físico al instante.

### 3. Servicio dedicado `src/services/receiptService.ts`
- **Decisión**: Centralizar las llamadas fetch y tipos en `src/services/receiptService.ts`:
  - Utiliza `VITE_BACKEND_API_URL` (configurable en `.env`, por defecto `http://192.168.0.50:8092`).
  - Función `scanReceiptAndExtract(file: File, periodKey?: string): Promise<CreateManualExpenseInput>`.
  - Validación previa de tamaño (<= 10MB) y tipo MIME en cliente antes de la transmisión de red.

### 4. Diálogo de feedback y revisión en `ManualExpenseFormSheet.vue`
- **Decisión**:
  - `ReceiptScannerDialog.vue` gestiona la máquina de estados visuales.
  - Al completar la extracción exitosa, emite el payload inferido y abre `ManualExpenseFormSheet.vue` con la prop `initialData`.
  - El usuario puede editar libremente cualquier dato y presionar «Guardar gasto», ejecutando el método estándar `store.addManualExpense`.

## UI States

### Estados en `ReceiptScannerDialog.vue`:
1. **Empty / Idle**: Diálogo inicial en móvil con opciones de selección («Tomar foto» o «Elegir de galería»). En desktop se activa directamente el selector de archivos del sistema operativo.
2. **Loading (Fase 1 - OCR)**: Indicador de carga con mensaje: *«Analizando comprobante con OCR...»*.
3. **Loading (Fase 2 - IA)**: Indicador de progreso con mensaje: *«Estructurando datos del gasto con IA...»*.
4. **Error**:
   - *Imagen sin texto legible*: Mensaje amigable advirtiendo que no se detectaron datos de gasto legibles, con botones para «Intentar con otra foto» o «Completar manualmente».
   - *Error de conexión / Timeout de IA (503 / 422 / Red)*: Notificación explicativa permitiendo reintentar o ingresar manualmente sin perder el período seleccionado.
5. **Confirmation**:
   - Apertura automática de `ManualExpenseFormSheet.vue` con los datos cargados.
   - Si el ticket venía marcado como factura cancelada/pagada, el interruptor «Marcar como pagado» se activa según la inferencia.

## Affected Concrete Files

1. `.env` y `.env.example`: Configuración de `VITE_BACKEND_API_URL`.
2. `src/services/receiptService.ts` (nuevo): Cliente HTTP tipado para OCR y extracción con IA.
3. `src/components/expenses/ReceiptScannerDialog.vue` (nuevo): Diálogo y lógica de captura para desktop y móvil.
4. `src/components/expenses/ManualExpenseFormSheet.vue`: Incorpora prop `initialData?: Partial<CreateManualExpenseInput> | null` para soportar prellenado.
5. `src/views/PendingView.vue`: Modifica el botón de agregar gasto adicional para integrar el `DropdownMenu` y controlar la apertura del escáner.

## Risks / Trade-offs

- **[Riesgo: Latencia de inferencia en LLM local (Ollama en red local)]** → **Mitigación**: Timeout controlado en fetch (60s) con mensajes progresivos claros en la interfaz y botón para cancelar y pasar al formulario manual en cualquier momento.
- **[Riesgo: Datos OCR parcialmente imprecisos (montos con comas/puntos)]** → **Mitigación**: La IA normaliza montos numéricos y el formulario de confirmación requiere que el usuario valide antes de escribir en Firestore.
- **[Riesgo: Error de CORS en el backend con la IP de despliegue]** → **Mitigación**: `cicle-pay-backend` ya tiene habilitado `CORSMiddleware` para `CORS_ORIGINS`. Se asegura que la URL del front `http://192.168.0.50:8100` esté contemplada en las variables de entorno del backend si se requiere.
