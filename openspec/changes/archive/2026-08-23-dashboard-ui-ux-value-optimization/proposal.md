## Why

El dashboard actual de CyclePay presenta la información financiera de forma funcional pero fragmentada en listas y tarjetas individuales. Alinear la interfaz al diseño bento-grid moderno propuesto mejora drásticamente la jerarquía visual, la comprensión del estado financiero del mes (tope, sobregiro, categorías) y prepara la experiencia para futuras funcionalidades de ahorro y analítica sin romper la lógica existente.

## What Changes

- **Touch Surface**: Este cambio toca **exclusivamente la UI/UX** (vistas y componentes SFC de Vue). No altera modelos de dominio ni contratos de Firebase.
- **Hero Card unificado**: Fusión de resumen de gasto mensual y barra de tope presupuestario con indicador visual de sobregiro (barra bicolor/texturizada y banderín).
- **Panel de Categorías estilizado**: Ajuste visual del panel oscuro lateral (`Por categoría`) con badges de alerta y distribución armónica.
- **Métricas visuales (Híbridas / Demo)**:
  - Tarjeta de **Pagos Completados** con porcentaje y gráfico de barras histórico mensual (renderizado ligero SVG/CSS con datos demo).
  - Tarjeta de **Metas de Ahorro** con ilustración y proyección de muestra (mockup visual).
  - Tarjeta de **Estado General de Pagos** con Donut Chart reactivo (pagado vs pendiente), desglose de fijos/variables y gráfico de área de flujo de efectivo proyectado (curva simulada).
- **Lista Próximos por pagar**: Pulido visual de las tarjetas de pendientes con tonalidades suaves y badges de estado.

## Non-goals

- No se crearán colecciones ni escrituras en Firestore para metas de ahorro (`savings_goals`).
- No se altera la estructura ni separación estricta entre `ExpenseTemplate` y `MonthlyExpense`.
- No se agregan librerías externas de visualización de datos (D3, Chart.js, etc.); se utilizan primitivas SVG nativas en componentes Vue.
- No se modifican rutas, stores de Pinia ni servicios de backend.

## Capabilities

### New Capabilities
- `dashboard-experience`: Especifica la distribución bento-grid del panel principal, visualización unificada de gasto/presupuesto, gráficos ligeros de estado y tarjetas de proyección financiera.

### Modified Capabilities
<!-- Ninguna regla de negocio existente en monthly-budget o monthly-expenses cambia su contrato -->

## Impact

- **Archivos afectados**: `src/views/DashboardView.vue`, `src/components/dashboard/*`, `src/components/expenses/UpcomingExpenseCard.vue`.
- **Dependencias**: Ninguna nueva dependencia requerida.
- **Templates vs Monthly Instances**: Sin impacto en la lógica de generación ni sincronización de plantillas e instancias mensuales.
