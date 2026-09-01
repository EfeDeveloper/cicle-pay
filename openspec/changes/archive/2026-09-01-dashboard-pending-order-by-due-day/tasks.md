## 1. Comparator and Data Ordering

- [x] 1.1 Implement a reusable MonthlyExpense comparator that sorts by valid `dueDay` ascending, places `dueDay` null at the end, and applies deterministic tie-breakers (name, then id); verify with unit-level assertions or a deterministic fixture run.
- [x] 1.2 Replace alphabetical sorting in monthly expense retrieval with the new comparator and verify loading the same `periodKey` on different dates preserves the same due-day-first order.
- [x] 1.3 Apply the same comparator after creating a manual expense in the loaded period and verify the new item is inserted in the expected chronological position without reloading.

## 2. Pending Flow Consistency

- [x] 2.1 Ensure `pendingExpenses` derivation keeps comparator order (no additional re-sorting side effects) and verify dashboard "Próximos por pagar" renders earliest due days first.
- [x] 2.2 Verify expenses without `dueDay` appear after dated pending expenses in dashboard and pending list views using a mixed fixture (dated + undated).
- [x] 2.3 Validate toggle behavior remains intact (pending -> paid) while ordered lists update reactively without visual jumps for equal due-day items.

## 3. Verification and Regression Checks

- [x] 3.1 Run typecheck/build verification (`pnpm exec vue-tsc --noEmit` and `pnpm build` or project-equivalent) and confirm no new TypeScript/build errors.
- [x] 3.2 [qa] Execute UI validation for dashboard and pending views covering: due-day-first ordering, stability across reloads, and undated-at-end behavior; record MUST-fix findings if any.
