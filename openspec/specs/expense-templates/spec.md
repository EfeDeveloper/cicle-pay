# expense-templates

## Purpose

Recurring expense definitions owned by one authenticated user. Templates are not payments.

## Requirements

### Requirement: Templates are distinct from monthly instances

The system SHALL store expense templates separately from monthly expense instances. A template SHALL NOT carry `status`, `periodKey`, `paidAt`, or `source`.

#### Scenario: Template document shape

- **GIVEN** an authenticated user
- **WHEN** they persist a template
- **THEN** it is stored at `payment_cycles/{uid}/templates/{templateId}`
- **AND** it includes name, amount (> 0), category, `isActive`, and timestamps
- **AND** it does not include payment status or a period key

### Requirement: Authenticated owner access only

The system SHALL allow create, read, update, and delete of templates only for the signed-in owner (`userId` matches auth uid). Unauthenticated access SHALL be denied.

#### Scenario: Owner can manage own templates

- **GIVEN** a signed-in user
- **WHEN** they read or write templates under their `payment_cycles/{uid}` path
- **THEN** the operation succeeds if the payload is valid

#### Scenario: Other users cannot access templates

- **GIVEN** a template owned by user A
- **WHEN** user B attempts to read or write it
- **THEN** the operation is denied

### Requirement: Optional description and due day

The system SHALL treat `description` as optional. Empty descriptions SHALL be omitted from the document (not stored as `undefined`). When present, description SHALL be at most 140 characters. `dueDay` SHALL be null, omitted, or an integer 1–31.

#### Scenario: Empty description is omitted

- **WHEN** a template is saved with a blank description
- **THEN** the Firestore document does not contain `description`

### Requirement: Due-day calendar on template lists

The system SHALL provide a descriptive button on the templates view that opens a month calendar in a popover whenever templates have been loaded (including when the filtered list is empty). Each day that has templates with that `dueDay` SHALL be visually marked with a single presence color (templates have no payment `status`). Inactive templates SHALL still mark their `dueDay` when they are in the visible set. Templates without `dueDay` SHALL NOT mark any day. Changing the visible month SHALL NOT load monthly expenses and SHALL NOT treat templates as payment instances; it only changes which weekday the due-day numbers fall on.

#### Scenario: Template with due day 21 is marked

- **GIVEN** a template named "Comida" with `dueDay` 21
- **WHEN** the user opens the calendar popover on Plantillas
- **THEN** day 21 is marked
- **AND** days without templates stay unmarked

#### Scenario: Empty template list hides the trigger

- **GIVEN** the user has no templates
- **WHEN** the view finishes loading
- **THEN** the calendar trigger is not shown

### Requirement: Calendar filters templates by due day

Selecting a marked day SHALL filter the visible template list to templates whose `dueDay` equals that day. The trigger label SHALL reflect the filter. The day filter SHALL combine with the existing search query and active/inactive tabs (AND). Selecting the same day again, or choosing «Todos», SHALL remove the day filter. A «Sin día» control SHALL filter to templates with no `dueDay`.

#### Scenario: Click day 21 filters templates

- **GIVEN** templates due on days 5, 21, and none
- **WHEN** the user selects day 21
- **THEN** only templates with `dueDay` 21 are listed
- **AND** search and active/inactive tabs still apply to that subset

#### Scenario: Clearing the day filter restores templates

- **GIVEN** day 21 is selected
- **WHEN** the user selects day 21 again or chooses «Todos»
- **THEN** the list is no longer filtered by due day

#### Scenario: Sin día lists templates without dueDay

- **GIVEN** some templates have no `dueDay`
- **WHEN** the user chooses «Sin día»
- **THEN** only those templates are listed

### Requirement: Preview drawer has no visible read-only caption

The template preview drawer SHALL NOT show the visible text «Vista de solo lectura». It SHALL still expose a screen-reader-only description.

#### Scenario: Opening a template preview

- **GIVEN** the user opens the preview drawer for a template
- **WHEN** the sheet is visible
- **THEN** «Vista de solo lectura» is not shown on screen

### Requirement: Search and calendar share a desktop toolbar on templates

On Plantillas, when the calendar trigger is shown, it SHALL sit on the same row as the search field from the `sm` breakpoint upward, to the right of search and to the left of «Nueva plantilla». On viewports below `sm`, those controls MAY stack. The calendar trigger SHALL NOT occupy a full-width row by itself on desktop. When the user has no templates, the calendar trigger remains hidden; search and «Nueva plantilla» stay available.

#### Scenario: Desktop Plantillas places the calendar next to search

- **GIVEN** the user has at least one template and is on Plantillas at a desktop viewport
- **WHEN** they look at the toolbar
- **THEN** search, the calendar trigger, and «Nueva plantilla» are on one row
- **AND** the calendar trigger is to the right of search

#### Scenario: No templates keeps search without the calendar

- **GIVEN** the user has no templates
- **WHEN** the view finishes loading
- **THEN** search and «Nueva plantilla» are shown
- **AND** the calendar trigger is not shown
