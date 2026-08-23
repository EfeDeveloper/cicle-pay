## 1. Componentes Visuales del Bento Grid

- [x] 1.1 [ui] Implementar `HeroSpendCard.vue` unificando el total gastado en el mes, tope del mes, barra de progreso con textura/bicolor de sobregiro, banderín indicador 🚩 y badge de porcentaje sobregirado. Verificar renderizado con y sin presupuesto definido.
- [x] 1.2 [ui] Actualizar `CategoryBudgetCard.vue` con la estética oscura refinada, iconos redondeados, barras de cupo y llamadas de alerta cuando se excede el cupo de categoría. Verificar visualmente en el panel lateral.
- [x] 1.3 [ui] Crear `PaymentCompletionCard.vue` mostrando el monto pagado, badge de porcentaje del mes y micro-gráfico de barras histórico SVG con datos de muestra. Verificar responsividad del SVG.
- [x] 1.4 [ui] Crear `SavingsGoalCard.vue` con ilustración de alcancía, monto proyectado, porcentaje de meta y botón interactivo con feedback amigable. Verificar renderizado del componente.
- [x] 1.5 [ui] Crear `PaymentStatusOverviewCard.vue` con Donut Chart SVG (pagado vs pendiente), desglose de pendientes (gastos fijos vs variables) y gráfico de área SVG de flujo de efectivo proyectado. Verificar cálculo reactivo de porcentajes del donut.
- [x] 1.6 [ui] Ajustar `UpcomingExpenseCard.vue` para alinear tonalidades de badges, iconos y estados de la lista "Próximos por pagar". Verificar que el toggle de estado y apertura de detalle sigan funcionando.

## 2. Integración y Orquestación del Dashboard

- [x] 2.1 [ui] Actualizar `DashboardView.vue` para ensamblar la cuadrícula bento grid responsiva (3 columnas en desktop, flujo vertical en mobile), vinculando stores reales y estados de carga con Skeleton. Verificar ejecución correcta con `pnpm build`.

## 3. Verificación de Calidad y Pruebas

- [x] 3.1 [qa] Validar la interfaz completa en resoluciones desktop y móvil, comprobando reactividad al marcar gastos como pagados, apertura del sheet de presupuesto y consistencia visual en Playwright.
