## MODIFIED Requirements

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