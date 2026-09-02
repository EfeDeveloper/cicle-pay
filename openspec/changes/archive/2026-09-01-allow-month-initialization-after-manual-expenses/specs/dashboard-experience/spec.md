## ADDED Requirements

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
