## 1. Helpers

- [x] 1.1 Add `src/lib/dueDayCalendar.ts` with `DueDayFilter`, `DueDayMark`, `buildDueDayMarks`, and `filterByDueDay` as in design.md, and verify TypeScript compiles (`pnpm exec vue-tsc --noEmit` or the project typecheck script).

## 2. Calendar UI

- [x] 2.1 [ui] Implement first-pass `DueDayCalendar.vue` grid (superseded by 2.3).
- [x] 2.2 Hide/select rules for unmarked days (still apply inside the popover).
- [x] 2.3 Add shadcn-vue `calendar` (and `@internationalized/date` if the CLI requires it) without extra unused packages, and verify `src/components/ui/calendar` exists.
- [x] 2.4 [ui] Rewrite `DueDayCalendar.vue` as descriptive trigger + Popover + Calendar (`es-MX`), status/presence marks, disabled unmarked/future days, footer Todos/Sin día, and verify the inline Card grid is gone.

## 3. Wire list views

- [x] 3.1 Compose search + tabs then `filterByDueDay` in `PendingView.vue`.
- [x] 3.4 Switch `PendingView.vue` to `usePeriod`, fetch on period change, pass `periodKey` into the calendar and the manual-expense sheet, keep the trigger after empty months, and verify a past month loads that period.
- [x] 3.2 Wire Historial filter + reset on period change.
- [x] 3.5 Sync Historial Calendar month with `currentPeriod`, keep the trigger when the month is empty, and verify chevrons and popover stay aligned.
- [x] 3.3 Wire presence-mode filter in `TemplatesView.vue`.
- [x] 3.6 Use the popover Calendar on Plantillas without emitting period changes, and verify changing month does not fetch expenses.

## 4. Preview drawer

- [x] 4.1 [ui] In `RecordDetailSheet.vue`, replace visible «Vista de solo lectura» with an `sr-only` `SheetDescription`, and verify the phrase is not on screen in expense and template previews.

## 5. QA

- [x] 5.1 [qa] Playwright MCP pass on Gastos, Historial, and Plantillas (desktop + mobile): trigger copy, popover, marks, month change, filter, clear, Sin día, empty month still has trigger, preview copy; report MUST-fix vs PREGUNTAR in one batch.
