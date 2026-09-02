## Why

Hoy el estado del mes se infiere demasiado pronto: al crear un gasto manual desde Gastos, el dashboard deja de mostrar la acción de iniciar el mes aunque todavía no existan instancias generadas desde plantillas. Eso bloquea un flujo válido y deja al usuario sin una forma obvia de materializar sus gastos recurrentes del período.

## What Changes

- Ocultar la acción superior de inicializar el mes cuando el período no tenga gastos todavía.
- Mostrar la acción superior de inicializar el mes cuando ya exista al menos un gasto del período, incluso si es adicional/manual.
- Mostrar un toast o alert solo al intentar iniciar el mes cuando no existan plantillas creadas.
- Conservar la separación entre ExpenseTemplate y MonthlyExpense: las plantillas siguen siendo la fuente para generar gastos mensuales idempotentes.

## Non-goals

- No cambiar el modelo de datos Firestore ni las colecciones existentes.
- No alterar el payload de ExpenseTemplate ni de MonthlyExpense.
- No impedir la creación de gastos manuales mientras el mes esté sin inicializar.
- No introducir nuevas dependencias ni una nueva fuente de verdad para el período.

## Capabilities

### Modified Capabilities
- `dashboard-experience`: ajustar el estado y la visibilidad de la acción de “Iniciar mes” para que dependa de la existencia de al menos un gasto del período y no aparezca en el estado vacío.
- `monthly-expenses`: mantener una acción de inicialización accesible en la vista de Gastos cuando ya exista al menos un gasto del período, y mostrar una notificación solo cuando el usuario intenta iniciar el mes sin plantillas creadas.

## Impact

Touchpoints de UI en Dashboard y Gastos/Pendientes, más la lógica derivada que distingue gastos manuales de instancias de plantilla. No se esperan cambios en rutas, colecciones ni en la forma en que se guardan ExpenseTemplate o MonthlyExpense.
