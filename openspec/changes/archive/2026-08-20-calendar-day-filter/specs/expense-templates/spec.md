## ADDED Requirements

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
