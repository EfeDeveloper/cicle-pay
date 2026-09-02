## 1. State derivation

- [x] 1.1 Add a derived check for whether the current period has any expenses, and verify the empty month hides the top initialization action.
- [x] 1.2 Add a loaded-state check for template lists, and verify click-time template warnings only fire after templates have loaded.

## 2. Dashboard entry point

- [x] 2.1 [ui] Update DashboardView so the top "Iniciar mes" affordance is hidden on an empty month, and verify the empty dashboard shows the card action instead.
- [x] 2.2 [ui] Show a toast when Dashboard "Iniciar mes" is clicked without templates, and verify no persistent warning is rendered in the header or card.

## 3. Gastos entry point

- [x] 3.1 [ui] Update PendingView so the top initialization action is hidden on an empty month, and verify it appears after any expense exists.
- [x] 3.2 [ui] Show a toast when Gastos "Iniciar mes" is clicked without templates, and verify no persistent warning is rendered.

## 4. Validation

- [x] 4.1 [qa] Run a browser smoke check on the dashboard and /pending flow to verify the empty month hides the top CTA, the card button remains available, the CTA appears after a manual expense, and no-templates feedback is toast-only.
