## ADDED Requirements

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
