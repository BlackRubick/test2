<script setup lang="ts">
import { gsap, ScrollTrigger, registerGsap } from '~/utils/gsap'

withDefaults(
  defineProps<{
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
    by?: 'lines' | 'words'
    delay?: number
  }>(),
  { as: 'div', by: 'lines', delay: 0 }
)

const root = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()

onMounted(async () => {
  registerGsap()
  const el = root.value
  if (!el) return

  if (reducedMotion.value) {
    gsap.set(el, { opacity: 1 })
    return
  }

  const { SplitText } = await import('gsap/SplitText')
  gsap.registerPlugin(SplitText)

  const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'reveal-line' })
  gsap.set(split.lines, { yPercent: 110 })
  gsap.set(el, { opacity: 1 })

  const trigger = ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(split.lines, {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.08
      })
    }
  })

  onUnmounted(() => {
    trigger.kill()
    split.revert()
  })
})
</script>

<template>
  <component :is="as" ref="root" class="opacity-0">
    <slot />
  </component>
</template>
