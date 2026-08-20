# UI/UX Refactoring Specification — CyclePay

Rediseño **solo de presentación** inspirado en el lenguaje visual de la referencia (Soft UI: off-white, naranja de acento, charcoal para CTAs, radios altos, sombras suaves). No se copian módulos de la imagen (charts, savings goals, notificaciones, idioma, transfer).

**Stack:** Vue 3 + Vite + Tailwind 4 + Pinia + Vue Router + reka-ui/shadcn-vue. Tokens en `src/style.css`. Fuente Geist.

**Fuera de alcance (imagen):** Analytics, Transfer, Cards, Loans, campana, settings gear, selector EN, avatar de perfil, gráficos de barras, Savings Goals, hide-balance, currency USD. Se actualizan tokens `.dark` por consistencia, **sin** agregar switch.

---

## 1. Auditoría de navegación

Hoy hay tres superficies + lógica duplicada:

- `src/components/layout/AppLayout.vue` — sidebar `md+`, header móvil, header desktop, `BottomNav` en móvil.
- `src/components/layout/SidebarNav.vue` — logo, 4 links, email, logout.
- `src/components/layout/BottomNav.vue` — mismos destinos, labels distintos (`Inicio` vs `Dashboard`).

Rutas (no se tocan): `/` Dashboard, `/pending` Gastos, `/history` Historial, `/templates` Plantillas.

### Unificación

Un solo componente `AppNav`: barra superior en desktop; hamburger + `Sheet` en móvil. Se eliminan `SidebarNav` y `BottomNav`.

```ts
// Sin props. Sin emits. Lee useRoute + useAuthStore.

type AppNavItem = {
  to: string
  name: 'dashboard' | 'pending' | 'history' | 'templates'
  label: string
  icon: Component
}

// Estado local: mobileOpen: boolean
```

- Destinos en `src/components/layout/navItems.ts`.
- Logout = `authStore.logout()` + `router.push('/auth/login')`.
- Desktop: logo | pills (activo charcoal) | email + Salir.
- Móvil: logo + título | hamburger + Sheet.
- No se agregan: campana, gear, EN, avatar.

`AppLayout` queda como shell: `AppNav` + `<main>` scrollable.

---

## 2. Design tokens

Cambios en `src/style.css`. Geist se mantiene. `--primary` sigue charcoal; `--brand` es el naranja de acento.

- `--background`: `#F8F9FA`
- `--foreground`: `#1A1A1A`
- `--card` / `--popover`: `#FFFFFF`
- `--primary`: `#18181B`
- `--muted-foreground`: `#71717A`
- `--brand`: `#FF6B2C`
- `--brand-foreground`: `#FFFFFF`
- `--brand-soft`: naranja lavado
- `--radius`: `1.25rem`
- Botones/pills/tabs: `rounded-full`
- Sombras: `--shadow-card`, `--shadow-elevated`

No se instalan paquetes nuevos.

---

## 3. Mapeo de componentes

Regla: mismos props, emits, stores y validaciones. Solo clases, tokens y markup visual.

- Layout: crear `AppNav.vue` + `navItems.ts`; simplificar `AppLayout`; eliminar `SidebarNav` y `BottomNav`.
- Primitivos: Card, Button, Input, Select, Tabs, Progress, Sheet, Badge.
- Dashboard: `SummaryCard` (props intactos) + hero “Total del mes” + grid de 3. Sin charts ni goals.
- Listas/vistas: ExpenseListItem, ExpenseHistoryItem, Pending, History, Templates, FormSheets, Auth.

**Archivos prohibidos de lógica:** `stores/*`, `services/*`, `router/index.ts`, `types/*`, `composables/usePeriod.ts`, `lib/firebase.ts`.

---

## 4. Fases

1. Tokens globales y primitivos. Auditoría MCP en `/auth/login`.
2. `AppNav` responsivo. Auditoría MCP de nav + logout.
3. Tarjetas y métricas del Dashboard. Auditoría MCP.
4. Listas, tablas y vistas restantes. Checklist zero-regression + auditoría MCP final.

---

## 5. Validación Playwright MCP

Viewports: Desktop `1440x900`, Mobile `390x844`.

Flujo: `browser_navigate` → `browser_snapshot` → interacciones → `browser_console_messages` (error) → `browser_evaluate` overflow-x → `browser_take_screenshot`.

Auth de Fases 2–4 solo por env (`E2E_EMAIL` / `E2E_PASSWORD`). Fase 1 audita `/auth/login` como guest.

Fallo de fase: error de consola, overflow-x, nav rota, logout no redirige, o control existente deja de responder.

---

## 6. Checklist de seguridad

- Ningún cambio en stores, services, guards, types, usePeriod, Firebase.
- Props/emits de componentes de dominio idénticos.
- Mismas 4 rutas autenticadas + 3 auth.
- Logout sigue en `authStore.logout()` + redirect login.
- Validaciones y reglas de negocio sin cambios.
- Sin credenciales en código.
- Sin features copiadas de la imagen.
- `pnpm build` pasa.
