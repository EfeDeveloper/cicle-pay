## ADDED Requirements

### Requirement: Search and calendar share a desktop toolbar on expense lists

On Gastos and Historial, after the first load, the due-day calendar trigger SHALL sit on the same row as the search field from the `sm` breakpoint upward, to the right of the search field. On viewports below `sm`, search and the calendar trigger MAY stack. On Gastos, the «Agregar gasto adicional» action SHALL remain on that toolbar row (desktop: search, then calendar, then the action). The calendar trigger SHALL NOT occupy a full-width row by itself on desktop.

#### Scenario: Desktop Gastos places the calendar next to search

- **GIVEN** the user is on Gastos at a desktop viewport and the period has loaded
- **WHEN** they look at the toolbar
- **THEN** the search field, the calendar trigger, and «Agregar gasto adicional» are on one row
- **AND** the calendar trigger is to the right of search

#### Scenario: Narrow viewport may stack the toolbar

- **GIVEN** the user is on Gastos at a viewport below `sm`
- **WHEN** they look at the toolbar
- **THEN** search and the calendar trigger are both available
- **AND** they MAY appear stacked rather than side by side

### Requirement: History has search after load and no month chevrons

Historial SHALL show the same search field used on Gastos (`ListSearchBar` behavior: filter by name or category) after the first load, including when the loaded period has zero expenses. Historial SHALL NOT show previous/next month buttons. Changing month SHALL remain possible only through the calendar popover. The period heading SHALL be left-aligned and informational: month and year when no calendar day is selected; day, month, and year when a due day is selected. It SHALL NOT include navigation controls.

#### Scenario: Empty history month still shows search

- **GIVEN** the loaded history period has no expenses
- **WHEN** the view finishes loading
- **THEN** the search field is visible
- **AND** the calendar trigger is visible

#### Scenario: History heading without a day filter

- **GIVEN** the loaded period is August 2026 and no due-day filter is active
- **WHEN** the user views Historial
- **THEN** the heading is left-aligned
- **AND** it shows month and year (for example «Agosto 2026»)
- **AND** there are no previous or next month buttons

#### Scenario: History heading with a selected day

- **GIVEN** the loaded period is August 2026 and the user has selected due day 21
- **WHEN** they view the heading
- **THEN** it shows day, month, and year (for example «21 de agosto de 2026»)
- **AND** it remains left-aligned without chevrons

#### Scenario: Month change uses the calendar only

- **GIVEN** the user is on Historial for August 2026
- **WHEN** they want a different month
- **THEN** they change it in the calendar popover
- **AND** there is no dedicated month scroller with back and forward buttons
