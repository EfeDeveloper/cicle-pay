## Context

Ver `proposal.md` (motivación) y `specs/monthly-budget/spec.md` (comportamiento). Dashboard ya agrega el mes actual (`getCurrentPeriodKey`) y pinta categorías con `buildCategorySpend` / `CategoryBudgetCard`, pero `allocated` siempre es `null`. No hay colección de presupuesto. `expenseStore` y `expenseService` solo hablan de instancias; `firestore.rules` cubre `templates` y `expenses` bajo `payment_cycles/{uid}`.

## Goals / Non-Goals

**Goals:**

- Tercer hijo de `payment_cycles/{uid}`: `budgets/{periodKey}`, sin tocar payloads de plantillas ni gastos.
- Lectura/escritura solo vía `src/services/budgetService.ts` y un Pinia store nuevo.
- Dashboard del mes visible: tope vs gastado comprometido; cupos opcionales en el panel existente.
- Sheet para alta/edición/borrado, reutilizando Sheet/Input/Label/Button.

**Non-Goals:**

- No meter presupuesto en `expenseStore` ni en `expenseService` (ya grandes y de otro agregado).
- No nueva ruta ni ítem de `APP_NAV_ITEMS`.
- No query de historial de presupuestos ni índice compuesto.
- No copiar cupos al iniciar el mes (`generateMonthlyExpenses` no cambia).

## Decisions

### 1. Documento por período, id = `periodKey`

Path: `payment_cycles/{uid}/budgets/{periodKey}`. `setDoc` idempotente (crear o reemplazar). Un presupuesto por mes, `getDoc` sin query.

Por qué: el ciclo del producto ya es `YYYY-MM`; el id coincide con gastos. Subcolección por categoría o auto-id obligarían query y podrían duplicar el mes.

Alternativa descartada: un solo doc `settings/budget` para todos los meses. Más simple de persistir, pero el tope no puede cambiar mes a mes sin pisar historia.

Forma:

```
userId, periodKey, totalAmount,
categories?: { [ExpenseCategory]: number },  // solo claves con cupo > 0
createdAt, updatedAt
```

Si no hay cupos, omitir `categories` (no mapa vacío). Reemplazo completo en cada save para que quitar un cupo borre la clave.

### 2. Store y servicio propios

Archivos nuevos: `src/types/budget.ts`, `src/services/budgetService.ts`, `src/stores/budgetStore.ts`.

API del servicio: `getBudget(periodKey)`, `saveBudget(input)`, `deleteBudget(periodKey)`. Prefill: si `getBudget(current)` es null, `getBudget(getPrevPeriodKey(current))` solo para el formulario; el save escribe el período actual.

Por qué no extender `expenseService`: viola la separación de agregados y el archivo ya pasa de 300 líneas. Por qué no un store único “cycle”: Dashboard puede llamar los dos stores en `onMounted` (`Promise.all`).

### 3. Gastado comprometido = todas las instancias del período

`spent = summary.totalAmount` (pending + paid). El tope compara contra lo que el mes ya debe, no solo lo pagado.

Por qué: CyclePay es un ciclo de pagos. Si solo se contara `paid`, el arriendo pendiente dejaría el mes “dentro de tope” hasta marcarlo.

Alternativa descartada: solo `paidAmount`. Mezclaría presupuesto con avance de pago, que ya tienen las otras `SummaryCard`.

Helper puro `src/lib/budgetProgress.ts`: `{ spent, cap, remaining, overspend, ratio }` para total y por categoría. `buildCategorySpend(expenses, caps?)` deja de hardcodear `allocated: null`.

### 4. UI en Dashboard, no en Gastos

- CTA «Definir presupuesto» / «Editar presupuesto» en el bloque de métricas (también con mes vacío).
- `BudgetFormSheet.vue`: total obligatorio; 10 inputs de cupo opcionales (vacío = sin cupo). Si suma de cupos > total, texto de aviso, submit habilitado.
- Borrar: `AlertDialog` de confirmación, luego `deleteDoc`.
- `CategoryBudgetCard` no cambia de contrato; el padre pasa `allocated`.
- Tope: progreso extra junto al total del mes (restante u «Te pasaste {overspend}»). Sin primitive UI nueva.

Por qué sheet y no ruta: el nav móvil ya tiene 4 destinos; el presupuesto se usa mirando el resumen.

### 5. Reglas Firestore

Nuevo `match /budgets/{periodKey}` junto a `templates` y `expenses`. Create/update: owner, `periodKey` = id del doc y formato `YYYY-MM`, `totalAmount > 0`, `categories` ausente o mapa cuyas claves ⊆ las 10 categorías y cada valor `number > 0`. Delete: owner. Sin `userId` de otro uid.

No abrir `payment_cycles/{userId}` (sigue `allow read, write: if false`).

## Estados UI

| Estado | Comportamiento |
|---|---|
| Loading (primer load) | Skeletons actuales del dashboard; no flash de «sin presupuesto» hasta terminar `fetchBudget` + `fetchExpenses`. |
| Vacío (0 gastos, sin presupuesto) | Empty de iniciar mes + CTA definir presupuesto. |
| Vacío (0 gastos, con presupuesto) | Empty de gastos + tope visible y CTA editar. |
| Sin presupuesto, con gastos | Totales y categorías como hoy + CTA definir. |
| Con presupuesto | Total vs tope; barras solo en categorías con cupo; exceso distinguido (progreso 100% + monto de más). |
| Error de carga/guardado | Toast (mismo patrón que stores actuales); el sheet permanece abierto si falla el save. |
| Confirmación | `AlertDialog` antes de borrar. Save: toast de éxito y cierre del sheet. |

## Files

- `firestore.rules`
- `src/types/budget.ts` (nuevo)
- `src/services/budgetService.ts` (nuevo)
- `src/stores/budgetStore.ts` (nuevo)
- `src/lib/budgetProgress.ts` (nuevo)
- `src/lib/categorySpend.ts`
- `src/components/dashboard/BudgetFormSheet.vue` (nuevo)
- `src/views/DashboardView.vue`
- `src/components/dashboard/CategoryBudgetCard.vue` (copy de cupo / exceso; props iguales)

Sin cambios de router, `expenseStore`, ni payloads de `MonthlyExpense` / `ExpenseTemplate`.

## Risks / Trade-offs

- [Dashboard solo carga el mes civil actual] → el presupuesto sigue ese período. Si más adelante el Dashboard navega meses, `fetchBudget` debe usar el mismo `periodKey` que los gastos.
- [Prefill solo del mes inmediatamente anterior] → si el usuario saltó un mes, el form sale vacío. Un scan de docs previos pediría índice; se acepta el `getDoc` único.
- [Suma de cupos > tope] → puede confundir. Mitigación: aviso en el sheet, no bloqueo (el tope manda).
- [Reglas de mapas] → validar claves con `hasOnly` sobre la lista fija de categorías; testear un write con categoría inventada.

## Migration Plan

Usuarios actuales no tienen `budgets`; el dashboard permanece usable. Desplegar reglas **antes** (o junto) al cliente que escribe. Rollback: revertir el change y las reglas; los docs `budgets` pueden quedarse huérfanos (no afectan gastos). No hay backfill.

## Open Questions

Ninguna que bloquee implementación. Copy exacto de «restante» vs «te pasaste» se define en el sheet/dashboard en apply.
