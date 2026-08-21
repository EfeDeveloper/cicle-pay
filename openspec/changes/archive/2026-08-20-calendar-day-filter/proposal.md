## Why

Con muchos ítems, filtrar por día exige un control claro. El grid 1–31 inline ocupa demasiado y no pagina meses. El drawer de vista previa aún debía perder el texto «Vista de solo lectura» (ya cubierto).

## What Changes

- Quitar el texto visible «Vista de solo lectura» del drawer (`RecordDetailSheet`); dejar descripción `sr-only`.
- Sustituir el grid inline por un **botón descriptivo** que abre un **calendario emergente** (shadcn-vue `Calendar` + `Popover` ya en el repo).
- En Gastos e Historial, las marcas pending/paid/mixed van en los días del mes mostrado. Cambiar de mes en el popover **carga ese `periodKey`** (sin ir al futuro).
- En Plantillas, el mes es marco visual; el filtro sigue siendo `dueDay` 1–31, sin `status`.
- Pulsar un día marcado filtra la lista. «Todos» / «Sin día» viven en el popover. El botón **sigue visible** si el mes está vacío, para poder ir a otro mes.

Toca **UI**. Gastos deja de estar clavado al mes actual (misma carga Pinia `fetchExpenses`). No cambia el modelo Firestore.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `monthly-expenses`: trigger + popover Calendar; marcas pending/paid; cambiar mes carga período; drawer sin copy visible de solo lectura.
- `expense-templates`: mismo trigger/popover en modo presence; el mes no altera plantillas.

## Impact

- Vistas: `PendingView.vue` (usa `usePeriod`), `HistoryView.vue`, `TemplatesView.vue`.
- `DueDayCalendar.vue` pasa a Button + Popover + Calendar. Helpers en `src/lib/dueDayCalendar.ts` se reutilizan.
- Dep nueva justificada: `calendar` shadcn-vue y `@internationalized/date` (API del Calendar). Popover, Button y reka-ui ya existen.
- `ExpenseTemplate` no gana `status`/`periodKey`.

## Non-goals

- No es date picker para crear/editar ítems.
- No persiste el filtro ni añade campos Firestore.
- No agrupa por `paidAt`.
- No cambia Dashboard, auth ni materialización de plantillas.
- No navega meses futuros en Gastos/Historial.
