# monthly-expenses

## Purpose

Payment instances for a single calendar month. Instances are not templates.

## Requirements

### Requirement: Instances belong to one period

The system SHALL store each monthly expense under `payment_cycles/{uid}/expenses/{expenseId}` with a `periodKey` of `YYYY-MM` and a `status` of `pending` or `paid`.

#### Scenario: Period-scoped query

- **GIVEN** expenses in more than one month
- **WHEN** the client loads a period
- **THEN** only documents with that `periodKey` are returned

### Requirement: Template-sourced ids are idempotent

When materializing a template into a month, the system SHALL use document id `${templateId}_${periodKey}` and `setDoc` so repeating the operation does not create duplicates. Those instances SHALL have `source: 'template'` and a non-null `templateId`.

#### Scenario: Same template materialized twice in one period

- **GIVEN** an active template T and period `YYYY-MM`
- **WHEN** materialization runs twice
- **THEN** exactly one expense exists with id `T_YYYY-MM`

### Requirement: Manual expenses are separate

A user-created expense that is not from a template SHALL use a Firestore auto-generated id, `source: 'manual'`, and `templateId: null`.

#### Scenario: Manual expense id is not template-derived

- **WHEN** a user adds a one-off expense
- **THEN** its id is not `${templateId}_${periodKey}`
- **AND** `source` is `manual`

### Requirement: Owner-only valid writes

The system SHALL accept writes only from the signed-in owner, with `amount > 0`, valid `periodKey`, valid `status` and `source`, optional description (omit if empty, max 140 chars), and optional `dueDay` 1–31 or null.

#### Scenario: Invalid amount is rejected

- **WHEN** a client writes an expense with `amount <= 0`
- **THEN** the write is denied
