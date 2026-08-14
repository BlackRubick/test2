<script setup lang="ts">
import { gsap, ScrollTrigger, registerGsap } from '~/utils/gsap'

const props = defineProps<{
  value: number
  suffix?: string
  label: string
}>()

const el = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()

onMounted(() => {
  registerGsap()
  if (!el.value) return

  const format = (n: number) => `${Math.round(n).toLocaleString('es-MX')}${props.suffix ?? ''}`

  if (reducedMotion.value) {
    el.value.textContent = format(props.value)
    return
  }

  const counter = { value: 0 }
  const trigger = ScrollTrigger.create({
    trigger: el.value,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(counter, {
        value: props.value,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (el.value) el.value.textContent = format(counter.value)
        }
      })
    }
  })

  onUnmounted(() => trigger.kill())
})
</script>

<template>
  <div>
    <p ref="el" class="font-display text-5xl text-clay md:text-6xl">0{{ suffix }}</p>
    <p class="eyebrow mt-3">{{ label }}</p>
  </div>
</template>
