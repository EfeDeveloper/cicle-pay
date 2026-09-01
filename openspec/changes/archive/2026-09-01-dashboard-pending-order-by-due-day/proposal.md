## Why

El bloque "Próximos por pagar" del dashboard hoy depende de un orden alfabético heredado, por lo que puede mostrar primero gastos de días posteriores (por ejemplo día 3) aunque el ciclo del mes haya iniciado en día 1. Esto rompe la expectativa de seguimiento cronológico de pagos y genera confusión al priorizar qué pagar primero.

## What Changes

- Definir un orden cronológico estable para gastos pendientes basado en `dueDay` ascendente (1..31), independiente del día calendario actual.
- Mostrar en dashboard los próximos pendientes usando esa prioridad cronológica, no un orden por nombre.
- Establecer desempates determinísticos para evitar saltos visuales entre recargas (nombre e id).
- Mantener consistencia de orden en listas derivadas de pendientes dentro del mismo período, sin alterar reglas de negocio de pago ni persistencia.

### Non-goals

- No cambiar el modelo de datos en Firestore ni estructura de documentos.
- No introducir lógica de "vencido" relativa a la fecha actual del sistema.
- No rediseñar componentes visuales ni flujos de navegación.
- No añadir dependencias nuevas.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `dashboard-experience`: la sección "Próximos por pagar" cambia su comportamiento de orden para priorizar por `dueDay` ascendente de forma estable.
- `monthly-expenses`: las listas de instancias mensuales pendientes adoptan un criterio de orden determinístico centrado en `dueDay` para mantener prioridad de pago consistente en el período.

## Impact

- Superficie afectada: UI y comportamiento de orden en cliente (no dominio persistido).
- Tipo de cambio: UI + lógica de presentación/derivación; sin cambios de schema ni payloads.
- Archivos esperados: `src/services/expenseService.ts`, `src/stores/expenseStore.ts`, y consumidores de pendientes como `src/views/DashboardView.vue` y `src/views/PendingView.vue`.
- ExpenseTemplate vs MonthlyExpense: sin cambios en `ExpenseTemplate`; el ajuste aplica al orden de lectura/uso de `MonthlyExpense` en el período cargado.
