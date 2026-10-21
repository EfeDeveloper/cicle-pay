## 1. Configuración y Servicio de Backend

- [x] 1.1 Configurar la variable de entorno `VITE_BACKEND_API_URL` en `.env` y `.env.example` apuntando al backend (`http://192.168.0.50:8092`) y verificar que se exponga correctamente en la configuración de la app Vite.
- [x] 1.2 Crear el servicio `src/services/receiptService.ts` definiendo los tipos `OcrTextResponse`, `AiExpenseExtractResponse` y los métodos `extractTextFromReceipt`, `extractExpenseFromOcr` y `scanReceiptAndExtract` con control de validación de extensiones y tamaño máximo de 10 MB. Verificar ejecutando chequeo de tipos con `pnpm vue-tsc --noEmit`.

## 2. Componentes de Interfaz y Captura

- [x] 2.1 [ui] Adaptar `src/components/expenses/ManualExpenseFormSheet.vue` para recibir la prop opcional `initialData?: Partial<CreateManualExpenseInput> | null` y cargar automáticamente los datos extraídos por la IA en el formulario. Verificar comprobando que los campos se pueblan al abrir el sheet con datos iniciales.
- [x] 2.2 [ui] Crear el componente `src/components/expenses/ReceiptScannerDialog.vue` implementando los inputs de archivo para desktop y móvil (`capture="environment"` para cámara directa y selector sin capture para galería), además de la visualización de estados (procesando OCR, infiriendo con IA, error amigable y reintento). Verificar la correcta renderización de cada estado.
- [x] 2.3 [ui] Actualizar la barra de herramientas de `src/views/PendingView.vue` reemplazando el botón simple «Agregar gasto adicional» por un `DropdownMenu` con las opciones «Ingreso manual» y «Escanear comprobante (IA)», manteniendo la alineación de la toolbar en desktop y móvil. Verificar la navegación e interacción en ambos viewports.

## 3. Integración y Verificación

- [x] 3.1 Integrar el flujo completo en `src/views/PendingView.vue`: disparar el escaneo desde el menú, invocar `receiptService`, gestionar el diálogo de progreso y abrir `ManualExpenseFormSheet` prellenado para su confirmación y guardado en Firestore. Verificar la persistencia del gasto con `source: 'manual'` en la lista del período.
- [x] 3.2 [qa] Realizar pruebas de verificación funcional y responsive en desktop y móvil simulado (Playwright CLI / navegador) cubriendo el flujo de subida de archivo, mensaje en caso de error/cancelación y guardado final del gasto.
