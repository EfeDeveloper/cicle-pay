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
