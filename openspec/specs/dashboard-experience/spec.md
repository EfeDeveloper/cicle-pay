## Purpose

Proporciona una vista general consolidada y moderna (bento grid) del estado financiero mensual, integrando métricas de gasto, seguimiento de tope presupuestario, distribución por categoría y proyecciones de flujo de pagos sin añadir complejidad al backend.

## Requirements

### Requirement: Unified Hero Card for Monthly Spend and Budget Cap
The dashboard SHALL render a unified top hero card displaying the total committed monthly spend and comparing it against the period budget cap when a budget exists. When committed spend exceeds the budget cap, the visual progress bar SHALL display a distinct overspend indicator (bicolor / textured highlight with flag icon) and display the overspent amount and percentage.

#### Scenario: Committed spend exceeds monthly budget cap
- **GIVEN** a budget exists with total cap of 500,000 and total committed spend is 793,000
- **WHEN** the user views the dashboard
- **THEN** the hero card displays 793,000 as total gastado
- **AND** the progress bar visually highlights the overspent portion with alert tone and flag indicator
- **AND** a label specifies the overspent amount (293,000) and percentage overspend

#### Scenario: Committed spend is within monthly budget cap
- **GIVEN** a budget exists with total cap of 1,000,000 and total committed spend is 600,000
- **WHEN** the user views the dashboard
- **THEN** the progress bar displays green/standard progress
- **AND** a label indicates the remaining available balance (400,000)

### Requirement: Categorized Spending Card Styling
The dashboard SHALL render a dark-styled side panel summarizing total committed spend per category with count of expenses and active budget caps, emphasizing overspend when a category exceeds its allocation.

#### Scenario: Category exceeds allocated budget cap
- **GIVEN** category Alimentación has a budget cap of 400,000 and committed spend of 583,000
- **WHEN** the user views the category panel
- **THEN** the category item displays total spent 583,000, expense count, and cap 400,000
- **AND** an overspend badge indicates the overspent amount in alert tone

### Requirement: Visual Financial Health and Status Cards
The dashboard SHALL render a secondary bento row displaying:
1. Paid summary with current completion rate (%) and lightweight multi-month payment history trend.
2. A savings goal preview card with projected target savings and call to action.
3. An overall payment status card featuring a responsive Donut chart comparing paid vs pending amounts, pending breakdown (fixed vs variable), and projected cash flow trend curve.

#### Scenario: Paid vs Pending breakdown visualization
- **GIVEN** paid expenses total 750,000 and pending expenses total 43,000
- **WHEN** the user views the overall payment status card
- **THEN** the Donut chart reflects the proportional ratio of paid vs pending amounts
- **AND** the legend and count display exact amounts for paid and pending expenses

#### Scenario: Savings Goal placeholder interaction
- **GIVEN** the savings goal preview card is displayed
- **WHEN** the user clicks the "Establecer Meta" action
- **THEN** the interface triggers an informative preview feedback without mutating Firestore records

### Requirement: Upcoming Expenses List Presentation
The dashboard SHALL render pending expenses under the "Próximos por pagar" section with responsive item cards including checkbox toggle, category icon badge, expense title, optional note badge, amount, and pending status pill. The list SHALL prioritize payment order by `dueDay` ascending within the loaded period and SHALL NOT depend on the current calendar day. Expenses without `dueDay` SHALL appear after expenses with valid `dueDay`. When two expenses share the same `dueDay`, the order SHALL be deterministic across reloads.

#### Scenario: Dashboard prioritizes earliest due day after month initialization
- **GIVEN** the loaded period has pending expenses with due days 1, 2, and 3
- **WHEN** the user views "Próximos por pagar"
- **THEN** the visible order starts with due day 1, then 2, then 3
- **AND** the order is the same even if today is later in the month

#### Scenario: Undated pending expenses are listed last
- **GIVEN** the loaded period has pending expenses with due days 2 and 5, and one expense with no `dueDay`
- **WHEN** the user views "Próximos por pagar"
- **THEN** expenses with valid `dueDay` appear first in ascending due day order
- **AND** the expense without `dueDay` appears after them

#### Scenario: Toggling expense status from dashboard
- **GIVEN** a pending expense is listed under "Próximos por pagar"
- **WHEN** the user checks the checkbox
- **THEN** the expense status transitions to paid and all connected dashboard metrics update reactively

### Requirement: Month initialization CTA is hidden on an empty dashboard
The dashboard SHALL show the top-level "Iniciar mes" action only when the current period already has at least one MonthlyExpense. When the current period has no expenses, the dashboard SHALL show only the empty-state card for that month and SHALL NOT show the top-level initialization action.

#### Scenario: Empty month hides the top CTA
- **GIVEN** the current period has no MonthlyExpense documents
- **WHEN** the user opens the dashboard
- **THEN** the dashboard shows the empty-state card for the month
- **AND** the top-level "Iniciar mes" action is not shown

#### Scenario: Any expense makes the top CTA visible
- **GIVEN** the current period has at least one MonthlyExpense document
- **WHEN** the user opens the dashboard
- **THEN** the dashboard shows the top-level "Iniciar mes" action

### Requirement: Dashboard warns only when starting without templates
The dashboard SHALL notify the user only when they attempt to start the month and no ExpenseTemplate documents exist. The dashboard SHALL NOT show a permanent no-templates notice in the header or empty state.

#### Scenario: Clicking Iniciar mes without templates shows a warning
- **GIVEN** the user has no ExpenseTemplate documents
- **WHEN** they click "Iniciar mes" from the dashboard
- **THEN** the dashboard shows a warning that there are no templates created
- **AND** the dashboard does not start the month
