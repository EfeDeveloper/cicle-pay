# monthly-expenses

## Purpose

Payment instances for a single calendar month. Instances are not templates.

## Requirements

### Requirement: Instances belong to one period

The system SHALL store each monthly expense under `payment_cycles/{uid}/expenses/{periodKey}/items/{expenseId}` with a `periodKey` of `YYYY-MM` that matches the parent period document id, and a `status` of `pending` or `paid`.

#### Scenario: Period-scoped query

- **GIVEN** expenses in more than one month
- **WHEN** the client loads a period
- **THEN** only documents under `payment_cycles/{uid}/expenses/{periodKey}/items/*` for that period are returned

### Requirement: Template-sourced items use auto ids and avoid duplicate creation in one period

When materializing templates into a month, the system SHALL create items with Firestore auto-generated document ids under `payment_cycles/{uid}/expenses/{periodKey}/items/{expenseId}`. Template-sourced items SHALL have `source: 'template'` and a non-null `templateId`. During month initialization, if an item for the same `templateId` already exists in that period, the system SHALL skip creating another one.

#### Scenario: Same template processed twice in one period

- **GIVEN** an active template T and period `YYYY-MM`
- **WHEN** materialization runs twice
- **THEN** exactly one template-sourced expense exists for template T inside `payment_cycles/{uid}/expenses/{periodKey}/items`

### Requirement: Manual expenses are separate

A user-created expense that is not from a template SHALL use a Firestore auto-generated id, `source: 'manual'`, and `templateId: null`, and SHALL be written under `payment_cycles/{uid}/expenses/{periodKey}/items/{expenseId}`.

#### Scenario: Manual expense id is not template-derived

- **WHEN** a user adds a one-off expense in period `YYYY-MM`
- **THEN** its id is not `${templateId}_${periodKey}`
- **AND** `source` is `manual`
- **AND** it exists under `payment_cycles/{uid}/expenses/{periodKey}/items/*`

### Requirement: Owner-only valid writes

The system SHALL accept writes only from the signed-in owner, with `amount > 0`, valid `periodKey`, valid `status` and `source`, optional description (omit if empty, max 140 chars), and optional `dueDay` 1–31 or null.

#### Scenario: Invalid amount is rejected

- **WHEN** a client writes an expense with `amount <= 0`
- **THEN** the write is denied

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

### Requirement: Preview drawer has no visible read-only caption

The expense preview drawer SHALL NOT show the visible text «Vista de solo lectura». It SHALL still expose a screen-reader-only description.

#### Scenario: Opening an expense preview

- **GIVEN** the user opens the preview drawer for an expense
- **WHEN** the sheet is visible
- **THEN** «Vista de solo lectura» is not shown on screen

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

### Requirement: Receipt scanning action for manual expenses

The system SHALL provide an option within the «Agregar gasto adicional» control on the Gastos view to initiate receipt scanning via image capture or upload. The control SHALL remain accessible on the same desktop toolbar row alongside search and the due-day calendar trigger.

#### Scenario: User chooses to scan receipt from the expense action menu
- **GIVEN** the user is on the Gastos view
- **WHEN** the user opens the «Agregar gasto adicional» menu and selects the receipt scanning option
- **THEN** the system presents the image acquisition interface (file picker or mobile capture options)

#### Scenario: User chooses manual entry from the expense action menu
- **GIVEN** the user is on the Gastos view
- **WHEN** the user opens the «Agregar gasto adicional» menu and selects «Ingreso manual»
- **THEN** the system opens the standard empty «ManualExpenseFormSheet»

### Requirement: Dual image capture for desktop and mobile devices

The system SHALL support image acquisition adapted to the device context: on desktop environments, it SHALL open a file selection dialog filtered to supported image formats (PNG, JPG, JPEG, WEBP); on mobile devices, it SHALL offer options to capture a photo directly using the device camera (`capture="environment"`) or select an existing image from the device gallery.

#### Scenario: Desktop image upload
- **GIVEN** the user is using a desktop browser
- **WHEN** the user initiates receipt scanning
- **THEN** the browser file selector prompts for a supported image file (PNG, JPG, JPEG, WEBP) up to 10 MB

#### Scenario: Mobile camera capture
- **GIVEN** the user is using a mobile browser
- **WHEN** the user selects «Tomar foto»
- **THEN** the device opens the camera interface to take a picture of the physical receipt

#### Scenario: Mobile gallery selection
- **GIVEN** the user is using a mobile browser
- **WHEN** the user selects «Elegir de galería»
- **THEN** the device photo library or file picker is displayed to select an existing receipt image

### Requirement: Optical Character Recognition and AI extraction

When a receipt image is selected, the system SHALL send the image to the OCR extraction endpoint (`POST /api/v1/ocr/extract-text`) and, upon receiving legible text (`has_text: true`), submit the extracted text and current period to the AI structuring endpoint (`POST /api/v1/ai/extract-expense`). During processing, the system SHALL display visual feedback indicating the current progress stage (OCR and AI inference).

#### Scenario: Successful receipt extraction
- **GIVEN** a valid receipt image containing legible expense data
- **WHEN** the image is processed through the OCR and AI endpoints
- **THEN** the system receives structured expense fields (`name`, `amount`, `category`, `dueDay`, `periodKey`, `status`, `description`) conforming to `CreateManualExpenseInput`

#### Scenario: OCR detects no legible text
- **GIVEN** an image with no recognizable text or a blank photo
- **WHEN** the OCR endpoint returns `has_text: false`
- **THEN** the system notifies the user that no legible text was found
- **AND** the system does not call the AI extraction endpoint
- **AND** provides an option to retry with another image or fill the form manually

#### Scenario: Backend service unavailable or timeout
- **GIVEN** the backend server or AI model is unreachable, returns 503, or times out
- **WHEN** the scanning process encounters the network or server error
- **THEN** the system shows an error notification with a retry action and allows the user to open the manual entry form directly

### Requirement: Pre-filled review before saving scanned expenses

Upon successful OCR and AI extraction, the system SHALL open `ManualExpenseFormSheet` pre-populated with the inferred values. The system SHALL NOT persist the expense to Firestore without explicit user confirmation via the «Guardar gasto» action.

#### Scenario: Reviewing pre-filled expense data
- **GIVEN** the AI extraction returned an expense with name "Supermercado", amount 45000, and category "Alimentación"
- **WHEN** the extraction completes successfully
- **THEN** `ManualExpenseFormSheet` opens with the fields populated with those values
- **AND** the user can edit any field before submitting

#### Scenario: Saving a verified scanned expense
- **GIVEN** `ManualExpenseFormSheet` is open with pre-filled scanned data
- **WHEN** the user clicks «Guardar gasto»
- **THEN** the expense is persisted under `payment_cycles/{uid}/expenses/{periodKey}/items/*` with `source: 'manual'` and `templateId: null`
- **AND** the sheet closes and the expense appears in the current period list
