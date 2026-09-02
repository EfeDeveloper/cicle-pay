## Context

See `proposal.md` for motivation. Hoy `budget` ya está modelado por período (`budgets/{periodKey}`), pero `expenseService` y `firestore.rules` siguen usando la ruta plana de MonthlyExpense (`expenses/{expenseId}`) con filtro por campo `periodKey`. El cambio requiere alinear rutas de lectura/escritura de gastos con la estructura ya migrada en Firestore: `expenses/{periodKey}/items/{expenseId}`.

## Goals / Non-Goals

**Goals:**
- Unificar el acceso de MonthlyExpense a la ruta por período con subcolección `items`.
- Mantener intactos los comportamientos funcionales existentes (generación idempotente, toggle de estado, filtros por período, historial reciente).
- Actualizar reglas para validar owner, payload y consistencia entre `periodKey` del documento y `periodKey` del path.

**Non-Goals:**
- Rediseño de UI o cambios en copy/flujo de vistas.
- Cambiar el modelo de `ExpenseTemplate` o de `Budget`.
- Añadir librerías, colas, o procesos batch adicionales.

## Decisions

1. Canonical path de MonthlyExpense
- Decisión: usar `payment_cycles/{uid}/expenses/{periodKey}/items/{expenseId}` como única ruta canónica para el cliente.
- Rationale: coincide con la migración ya aplicada y reduce el costo/ambigüedad de queries por período.
- Alternativa considerada: dual-read temporal (ruta nueva + plana). Se descarta en esta propuesta porque el owner confirmó migración de datos ya ejecutada y se prioriza simplicidad operativa.

2. API de servicio con helpers por período
- Decisión: separar helpers de Firestore en nivel período (`userExpensePeriodDoc`) y nivel ítems (`userExpenseItemsCol`, `userExpenseItemDoc`).
- Rationale: evita errores al actualizar estado por `id` sin contexto de período y hace explícita la pertenencia mensual.
- Alternativa considerada: mantener helpers planos y pasar queries ad hoc. Se descarta por mayor probabilidad de inconsistencias.

3. Ajuste de operaciones clave
- Decisión: `getMonthlyExpenses`, `createManualExpense` y `generateMonthlyExpenses` operan directo contra `items` del período cargado; `toggleExpenseStatus` recibe (o resuelve) `periodKey` junto al `id`; `getRecentPeriodsHistory` consulta por período en bucle controlado.
- Rationale: el nuevo árbol no permite una sola query simple por `periodKey` sobre colección plana.
- Alternativa considerada: `collectionGroup('items')` + índice. Se reserva para optimización futura si rendimiento lo requiere.

4. Reglas Firestore por subcolección
- Decisión: mover validaciones de MonthlyExpense a `match /expenses/{periodKey}/items/{expenseId}` y exigir `request.resource.data.periodKey == periodKey`.
- Rationale: garantiza integridad entre path y payload además de las reglas actuales de owner y validación de campos.
- Alternativa considerada: conservar match antiguo en paralelo. Se evita para no duplicar superficie de escritura.

## Risks / Trade-offs

- [Riesgo] Algunos documentos legacy podrían no tener `periodKey` consistente con el path esperado. → Mitigación: validar con script/consulta previa y corregir antes del despliegue final.
- [Riesgo] `getRecentPeriodsHistory` con múltiples lecturas por mes puede aumentar latencia en redes lentas. → Mitigación: limitar meses (ya existe), cachear en store y evaluar `collectionGroup` si aparece regresión.
- [Riesgo] Cambio en firma de `toggle` podría romper llamados indirectos. → Mitigación: actualizar `expenseStore` en el mismo change y cubrir con pruebas de integración básicas de flujo pending/paid.

## Migration Plan

1. Actualizar servicio de gastos y store para usar la ruta por período/items.
2. Actualizar reglas Firestore con el nuevo `match` y validaciones equivalentes.
3. Ejecutar pruebas locales de vistas Gastos, Historial y Dashboard para asegurar que lecturas/toggles/alta manual siguen operando.
4. Desplegar reglas.
5. Rollback: restaurar reglas previas y versión previa del cliente solo si fuera necesario; como la migración de datos ya existe, rollback de app se considera temporal y con riesgo controlado.