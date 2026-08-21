import { Clock, History, LayoutDashboard, LayoutTemplate } from '@lucide/vue'

export type AppNavItemName = 'dashboard' | 'pending' | 'history' | 'templates'

export const APP_NAV_ITEMS = [
  { to: '/', name: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pending', name: 'pending' as const, label: 'Gastos', icon: Clock },
  { to: '/history', name: 'history' as const, label: 'Historial', icon: History },
  { to: '/templates', name: 'templates' as const, label: 'Plantillas', icon: LayoutTemplate },
] satisfies {
  to: string
  name: AppNavItemName
  label: string
  icon: typeof LayoutDashboard
}[]

export const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  pending: 'Gastos Pendientes',
  history: 'Historial',
  templates: 'Plantillas',
}
