import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/**
 * Registers GSAP plugins exactly once, client-side only.
 * Import and call this from a plugin or the first composable that needs it.
 */
export function registerGsap() {
  if (registered || !import.meta.client) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export { gsap, ScrollTrigger }
