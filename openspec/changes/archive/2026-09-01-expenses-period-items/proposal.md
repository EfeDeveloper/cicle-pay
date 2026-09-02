## Why

El proyecto ya usa períodos para presupuestos y el usuario migró sus datos de gastos a una estructura por período con subcolección `items`. Mantener el cliente y las reglas en el modelo plano actual provoca lecturas/escrituras inconsistentes y riesgo de errores funcionales en carga mensual, historial y actualización de estados.

## What Changes

- Alinear el modelo oficial de MonthlyExpense a la ruta `payment_cycles/{uid}/expenses/{periodKey}/items/{expenseId}`.
- Actualizar servicios de gastos para que todas las operaciones (listar por período, crear manual, generar desde plantillas, toggle de estado e historial reciente) operen sobre `items` del período.
- Actualizar reglas Firestore para autorizar/validar la nueva ruta anidada y mantener restricciones de owner + payload válido.
- Mantener el contrato funcional actual en UI (sin cambios de interacción), pero con acceso a datos basado en ruta por período.
- **BREAKING**: instancias de MonthlyExpense en la ruta plana `payment_cycles/{uid}/expenses/{expenseId}` dejan de ser la fuente primaria para el cliente actualizado.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `monthly-expenses`: cambiar el contrato de almacenamiento/consulta de instancias mensuales a subcolección por período (`expenses/{periodKey}/items`) preservando validaciones de dominio e idempotencia de instancias desde plantilla.

## Impact

- Dominio de datos: sí (cambio de ruta canónica de MonthlyExpense).
- UI: impacto indirecto solamente (mismos flujos visibles, nueva fuente de datos en backend).
- Código afectado: `src/services/expenseService.ts`, `src/stores/expenseStore.ts` (si requiere firma de acciones), `firestore.rules`, y pruebas asociadas.
- ExpenseTemplate vs MonthlyExpense: no cambia `templates/{templateId}`; sí cambia el path de MonthlyExpense y sus operaciones CRUD/consulta.
- Dependencias: ninguna nueva.

## Non-goals

- Rediseñar vistas de Dashboard, Gastos o Historial.
- Cambiar categorías, validaciones de monto, `status`, `source`, `templateId` o formato `periodKey`.
- Introducir analítica, nuevos índices de producto o cambios de navegación.