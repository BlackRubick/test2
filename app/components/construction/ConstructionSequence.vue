<script setup lang="ts">
import { registerGsap } from '~/utils/gsap'
import { BREAKPOINTS, CONSTRUCTION_BEATS } from '~/utils/animation-config'
import { SEQUENCE_VARIANTS } from '~/utils/sequence-config'
import { useImageSequence } from '~/composables/useImageSequence'
import { useCanvasRenderer } from '~/composables/useCanvasRenderer'
import { useScrollSequence } from '~/composables/useScrollSequence'

const sectionEl = ref<HTMLElement | null>(null)
const canvasComp = ref<{ canvasEl: HTMLCanvasElement | null } | null>(null)

const reducedMotion = useReducedMotion()

const showLoader = ref(true)
const loadProgress = ref(0)
const scrollProgress = ref(0)
const activeLabel = ref<string>(CONSTRUCTION_BEATS[0]!.label)

let sequence: ReturnType<typeof useImageSequence> | null = null
let renderer: ReturnType<typeof useCanvasRenderer> | null = null
let scrollSequence: ReturnType<typeof useScrollSequence> | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  registerGsap()

  const canvas = canvasComp.value?.canvasEl
  const section = sectionEl.value
  if (!canvas || !section) return

  const isNarrow = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet}px)`).matches
  const variant = isNarrow ? SEQUENCE_VARIANTS.mobile : SEQUENCE_VARIANTS.desktop

  sequence = useImageSequence(variant)
  renderer = useCanvasRenderer()
  // The sequence photos are landscape; on a narrow/portrait viewport a
  // cover-fit crop would cut the house out of frame, so mobile letterboxes
  // instead — the whole house stays visible, just smaller.
  renderer.attach(canvas, { fit: isNarrow ? 'contain' : 'cover' })

  scrollSequence = useScrollSequence(() => sectionEl.value, sequence, renderer, {
    frameCount: variant.frameCount
  })

  watch(sequence.loadProgress, (p) => (loadProgress.value = p))
  watch(scrollSequence.progress, (p) => (scrollProgress.value = p))
  watch(scrollSequence.activeBeatIndex, (i) => (activeLabel.value = CONSTRUCTION_BEATS[i]!.label))

  // Once the sparse critical pass has loaded, reveal the canvas and start
  // driving it from scroll (or jump straight to the finished frame if the
  // visitor prefers reduced motion) — the rest of the sequence keeps
  // filling in quietly in the background.
  watch(
    sequence.isReady,
    (ready) => {
      if (!ready) return
      showLoader.value = false
      if (reducedMotion.value) {
        scrollSequence?.showStatic(1)
      } else {
        scrollSequence?.start()
      }
    },
    { immediate: true }
  )

  resizeObserver = new ResizeObserver(() => renderer?.resize())
  resizeObserver.observe(canvas)

  void sequence.start()
})

onUnmounted(() => {
  scrollSequence?.dispose()
  resizeObserver?.disconnect()
  renderer?.dispose()
  sequence?.dispose()
})
</script>

<template>
  <section ref="sectionEl" class="relative h-screen w-full overflow-hidden bg-paper">
    <ConstructionCanvas ref="canvasComp" />

    <ConstructionLoader v-if="showLoader" :progress="loadProgress" />

    <template v-else>
      <ConstructionProgress :label="activeLabel" :progress="scrollProgress" />
      <ConstructionReveal :visible="scrollProgress > 0.96" />
    </template>
  </section>
</template>
