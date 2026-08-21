## Why

En desktop el botón «Filtrar por día de pago» queda debajo del buscador y deja un hueco ancho a la derecha. En Historial, las flechas de mes duplican el Calendar y el buscador solo aparece si el período tiene gastos (en un mes vacío parece que no hay búsqueda).

## What Changes

- En **desktop** (`sm+`), el trigger del calendario va **a la derecha del buscador** en Gastos, Historial y Plantillas (misma fila). En móvil se apilan.
- En Gastos/Plantillas, el CTA («Agregar gasto adicional» / «Nueva plantilla») permanece en esa fila, a la derecha del calendario.
- Quitar en Historial el scroller de chevrons (atrás/adelante). El cambio de mes queda solo en el popover del Calendar.
- Cabecera de Historial **alineada a la izquierda**, solo informativa: mes y año (`Agosto 2026`); si hay día filtrado, `21 de agosto de 2026`.
- Reubicar `ListSearchBar` en Historial a esa misma toolbar (visible tras el primer load, también en mes vacío). No se crea un buscador nuevo.

Toca **solo UI**. No cambia Firestore, `ExpenseTemplate` ni `MonthlyExpense`.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `monthly-expenses`: toolbar buscador+calendario en Gastos e Historial; Historial sin chevrons; título de período informativo; búsqueda siempre disponible tras cargar.
- `expense-templates`: misma fila buscador+calendario+CTA en desktop.

## Impact

- Vistas: `PendingView.vue`, `HistoryView.vue`, `TemplatesView.vue`.
- `DueDayCalendar.vue`: el trigger deja de ser `w-full` en la fila desktop (`shrink-0`).
- Reuso: `ListSearchBar`, `DueDayCalendar`, `usePeriod` (sin chevrons en Historial; `setPeriod` sigue desde el popover).
- Sin dependencias nuevas.

## Non-goals

- No cambia el popover, marcas ni el filtro por `dueDay`.
- No añade un date picker de alta.
- No toca Dashboard ni auth.
- No rediseña las tabs ni el resumen de Historial.
