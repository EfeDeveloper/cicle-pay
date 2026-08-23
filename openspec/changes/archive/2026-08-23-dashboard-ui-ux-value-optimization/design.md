## Context

See `proposal.md` for motivation. CyclePay uses Vue 3 + Tailwind CSS 4 + shadcn-vue primitives. The existing `DashboardView.vue` consumes `useExpenseStore()` and `useBudgetStore()`. The design must organize all elements into a responsive bento-grid matching the target visual layout without altering Pinia stores, router, or backend schemas.

## Goals / Non-Goals

**Goals:**
- Implement a modern bento-grid layout for the dashboard.
- Unify monthly spend and budget cap into a hero card with custom overspend indicators.
- Create lightweight, zero-dependency SVG micro-charts for payment history (bars), overall status (donut), and cash flow projection (area chart).
- Provide placeholder/demo components for savings goals and payment breakdown.
- Ensure seamless responsiveness across mobile and desktop.

**Non-Goals:**
- Creating new Firestore collections or backend endpoints.
- Introducing third-party heavy charting libraries (Chart.js, Recharts, D3).
- Modifying expense CRUD, template generation, or budget persistence workflows.

## Decisions

### 1. Zero-dependency reactive SVG charts vs External Charting Libraries
- **Decision**: Build charts as native Vue SFC components using SVG `<circle>`, `<rect>`, and `<path>` primitives with Tailwind utility styling.
- **Rationale**: Keeps bundle size minimal, ensures instant SSR/hydration, and allows 100% customizable styling matching the mockup precisely.
- **Alternatives considered**: Lucide / ApexCharts / Chart.js (rejected due to bundle size and rule against unjustified dependencies).

### 2. Component Decomposition and File Structure
- **Concrete files created / modified**:
  - `src/views/DashboardView.vue`: Master container coordinating grid layout and store reactivity.
  - `src/components/dashboard/HeroSpendCard.vue`: Replaces separate `SummaryCard` and `BudgetCapBanner` with the unified spend + overspend progress bar.
  - `src/components/dashboard/CategoryBudgetCard.vue`: Refined styling for the dark category side card.
  - `src/components/dashboard/PaymentCompletionCard.vue`: Paid total, % badge, and SVG bar chart.
  - `src/components/dashboard/SavingsGoalCard.vue`: Piggy bank card with target goal and informative interaction.
  - `src/components/dashboard/PaymentStatusOverviewCard.vue`: SVG Donut chart, fixed vs variable breakdown, and projected cash flow SVG area chart.
  - `src/components/expenses/UpcomingExpenseCard.vue`: Polished pending item card styling.

### 3. Mapping Fixed vs Variable Expenses
- **Decision**: Compute "Gastos Fijos" using expenses sourced from templates (`templateId != null`) and "Gastos Variables" from manual expenses (`source === 'manual'` or `templateId == null`).
- **Rationale**: Leverages existing domain data naturally while matching the mockup's visual intent without schema modifications.

### 4. UI States
- **Loading State**: Responsive Skeleton grid matching the bento layout.
- **Empty State**: Friendly "Sin gastos este mes" empty state with "Iniciar mes" and "Definir presupuesto" triggers.
- **Normal State**: Clean green accents for paid expenses and budget compliance.
- **Overspend State**: Striped salmon/coral bar texture, 🚩 marker, and explicit percentage overspend callout.
- **Feedback & Confirmation**: Preserves existing `AlertDialog` for budget removal and `RecordDetailSheet` for expense inspection.

## Risks / Trade-offs

- **[Risk] High DPI / Small viewport responsiveness on charts** → *Mitigation*: Use SVG `viewBox` and `preserveAspectRatio="none"` or `vector-effect="non-scaling-stroke"` so charts scale smoothly across screen sizes.
- **[Risk] Confusion over mock data (Metas de ahorro)** → *Mitigation*: Clearly indicate projected / preview status on the card and provide a friendly feedback toast/dialog if clicked.
