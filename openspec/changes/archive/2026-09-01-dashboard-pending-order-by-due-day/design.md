## Context

Ver proposal.md para la motivación. El estado actual carga `MonthlyExpense` por período y los ordena alfabéticamente por nombre antes de que el store derive pendientes/pagados. El dashboard consume `pendingExpenses` y muestra los primeros elementos, por lo que hereda ese orden alfabético. No hay un criterio explícito de prioridad cronológica por día de pago en la capa de consulta/derivación.

Restricciones activas:
- Sin cambios en esquema Firestore ni payloads.
- Sin dependencias nuevas.
- Mantener separación Template vs MonthlyExpense.

## Goals / Non-Goals

**Goals:**
- Definir un único comparador determinístico para `MonthlyExpense` orientado a prioridad de pago.
- Asegurar que el orden de pendientes sea por `dueDay` ascendente e independiente de la fecha actual.
- Mantener orden estable entre recargas para evitar saltos visuales.
- Reusar la misma regla en carga inicial y altas manuales para consistencia.

**Non-Goals:**
- No introducir reglas de negocio de atraso/vencimiento por fecha del sistema.
- No cambiar UX visual ni estructura de componentes.
- No alterar reglas de generación mensual, toggle de estado, autenticación o routing.

## Decisions

### 1) Orden cronológico centralizado en una sola función
- Decisión: crear un comparador reutilizable para `MonthlyExpense` y aplicarlo en los puntos donde hoy se usa orden alfabético.
- Rationale: evita divergencia entre carga inicial y mutaciones en cliente.
- Alternativas consideradas:
  - Ordenar solo en dashboard: menor impacto, pero produce diferencias de orden entre dashboard y listas de gastos.
  - Ordenar en cada vista: duplica lógica y aumenta riesgo de inconsistencias.

### 2) Regla de orden y desempates
- Decisión: ordenar primero por `dueDay` válido ascendente; luego por nombre (locale es); por último por id para estabilidad total.
- Rationale: prioriza "primero por pagar" y garantiza determinismo cuando hay empates.
- Alternativas consideradas:
  - Usar `createdAt` como desempate: en docs legacy puede faltar o tener precisión variable.
  - Usar monto como desempate: no representa prioridad temporal.

### 3) Tratamiento de `dueDay` nulo
- Decisión: ubicar `dueDay` nulo después de todos los días válidos.
- Rationale: un gasto sin día explícito no debe desplazar pagos calendarizados.
- Alternativas consideradas:
  - Tratar nulo como día 0: contradice expectativa natural del usuario.
  - Intercalar nulos por nombre: vuelve impredecible la prioridad temporal.

### 4) Alcance de aplicación
- Decisión: aplicar comparador en obtención mensual y en inserción manual dentro del período cargado; mantener dashboard consumiendo la lista derivada sin lógica extra.
- Rationale: cumple requerimientos de dashboard y mantiene coherencia del capability monthly-expenses.
- Alternativas consideradas:
  - Aplicar solo en getter de pendientes: resuelve dashboard, pero no garantiza consistencia en otras listas.

## Risks / Trade-offs

- [Cambio de orden visible en otras pantallas] -> Mitigación: reflejar explícitamente el alcance en specs de monthly-expenses y verificar vistas de Gastos/Historial en QA.
- [Empates por nombre similares] -> Mitigación: desempate final por id para estabilidad entre recargas.
- [Regresión sobre filtros por día/búsqueda] -> Mitigación: mantener filtros existentes como transformaciones sobre la colección ya ordenada, sin cambiar su contrato.

## Migration Plan

- No hay migración de datos ni cambios de backend.
- Despliegue directo como cambio de lógica de orden cliente.
- Rollback simple: revertir uso del comparador y volver al orden previo.

## Open Questions

- Ninguna bloqueante para implementación.
