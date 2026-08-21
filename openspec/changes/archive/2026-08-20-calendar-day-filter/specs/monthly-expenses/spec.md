## ADDED Requirements

### Requirement: Due-day calendar on expense lists

The system SHALL provide a descriptive button on the current-month expenses view and on the history view that opens a month calendar in a popover. The button SHALL remain available after the first load even if the loaded period has no expenses, so the user can move to another month. Each calendar day that has expenses with that `dueDay` in the loaded period SHALL be visually marked. Markers SHALL use distinct colors for pending-only, paid-only, and mixed days. The calendar SHALL use `dueDay`, never `paidAt`. Days with no matching `dueDay` SHALL remain unmarked and SHALL NOT be selectable. Expenses without `dueDay` SHALL NOT mark any day. Changing the visible month in the popover SHALL load that month's `periodKey` on both Gastos and Historial. Months after the current calendar month SHALL NOT be selectable.

#### Scenario: Pending item marks its due day

- **GIVEN** the current period has an expense named "Comida" with `dueDay` 21 and `status` pending
- **WHEN** the user opens the calendar popover on Gastos
- **THEN** day 21 is marked with the pending color
- **AND** days without expenses stay unmarked

#### Scenario: Paid and mixed days use different marks

- **GIVEN** day 10 has only paid expenses and day 12 has both pending and paid expenses
- **WHEN** the user views the calendar popover
- **THEN** day 10 uses the paid color
- **AND** day 12 shows both pending and paid marks

#### Scenario: Changing month loads that period

- **GIVEN** the user is on Gastos or Historial
- **WHEN** they move the popover calendar to a past month `YYYY-MM`
- **THEN** the view loads expenses with that `periodKey`
- **AND** only those expenses contribute marks

#### Scenario: Empty period keeps the trigger

- **GIVEN** the loaded period has no expenses
- **WHEN** the view finishes loading
- **THEN** the «Filtrar por día de pago» button is still shown
- **AND** the user can open the popover and change month

### Requirement: Calendar filters expenses by due day

Selecting a marked day SHALL filter the visible expense list to expenses whose `dueDay` equals that day. The trigger label SHALL reflect the filter («Día {n}» or «Sin día de pago» or «Filtrar por día de pago»). The day filter SHALL combine with the existing search query and status tabs (AND). Selecting the same day again, or choosing «Todos», SHALL remove the day filter. A «Sin día» control SHALL filter to expenses with no `dueDay`. Changing the loaded period SHALL clear the day filter.

#### Scenario: Click day 21 filters the list

- **GIVEN** expenses due on days 5, 21, and none
- **WHEN** the user selects day 21 in the popover
- **THEN** only expenses with `dueDay` 21 are listed
- **AND** search and status tabs still apply to that subset
- **AND** the trigger reads «Día 21»

#### Scenario: Clearing the day filter restores the list

- **GIVEN** day 21 is selected
- **WHEN** the user selects day 21 again or chooses «Todos»
- **THEN** the list is no longer filtered by due day
- **AND** the trigger reads «Filtrar por día de pago»

#### Scenario: Sin día lists expenses without dueDay

- **GIVEN** some expenses have no `dueDay`
- **WHEN** the user chooses «Sin día»
- **THEN** only those expenses are listed

### Requirement: Preview drawer has no visible read-only caption

The expense preview drawer SHALL NOT show the visible text «Vista de solo lectura». It SHALL still expose a screen-reader-only description.

#### Scenario: Opening an expense preview

- **GIVEN** the user opens the preview drawer for an expense
- **WHEN** the sheet is visible
- **THEN** «Vista de solo lectura» is not shown on screen
