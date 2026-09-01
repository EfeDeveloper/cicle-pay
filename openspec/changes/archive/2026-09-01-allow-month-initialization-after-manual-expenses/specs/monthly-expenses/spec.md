## ADDED Requirements

### Requirement: Gastos keeps month initialization accessible once the period has expenses
The Gastos view SHALL keep the initialization action available after the first load when the current period already has at least one MonthlyExpense document. When the current period has no expenses, the view SHALL not show that top-level initialization action.

#### Scenario: Empty month hides the action
- **GIVEN** the current period has no MonthlyExpense documents
- **WHEN** the user opens Gastos
- **THEN** the top-level "Iniciar mes" action is not shown

#### Scenario: Any expense makes the action visible
- **GIVEN** the current period has at least one MonthlyExpense document
- **WHEN** the user opens Gastos
- **THEN** the top-level "Iniciar mes" action is visible

### Requirement: Gastos warns only when starting without templates
The Gastos view SHALL notify the user only when they attempt to start the month and no ExpenseTemplate documents exist. The view SHALL NOT show a permanent no-templates notice in the header or the empty state.

#### Scenario: Clicking Iniciar mes without templates shows a warning
- **GIVEN** the user has no ExpenseTemplate documents
- **WHEN** they click "Iniciar mes" from Gastos
- **THEN** the view shows a warning that there are no templates created
- **AND** the month is not started
