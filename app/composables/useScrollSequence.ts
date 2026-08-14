import { computed, ref } from 'vue'
import { ScrollTrigger } from '~/utils/gsap'
import { CONSTRUCTION_BEATS, CONSTRUCTION_PIN_VH } from '~/utils/animation-config'
import type { ImageSequenceHandle } from '~/composables/useImageSequence'

interface ScrollSequenceOptions {
  frameCount: number
  pinVh?: number
}

interface RendererLike {
  drawFrame: (source: CanvasImageSource, background?: CanvasImageSource) => void
  drawBlended: (
    from: CanvasImageSource,
    to: CanvasImageSource,
    t: number,
    fromBackground?: CanvasImageSource
  ) => void
}

/**
 * Bridges GSAP ScrollTrigger to the frame sequence: scroll progress (0-1)
 * maps to a continuous frame position, which is pushed straight into the
 * canvas renderer inside the scrub callback — bypassing Vue's reactivity
 * for the actual draw so high-frequency scroll ticks stay cheap. `progress`
 * and `activeBeatIndex` remain reactive for the (much lower frequency) HUD.
 *
 * With a sparse set of real keyframes (a dozen or so, not hundreds), a hard
 * index switch per scroll tick reads as a slideshow. Instead we track a
 * continuous position and cross-dissolve between the two neighboring
 * frames, so motion stays visually continuous between keyframes.
 */
export function useScrollSequence(
  getSection: () => HTMLElement | null,
  sequence: ImageSequenceHandle,
  renderer: RendererLike,
  options: ScrollSequenceOptions,
  /** Optional pre-blurred backdrop sequence, shown behind a contain-fit frame (mobile letterboxing). */
  backgroundSequence?: ImageSequenceHandle
) {
  const progress = ref(0)
  const frameIndex = ref(0)

  const activeBeatIndex = computed(() => {
    let idx = 0
    CONSTRUCTION_BEATS.forEach((beat, i) => {
      if (progress.value >= beat.at) idx = i
    })
    return idx
  })

  let trigger: ScrollTrigger | null = null

  function positionForProgress(p: number) {
    return p * (options.frameCount - 1)
  }

  function renderAt(position: number) {
    const lower = Math.floor(position)
    const upper = Math.min(options.frameCount - 1, lower + 1)
    const t = position - lower

    const from = sequence.getFrame(lower)
    if (!from) return
    const fromBg = backgroundSequence?.getFrame(lower) ?? undefined

    if (upper === lower) {
      renderer.drawFrame(from, fromBg)
      return
    }
    const to = sequence.getFrame(upper)
    if (!to) {
      renderer.drawFrame(from, fromBg)
      return
    }
    renderer.drawBlended(from, to, t, fromBg)
  }

  function onScrollUpdate(p: number) {
    progress.value = p
    const position = positionForProgress(p)
    const idx = Math.round(position)
    if (idx !== frameIndex.value) {
      frameIndex.value = idx
      sequence.setActiveIndex(idx)
      backgroundSequence?.setActiveIndex(idx)
    }
    renderAt(position)
  }

  function start() {
    const section = getSection()
    if (!section) return
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${options.pinVh ?? CONSTRUCTION_PIN_VH}%`,
      pin: true,
      scrub: 0.35,
      onUpdate: (self) => onScrollUpdate(self.progress)
    })
    onScrollUpdate(0)
  }

  /** Jumps straight to a static progress value with no ScrollTrigger — used for reduced-motion. */
  function showStatic(p: number) {
    progress.value = p
    const position = positionForProgress(p)
    frameIndex.value = Math.round(position)
    sequence.setActiveIndex(frameIndex.value)
    backgroundSequence?.setActiveIndex(frameIndex.value)
    renderAt(position)
  }

  function refresh() {
    trigger?.refresh()
    renderAt(positionForProgress(progress.value))
  }

  function dispose() {
    trigger?.kill()
    trigger = null
  }

  return { progress, frameIndex, activeBeatIndex, start, showStatic, refresh, dispose }
}
