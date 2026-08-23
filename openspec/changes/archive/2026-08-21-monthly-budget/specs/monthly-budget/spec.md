## Purpose

Lets the signed-in owner set a monthly spending cap for a period, with optional per-category caps, and compare committed expenses against those caps on the dashboard without mixing budget data into templates or monthly instances.

## ADDED Requirements

### Requirement: Budgets are period-scoped and distinct from expenses

The system SHALL store each budget at `payment_cycles/{uid}/budgets/{periodKey}` with a `periodKey` of `YYYY-MM` that matches the document id. A budget document SHALL include `totalAmount`, optional category caps, `userId`, and timestamps. It SHALL NOT include expense `status`, `source`, `templateId`, `paidAt`, `dueDay`, or `name`. Expense templates and monthly instances SHALL NOT store budget amounts.

#### Scenario: Budget path uses period key as id

- **GIVEN** a signed-in user and period `2026-08`
- **WHEN** they save a budget for that period
- **THEN** the document lives at `payment_cycles/{uid}/budgets/2026-08`
- **AND** its `periodKey` is `2026-08`

#### Scenario: Templates and expenses stay free of budget fields

- **GIVEN** a template and a monthly expense for the same user
- **WHEN** a budget is saved for the period
- **THEN** those template and expense documents are unchanged

### Requirement: Owner-only valid writes

The system SHALL allow create, read, update, and delete of budgets only for the signed-in owner (`userId` matches auth uid). Unauthenticated access SHALL be denied. Writes from another user SHALL be denied.

#### Scenario: Owner can manage own budget

- **GIVEN** a signed-in user
- **WHEN** they read or write a budget under their `payment_cycles/{uid}/budgets` path
- **THEN** the operation succeeds if the payload is valid

#### Scenario: Other users cannot access budgets

- **GIVEN** a budget owned by user A
- **WHEN** user B attempts to read or write it
- **THEN** the operation is denied

### Requirement: Total cap is required and category caps are optional

When saving a budget, the system SHALL require `totalAmount` to be a number greater than 0. Category caps SHALL be optional. Each present category key MUST be one of: Vivienda, Servicios, Alimentación, Transporte, Salud, Educación, Entretenimiento, Seguros, Suscripciones, Otros. Each present cap MUST be a number greater than 0. Categories without a cap SHALL be omitted from the document, not stored as 0 or null.

#### Scenario: Save with total only

- **GIVEN** a signed-in user on period `2026-08`
- **WHEN** they save a budget with `totalAmount` 4000000 and no category caps
- **THEN** the document is stored with that total
- **AND** it has no category cap fields

#### Scenario: Save with some category caps

- **GIVEN** a signed-in user
- **WHEN** they save a budget with `totalAmount` 4000000 and a cap of 700000 for Alimentación
- **THEN** the document includes that Alimentación cap
- **AND** other categories are not present on the document

#### Scenario: Invalid total is rejected

- **WHEN** a client writes a budget with `totalAmount` <= 0
- **THEN** the write is denied

#### Scenario: Unknown category key is rejected

- **WHEN** a client writes a budget with a cap keyed by a name that is not a product category
- **THEN** the write is denied

### Requirement: Category cap sum is not a second ceiling

The system SHALL persist a budget when the sum of category caps differs from `totalAmount`, including when that sum is greater than `totalAmount`. The total cap remains the only period-level ceiling.

#### Scenario: Caps that exceed the total still save

- **GIVEN** `totalAmount` 1000000
- **WHEN** the user saves category caps that sum to 1500000
- **THEN** the budget is stored
- **AND** `totalAmount` stays 1000000

### Requirement: Dashboard compares committed spend to the period budget

Committed spend for a period SHALL be the sum of all monthly expense amounts in that period, including both `pending` and `paid`. When a budget exists for the dashboard period, the dashboard SHALL show committed spend versus `totalAmount` (remaining or overspend). For each category that has a cap, the dashboard SHALL show that category's committed spend versus the cap. Categories without a cap SHALL show committed spend without a cap comparison. When no budget exists, the dashboard SHALL still show expense totals and category spend, and SHALL offer a way to set a budget.

#### Scenario: Spend versus total cap

- **GIVEN** a budget with `totalAmount` 1000000 and expenses in the period totaling 800000
- **WHEN** the user views the dashboard for that period
- **THEN** committed spend is shown as 800000 against 1000000

#### Scenario: Category with a cap shows progress

- **GIVEN** a budget with an Alimentación cap of 700000 and Alimentación expenses totaling 500000
- **WHEN** the user views the dashboard category panel
- **THEN** Alimentación shows 500000 against 700000

#### Scenario: Category without a cap has no cap bar

- **GIVEN** a budget with no Transporte cap and Transporte expenses totaling 200000
- **WHEN** the user views the dashboard category panel
- **THEN** Transporte shows 200000 spent
- **AND** it does not show a cap comparison

#### Scenario: No budget keeps the set-budget action

- **GIVEN** the dashboard period has expenses and no budget document
- **WHEN** the user views the dashboard
- **THEN** expense totals and category spend are shown
- **AND** an action to set a budget is available

### Requirement: Exceeding a cap does not block expense writes

When committed spend exceeds `totalAmount` or a category cap, the system SHALL still accept create, update, status changes, and delete of monthly expenses and of templates. Overspend SHALL be indicated visually on the dashboard.

#### Scenario: Over total still allows a new expense

- **GIVEN** committed spend already exceeds `totalAmount`
- **WHEN** the user adds a manual expense in that period
- **THEN** the expense is stored
- **AND** the dashboard shows the period as over the total cap

#### Scenario: Over category cap still allows toggle to paid

- **GIVEN** Alimentación committed spend exceeds its cap
- **WHEN** the user marks an Alimentación expense as paid
- **THEN** the status update succeeds

### Requirement: User can create, replace, and delete the period budget

The signed-in owner SHALL be able to create or replace the budget for the dashboard period, and to delete it. Deleting SHALL return that period to the no-budget state. Saving SHALL write only the current period's document.

#### Scenario: Replacing a budget updates the same period

- **GIVEN** a budget already exists for `2026-08`
- **WHEN** the user saves a new total and caps for `2026-08`
- **THEN** that period still has exactly one budget document
- **AND** it reflects the new values

#### Scenario: Deleting restores no-budget state

- **GIVEN** a budget exists for the dashboard period
- **WHEN** the user deletes it
- **THEN** the dashboard no longer compares spend to a cap
- **AND** the set-budget action is available again

### Requirement: Budget form prefills from the previous month when empty

When the user opens the budget form for a period that has no budget, and the immediately previous calendar month has a budget, the form SHALL prefill with that previous total and category caps. Confirming save SHALL write a document for the current period only and SHALL NOT mutate the previous period. When the previous month has no budget, the form SHALL start without prefilled amounts.

#### Scenario: Prefill from previous month

- **GIVEN** period `2026-08` has no budget and `2026-07` has `totalAmount` 4000000 and an Alimentación cap
- **WHEN** the user opens the budget form for `2026-08`
- **THEN** the form shows 4000000 and the Alimentación cap
- **AND** saving stores them on `2026-08` only

#### Scenario: No previous budget leaves the form empty

- **GIVEN** period `2026-08` has no budget and `2026-07` has none
- **WHEN** the user opens the budget form for `2026-08`
- **THEN** total and category cap fields start empty
