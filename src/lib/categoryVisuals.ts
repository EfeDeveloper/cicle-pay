import type { Component } from 'vue'
import {
  BookOpen,
  Bus,
  Clapperboard,
  HeartPulse,
  Home,
  MoreHorizontal,
  Shield,
  ShoppingBag,
  Tv,
  Utensils,
  Zap,
} from '@lucide/vue'

const CATEGORY_ICONS: Record<string, Component> = {
  Vivienda: Home,
  Servicios: Zap,
  Alimentación: Utensils,
  Transporte: Bus,
  Salud: HeartPulse,
  Educación: BookOpen,
  Entretenimiento: Clapperboard,
  Seguros: Shield,
  Suscripciones: Tv,
  Otros: ShoppingBag,
}

export function getCategoryIcon(category: string): Component {
  return CATEGORY_ICONS[category] ?? MoreHorizontal
}
