## ADDED Requirements

### Requirement: Deterministic due-day ordering for monthly expense lists
For a loaded `periodKey`, the system SHALL expose monthly expenses in a deterministic order that prioritizes payment chronology by `dueDay` ascending and is independent from the current calendar date. Expenses with no `dueDay` SHALL be ordered after dated expenses. When multiple expenses have the same `dueDay`, the order SHALL be stable across refreshes by applying deterministic tie-breakers.

#### Scenario: Ordering does not shift with current date
- **GIVEN** the period has pending expenses due on days 1, 2, and 3
- **WHEN** the same period is loaded on day 1 and later loaded again on day 20
- **THEN** both loads keep due day 1 before 2 before 3

#### Scenario: Equal due day remains stable
- **GIVEN** the period has two pending expenses with `dueDay` 10
- **WHEN** the user reloads the period multiple times
- **THEN** both expenses keep a deterministic relative order across reloads

#### Scenario: Missing due day is deprioritized
- **GIVEN** the period has expenses with `dueDay` 4 and `dueDay` null
- **WHEN** the period data is listed
- **THEN** the expense with `dueDay` 4 appears before the expense with `dueDay` null
