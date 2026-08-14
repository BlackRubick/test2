/**
 * Central tuning file for the scroll-driven construction experience.
 * Change timings/breakpoints here instead of inside components.
 */

export const EASE = {
  premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
  soft: 'power2.out',
  sharp: 'power3.inOut'
} as const

/** Height of the pinned construction section as a multiple of viewport height. */
export const CONSTRUCTION_PIN_VH = 500

/**
 * The narrative beats of the construction image sequence, expressed as a
 * fraction (0-1) of scroll progress through the pinned section. These drive
 * the discreet chapter indicator only — the visual construction itself
 * lives entirely in the frame sequence, not in these values.
 */
export const CONSTRUCTION_BEATS = [
  { id: 'terrain', label: '01 / TERRENO', at: 0 },
  { id: 'foundation', label: '02 / CIMENTACIÓN', at: 31 / 120 },
  { id: 'structure', label: '03 / ESTRUCTURA', at: 46 / 120 },
  { id: 'architecture', label: '04 / ARQUITECTURA', at: 66 / 120 },
  { id: 'finishes', label: '05 / ACABADOS', at: 96 / 120 },
  { id: 'final', label: '06 / FINAL', at: 109 / 120 }
] as const

export const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023
} as const

export const LENIS_OPTIONS = {
  duration: 1.1,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 0
} as const
