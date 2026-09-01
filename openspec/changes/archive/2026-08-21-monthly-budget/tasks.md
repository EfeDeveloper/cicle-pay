## 1. Dominio

- [x] 1.1 Crear `src/types/budget.ts` con `MonthlyBudget` (`id`/`periodKey`, `userId`, `totalAmount`, `categories?`, timestamps) y el input de save (total + mapa parcial de cupos). Verificar: el tipo no incluye `status`, `source`, `templateId` ni campos de `MonthlyExpense`.
- [x] 1.2 Crear `src/lib/budgetProgress.ts` (`spent`, `cap`, `remaining`, `overspend`, `ratio` 0–100). Verificar: spent 80 / cap 100 → remaining 20, overspend 0, ratio 80; spent 120 / cap 100 → remaining 0, overspend 20, ratio 100.
- [x] 1.3 Extender `buildCategorySpend(expenses, caps?)` para rellenar `allocated` solo si la categoría está en `caps`. Verificar: sin caps todas las filas tienen `allocated: null`; con `{ Alimentación: 700 }` solo esa fila tiene 700.

## 2. Persistencia

- [x] 2.1 Añadir `match /budgets/{periodKey}` en `firestore.rules` (owner, `periodKey` = id `YYYY-MM`, `totalAmount > 0`, `categories` omitido o claves ⊆ categorías del producto y valores `> 0`). Verificar: `payment_cycles/{userId}` sigue denegado; `templates`/`expenses` no cambian de forma.
- [x] 2.2 Crear `src/services/budgetService.ts`: `getBudget`, `saveBudget` (`setDoc` id = `periodKey`, omitir `categories` si no hay cupos), `deleteBudget`. Verificar: las vistas no importan Firestore; un save no escribe `templates` ni `expenses`.
- [x] 2.3 Crear `src/stores/budgetStore.ts` (fetch/save/delete, toasts, loading). Prefill: si el período actual no tiene doc, `getBudget(prevPeriod)` solo para el form. Verificar: save escribe el `periodKey` actual y no muta el mes anterior.

## 3. UI [ui]

- [x] 3.1 [ui] Crear `BudgetFormSheet.vue`: total obligatorio `> 0`; 10 cupos opcionales (vacío = sin cupo); aviso si la suma de cupos > total (submit igual habilitado); reusa Sheet/Input/Label/Button. Verificar: se puede guardar solo el total; un cupo vacío no viaja como 0.
- [x] 3.2 [ui] En `DashboardView.vue`, CTA «Definir presupuesto» / «Editar presupuesto» (también con mes vacío); `Promise.all` de gastos + presupuesto; tope vs gastado comprometido (restante o «Te pasaste»); pasar `allocated` al panel. Verificar: sin presupuesto no hay barras de cupo y el CTA de definir sigue visible.
- [x] 3.3 [ui] En `CategoryBudgetCard.vue`, mostrar cupo y exceso de categoría cuando `allocated` no es null; sin cupo, igual que hoy (gastado + conteo, sin `Progress`). Verificar: Transporte sin cupo no pinta barra; Alimentación con cupo sí.
- [x] 3.4 [ui] Confirmación de borrado con `AlertDialog` existente; al confirmar, el mes vuelve a estado sin presupuesto. Verificar: tras borrar, el Dashboard deja de comparar contra tope y reaparece «Definir presupuesto».

## 4. Cierre [qa]

- [x] 4.1 Confirmar que `expenseService` / `expenseStore` no consultan presupuesto al crear, editar o marcar pagado. Verificar: grep sin imports de budget en esos archivos; un gasto extra se guarda con el mes ya pasado de tope.
- [x] 4.2 `vue-tsc -b` sin errores de este change. Verificar: el comando termina exitoso.
- [x] 4.3 [qa] Playwright CLI: Dashboard sin presupuesto (CTA definir); guardar solo total; editar con cupo de una categoría; prefill si el mes previo tiene presupuesto; exceso visual sin bloquear marcar pagado; borrar presupuesto. Un reporte por pasada.
