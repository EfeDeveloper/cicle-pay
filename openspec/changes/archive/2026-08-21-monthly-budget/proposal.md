## Why

CyclePay ya muestra cuánto hay que pagar en el mes y cómo se reparte por categoría, pero no hay un tope contra el cual comparar. El panel `CategoryBudgetCard` deja `allocated` en `null`. Sin presupuesto, el usuario no sabe si el ciclo le alcanza ni qué categoría lo está comiendo.

## What Changes

- Nuevo documento de presupuesto por `periodKey` (`YYYY-MM`), separado de plantillas e instancias.
- Tope total del mes obligatorio al guardar. Cupos por categoría opcionales (solo las que el usuario quiera vigilar).
- Dashboard: gastado del mes (suma de instancias del período, pending + paid) vs tope; barras de categoría usan `allocated` cuando hay cupo.
- Sheet para crear, editar o quitar el presupuesto del período visible. Si el mes no tiene presupuesto, el formulario puede prefijar valores del período anterior más reciente.
- Exceder el tope o un cupo es advertencia visual. No bloquea crear, editar ni pagar gastos.
- La suma de cupos no tiene que igualar el tope; si la supera, aviso suave (no error).

Toca **UI y datos de dominio**. No cambia la forma de `ExpenseTemplate` ni de `MonthlyExpense`.

## Capabilities

### New Capabilities

- `monthly-budget`: presupuesto mensual por período (tope total + cupos opcionales), persistencia, reglas y comparación en Dashboard.

### Modified Capabilities

- (ninguna)

## Impact

- Firestore: `payment_cycles/{uid}/budgets/{periodKey}` + reglas nuevas. Colecciones `templates` y `expenses` intactas.
- Servicio y store nuevos (`budgetService`, `budgetStore`); las vistas no hablan con Firestore.
- Dashboard: `SummaryCard` / progreso vs tope; `CategoryBudgetCard` y `buildCategorySpend` leen `allocated`.
- Sheet de presupuesto (reusa Sheet/Input de shadcn-vue). Sin ruta ni ítem de nav nuevos.
- Sin dependencias npm nuevas.

## Non-goals

- No es ingreso/salario ni holgura tipo “disponible − gastos”.
- No es YNAB: no se exige suma de cupos = tope ni hay rollover al mes siguiente.
- No se mezclan montos de presupuesto en plantillas ni en instancias.
- No se bloquean escrituras de gastos al exceder.
- No hay presupuestos en Gastos, Historial ni Plantillas.
- No hay gráficos extra ni pantalla de ajustes.
