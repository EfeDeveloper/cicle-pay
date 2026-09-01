## MODIFIED Requirements

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
