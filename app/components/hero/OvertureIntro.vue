<script setup lang="ts">
import { gsap, ScrollTrigger, registerGsap } from '~/utils/gsap'

const wrapper = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()

onMounted(() => {
  registerGsap()
  if (!wrapper.value || !textEl.value || reducedMotion.value) return

  // A single scroll-scrubbed timeline drives both the text dissolve and a
  // slow background zoom — one ScrollTrigger, two things reacting to it.
  const tl = gsap.timeline()
  tl.to(
    textEl.value,
    {
      opacity: 0,
      filter: 'blur(14px)',
      yPercent: -12,
      scale: 0.94,
      ease: 'none'
    },
    0
  )
  if (imageEl.value) {
    tl.to(imageEl.value, { scale: 1.12, ease: 'none' }, 0)
  }

  const trigger = ScrollTrigger.create({
    trigger: wrapper.value,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    animation: tl
  })

  onUnmounted(() => trigger.kill())
})
</script>

<template>
  <section ref="wrapper" class="relative h-[160vh]">
    <div class="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div ref="imageEl" class="absolute inset-0 h-full w-full scale-100">
        <img
          src="/properties/altiplano-house-01.webp"
          alt=""
          class="h-full w-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-paper/68" aria-hidden="true" />

      <div ref="textEl" class="relative z-10 flex flex-col items-center text-center">
        <p class="eyebrow mb-8 inline-block rounded-full bg-paper/90 px-4 py-2 !text-clay shadow-sm">
          Terra — Estudio residencial
        </p>
        <h1
          class="font-display text-[2.8rem] leading-[1.05] tracking-tightest text-ink sm:text-7xl md:text-8xl"
        >
          Los espacios no aparecen.
          <br />
          <span class="italic text-clay">Se construyen.</span>
        </h1>
      </div>

      <div class="absolute bottom-12 left-0 right-0 z-10 flex justify-center">
        <ScrollCue />
      </div>
    </div>
  </section>
</template>
