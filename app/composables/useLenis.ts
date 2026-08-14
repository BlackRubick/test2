import Lenis from 'lenis'
import { gsap } from '~/utils/gsap'
import { LENIS_OPTIONS, BREAKPOINTS } from '~/utils/animation-config'

let lenis: Lenis | null = null

/**
 * Smooth scroll, desktop/non-touch only. On touch devices the native
 * scroll already feels correct and artificial smoothing tends to fight
 * the user's finger, so we skip it entirely there.
 */
export function useLenis() {
  onMounted(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const isNarrow = window.innerWidth <= BREAKPOINTS.tablet
    if (isTouch || isNarrow) return

    lenis = new Lenis(LENIS_OPTIONS)

    const raf = (time: number) => {
      lenis?.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    onUnmounted(() => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    })
  })

  return {
    stop: () => lenis?.stop(),
    start: () => lenis?.start()
  }
}
