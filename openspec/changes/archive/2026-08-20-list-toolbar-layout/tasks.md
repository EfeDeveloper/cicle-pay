## 1. Layout [ui]

- [x] 1.1 [ui] En `DueDayCalendar.vue`, el trigger no debe ser `w-full` en desktop (`w-auto shrink-0`). Verificar: en una fila flex el botón no se estira al 100%.
- [x] 1.2 [ui] En `PendingView.vue`, meter search + `DueDayCalendar` + «Agregar gasto adicional» en una sola toolbar (`flex-col sm:flex-row`). Verificar: en `sm+` el calendario queda a la derecha del buscador, no en una fila propia.
- [x] 1.3 [ui] En `TemplatesView.vue`, misma toolbar cuando el Calendar está visible. Verificar: search, calendario y «Nueva plantilla» en una fila en desktop; sin plantillas, search + CTA y sin trigger.

## 2. Historial

- [x] 2.1 Quitar chevrons de mes en `HistoryView.vue` (`prevPeriod` / `nextPeriod` y botones). Verificar: no hay botones atrás/adelante; el mes sigue cambiando con el popover.
- [x] 2.2 Título de Historial a la izquierda: `periodLabel` si no hay día; fecha `es-MX` si hay `dueDay` numérico (fallback `Día n · {periodLabel}` si el mes no tiene ese día). Verificar: «Agosto 2026» vs «21 de agosto de 2026» según el filtro.
- [x] 2.3 Subir `ListSearchBar` a la toolbar de Historial (junto al Calendar), visible tras `ready` aunque el mes esté vacío. Verificar: mes vacío muestra buscador; no hay un segundo buscador más abajo.

## 3. Cierre [qa]

- [x] 3.1 `vue-tsc -b` sin errores de esta toolbar.
- [x] 3.2 [qa] Playwright: Gastos/Plantillas/Historial desktop (calendario a la derecha del search); Historial sin chevrons, título izquierdo, search en mes vacío; filtro y popover siguen funcionando.
