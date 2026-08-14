export function useReducedMotion() {
  const prefersReduced = ref(false)

  onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.value = mq.matches
    const handler = (e: MediaQueryListEvent) => (prefersReduced.value = e.matches)
    mq.addEventListener('change', handler)
    onUnmounted(() => mq.removeEventListener('change', handler))
  })

  return prefersReduced
}
