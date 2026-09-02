## Context

See proposal.md for motivation. The current app already distinguishes `MonthlyExpense.source` between `template` and `manual`, and `generateMonthlyExpenses()` is idempotent by template-period id. The gap is UI state: the top-level initialization affordance should be hidden in the empty month state and only shown once the period already has expenses. The new requirement also needs a transient toast/alert when the user clicks "Iniciar mes" without templates.

Concrete files likely to change:
- `src/views/DashboardView.vue`
- `src/views/PendingView.vue`
- `src/stores/expenseStore.ts`
- `src/services/expenseService.ts`

## Goals / Non-Goals

**Goals:**
- Derive the top-level month-initialization CTA from whether the period has any expenses.
- Hide the top-level CTA on the empty dashboard / empty Gastos state.
- Surface a click-triggered no-templates toast/alert on dashboard and Gastos.
- Preserve the current Firestore model and idempotent template generation flow.

**Non-Goals:**
- No new collections, fields, or backend endpoints.
- No changes to template generation payload shape.
- No changes to monthly expense creation rules for manual expenses.
- No redesign of the dashboard beyond the visibility and placement of the initialization action.

## Decisions

1. **Use existing expense data as the source of truth for initialization state**
   - Decision: compute `hasExpensesInPeriod` from the loaded monthly expenses and use that to control the top-level CTA visibility.
   - Rationale: the new behavior is based on the presence of any expense, not on whether the month has been materialized from templates.
   - Alternatives considered: keeping the CTA visible until a template-sourced expense exists. Rejected because it conflicts with the requested empty-state behavior.

2. **Expose the action in more than one visible surface**
   - Decision: show the top-level CTA only when there is at least one expense, and add a small template-empty notice in Dashboard and Gastos.
   - Rationale: this matches the requested empty-state simplification while still keeping the generation path discoverable.
   - Alternatives considered: keeping a permanent notice visible in the header or empty state. Rejected because the request prefers feedback only on click.

3. **Keep generation idempotent and unchanged**
   - Decision: reuse `generateMonthlyExpenses(periodKey)` as-is for the actual materialization logic.
   - Rationale: the backend already handles repeated initialization safely through deterministic IDs.
   - Alternatives considered: a new service method for "re-initialize". Rejected because it would be redundant and increase maintenance cost.

## Risks / Trade-offs

- [Risk] Users may still see an initialization CTA even when it will create zero new expenses because the template set is empty. → Mitigation: preserve the existing empty-template feedback from the current generation flow.
- [Risk] The UI may briefly reflect stale initialization state before expenses finish loading. → Mitigation: derive the state only after the month expenses request resolves and keep a loading skeleton/disabled action while pending.
- [Risk] The click-triggered no-templates toast could be missed by the user if it is too subtle. → Mitigation: use the app's standard toast severity and copy that explains the next step clearly.

## Migration Plan

- No data migration is needed.
- Ship the UI condition change first, then verify that manual expense creation no longer removes the initialization action.
- Rollback is straightforward: revert the visibility condition and any derived state helper.

## Open Questions

None.
