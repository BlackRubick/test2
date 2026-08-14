import { gsap } from '~/utils/gsap'

/**
 * Subtle magnetic-pull effect for buttons/links. Attach to a template ref.
 * Strength is capped so it reads as "premium nudge", not a gimmick.
 */
export function useMagneticHover(target: Ref<HTMLElement | null>, strength = 0.35) {
  let onMove: ((e: PointerEvent) => void) | null = null
  let onLeave: (() => void) | null = null

  onMounted(() => {
    const el = target.value
    if (!el || window.matchMedia('(pointer: coarse)').matches) return

    onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: 'power3.out'
      })
    }

    onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
  })

  onUnmounted(() => {
    const el = target.value
    if (!el) return
    if (onMove) el.removeEventListener('pointermove', onMove)
    if (onLeave) el.removeEventListener('pointerleave', onLeave)
  })
}
