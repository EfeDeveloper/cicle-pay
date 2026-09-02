## 1. Servicio de gastos por período/items

- [x] 1.1 Refactorizar helpers de Firestore en `src/services/expenseService.ts` para usar `expenses/{periodKey}/items` y verificar que TypeScript compila sin errores (`pnpm -s tsc --noEmit`).
- [x] 1.2 Actualizar `getMonthlyExpenses` y `createManualExpense` para leer/escribir en la subcolección `items` del período solicitado y verificar manualmente en Firestore Emulator/console que los documentos se crean y leen bajo el período correcto.
- [x] 1.3 Actualizar `generateMonthlyExpenses` para crear `items` con ID auto generado por Firebase y evitar duplicados por `templateId` en el mismo período; verificar que ejecutar dos veces la inicialización del mismo mes no crea duplicados lógicos.
- [x] 1.4 Ajustar `toggleExpenseStatus` (y sus llamados) para operar con contexto de `periodKey` + `expenseId` y verificar en UI que un gasto pending cambia a paid y viceversa sin errores.
- [x] 1.5 Adaptar `getRecentPeriodsHistory` al nuevo árbol por período y verificar que el dashboard muestra historial de 6 meses sin regresiones visibles.

## 2. Reglas Firestore e integridad de datos

- [ ] 2.1 Cambiar `firestore.rules` para validar MonthlyExpense en `match /expenses/{periodKey}/items/{expenseId}` y verificar con emulador/tests de reglas que owner válido puede escribir y no-owner es rechazado.
- [ ] 2.2 Agregar validación de consistencia `request.resource.data.periodKey == periodKey` en reglas y verificar que un write con mismatch de período es denegado.
- [x] 2.3 Eliminar o desactivar la ruta plana de escritura para MonthlyExpense en reglas y verificar que ya no se aceptan writes en `expenses/{expenseId}`.

## 3. Verificación funcional del cambio

- [x] 3.1 Validar flujo Gastos: cargar período, agregar manual, iniciar mes desde plantillas y toggle de estado; verificar que todas las operaciones reflejan datos en `expenses/{periodKey}/items`.
- [x] 3.2 Validar flujo Historial y Dashboard con meses múltiples ya migrados y verificar que métricas/orden por `dueDay` permanecen correctos.
- [x] 3.3 Ejecutar suite del proyecto (`pnpm test` o comando equivalente disponible) y verificación estática (`pnpm -s tsc --noEmit`), confirmando cero errores nuevos relacionados con este change.