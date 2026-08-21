## Context

Ver `proposal.md`. Gastos y Plantillas ya tienen `ListSearchBar` + CTA en una fila y `DueDayCalendar` en la fila de abajo (`w-full sm:w-auto`). Historial ya importa `ListSearchBar`, pero solo lo renderiza si `store.expenses.length > 0` (tras el resumen), y el mes se cambia con chevrons (`prevPeriod` / `nextPeriod`) además del Calendar.

## Goals / Non-Goals

**Goals:**

- Una sola toolbar por vista: buscador (flex-1) + trigger del Calendar (`shrink-0`) + CTA si aplica.
- Historial: título informativo a la izquierda; mes solo vía popover; búsqueda siempre tras el primer load.

**Non-Goals:**

- No tocar Pinia, Firestore ni la lógica de `dueDayCalendar.ts`.
- No extraer un layout wrapper salvo que las tres vistas queden idénticas; preferir el mismo patrón de clases en cada vista.

## Decisions

### 1. Toolbar en la vista, no un layout nuevo

Mover `DueDayCalendar` al mismo `flex` que `ListSearchBar` en `PendingView.vue`, `HistoryView.vue` y `TemplatesView.vue`.

Por qué: las tres filas ya existen; un wrapper nuevo no aporta y Plantillas oculta el Calendar si no hay plantillas.

Alternativa: componente `ListToolbar`. Se descarta: tres variantes (con/sin CTA, Calendar condicional) y poco reuso extra.

Desktop (`sm+`): `[search flex-1] [calendar] [CTA]`. Móvil: columna (search → calendar → CTA). El trigger deja de usar `w-full` para no estirarse en la fila (`w-auto shrink-0`).

### 2. Historial: reutilizar `ListSearchBar`, no crear otro

Sacar el buscador del bloque `expenses.length > 0` y ponerlo en la toolbar junto al Calendar. El filtro por nombre/categoría sigue igual (`searchQuery` + lista ya filtrada).

Por qué: el componente y el binding ya existen; el hueco es de visibilidad/colocación, no de capacidad.

### 3. Título de Historial sin chevrons

Quitar los `Button` con `ChevronLeft` / `ChevronRight`. `h2` `text-left`. Texto:

- Filtro `all` o `none`: `periodLabel` (p. ej. «Agosto 2026»).
- Filtro día `n`: `Intl` `es-MX` con `periodKey` + `n` (p. ej. «21 de agosto de 2026»). Si el mes no tiene ese día civil, mostrar `Día n · {periodLabel}` para no inventar una fecha inválida.

`setPeriod` desde `@update:period-key` no cambia. `prevPeriod` / `nextPeriod` dejan de usarse en esta vista (`usePeriod` puede conservar las funciones para otras pantallas).

Por qué Calendar ya carga `periodKey`; las flechas son redundantes. Un `<input type="month">` extra se descarta: duplicaría el popover.

## Estados UI

| Estado | Comportamiento |
|---|---|
| Loading (primer load) | Skeleton de resumen/lista como hoy; toolbar de Historial/Gastos aparece cuando `ready` (Calendar ya espera `ready`). |
| Vacío (Historial, 0 gastos) | Toolbar (search + calendar) + empty state; sin chevrons. |
| Vacío (Plantillas, 0) | Search + CTA; sin Calendar (regla actual). |
| Error | Sin cambio: mismos avisos de store. |
| Confirmación | N/A (no hay mutación nueva). |

## Files

- `src/views/PendingView.vue`
- `src/views/HistoryView.vue`
- `src/views/TemplatesView.vue`
- `src/components/lists/DueDayCalendar.vue` (clases del trigger)

## Risks / Trade-offs

- [Tres controles en una fila en `sm`] → el buscador encoge (`min-w-0 flex-1`); el trigger y el CTA no wrappean. Si en `sm` queda apretado, el wrap natural de `flex-wrap` es aceptable; no bajar el breakpoint.
- [Usuario de Historial que solo usaba flechas] → el popover ya navega mes/año; el título deja claro el período.

## Migration Plan

Cambio de layout local. Rollback: revertir las tres vistas y las clases del trigger.

## Open Questions

Ninguna que bloquee implementación. Plantillas entra en el mismo patrón por consistencia (no estaba en el pantallazo).
