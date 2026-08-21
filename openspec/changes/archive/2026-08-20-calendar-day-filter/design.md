## Context

See proposal.md. El grid 1–31 inline (`Card` full-width) ya está en las tres listas y no pagina meses. Popover y Button existen. Falta el primitivo `Calendar` de shadcn-vue.

## Goals / Non-Goals

**Goals:**

- Trigger compacto + popover con Calendar (mes real, locale `es-MX`).
- Mes del popover = `periodKey` en Gastos e Historial; en Plantillas solo marco visual.
- Reusar `buildDueDayMarks` / `filterByDueDay`.

**Non-Goals:**

- No store/router/Firebase nuevos.
- No date picker de alta de gastos.

## Decisions

### 1. shadcn Calendar + Popover, no grid custom

El usuario pidió un calendario emergente con navegación de mes. El grid 1–31 no cubre eso.

**Chosen:** `pnpm dlx shadcn-vue@latest add calendar` y `@internationalized/date` (lo exige el Calendar). Popover existente.

**Rejected:** heatmap 1–31 compacto (sigue sin meses reales). Date picker nativo (sin marcas ni locale).

### 2. Trigger descriptivo

`Button` `variant="outline"`, icono `CalendarDays`, `min-h-11`:

| Filtro | Copy |
| --- | --- |
| `null` | Filtrar por día de pago |
| `number` | Día {n} |
| `'none'` | Sin día de pago |

`aria-expanded` / `aria-haspopup="dialog"`.

### 3. Contratos

Helpers sin cambio (ver `src/lib/dueDayCalendar.ts`).

`DueDayCalendar.vue`:

- **In:** `marks`, `mode`, `hasUndated`, `periodKey?: string` (YYYY-MM; omitir en plantillas), `allowPeriodChange?: boolean`
- **Out:** `update:modelValue`, `update:periodKey` (solo si `allowPeriodChange`)
- Placeholder del Calendar = mes de `periodKey` o mes civil actual (plantillas).
- Día marcado → `dueDay` filter. Día sin marca: no seleccionable.
- Mes siguiente al actual: deshabilitado si `allowPeriodChange`.
- Footer del popover: «Todos», «Sin día» (si `hasUndated`).
- Cerrar popover al elegir día o Sin día / Todos.

Marcas: celdas con `badge-pending` / `badge-paid` / ambos puntos / `bg-brand-soft` (presence).

### 4. Periodo en Gastos

`PendingView` usa `usePeriod` + `watch` → `fetchExpenses`, igual que Historial. «Agregar gasto adicional» usa el `periodKey` cargado (prop al sheet). Historial: el Calendar sincroniza con los chevrons existentes.

Plantillas: `allowPeriodChange=false`; cambiar mes no emite período; los marks siguen mapeando `dueDay` sobre el mes visible.

### 5. Files

| File | Change |
| --- | --- |
| `src/components/ui/calendar/*` | Añadir via shadcn CLI |
| `src/components/lists/DueDayCalendar.vue` | Button + Popover + Calendar |
| `src/views/PendingView.vue` | `usePeriod`; trigger siempre montado tras load |
| `src/views/HistoryView.vue` | sync mes; trigger aunque el mes esté vacío |
| `src/views/TemplatesView.vue` | mismo trigger; mes visual |
| `src/components/expenses/ManualExpenseFormSheet.vue` | `periodKey` desde el padre si se pasa |
| `src/lib/dueDayCalendar.ts` | sin cambio de contrato |
| `RecordDetailSheet.vue` | ya hecho (sr-only) |

### 6. UI states

| State | Behavior |
| --- | --- |
| Loading | Trigger visible, disabled hasta el primer fetch. |
| Empty month | Trigger visible. Popover muestra el mes; días sin marca. Empty de lista actual. |
| Empty after day filter | Trigger con copy del día; lista «Sin coincidencias». |
| Error | Toast de store existente. |
| Confirmation | Ninguna. |

## Risks / Trade-offs

- [Gastos edita meses pasados] → Misma mutación que ya permite el store; no se puede ir al futuro.
- [Plantillas + weekday] → El 21 cae en distinto weekday según el mes; el filtro es el número de día. Mitigation: copy «día de pago», no «fecha».
- [@internationalized/date] → Dep acotada al Calendar; rollback = quitar el add de shadcn.

## Migration Plan

UI only. Rollback: revert vistas + `DueDayCalendar` + quitar `src/components/ui/calendar` y la dep si no se usa.

## Open Questions

None.
