import { ref, type Ref } from 'vue'
import { buildFramePath, SEQUENCE_PRELOAD, type SequenceVariantConfig } from '~/utils/sequence-config'

export type SequenceFrame = ImageBitmap | HTMLImageElement

export interface ImageSequenceHandle {
  /** True once the sparse "critical" pass has loaded — safe to start the scroll experience. */
  isReady: Ref<boolean>
  /** True once every frame in the sequence has loaded. */
  isComplete: Ref<boolean>
  /** 0-1, loaded frame count over total. */
  loadProgress: Ref<number>
  /** Best available frame for `index` — exact if cached, nearest neighbor otherwise, never null once ready. */
  getFrame: (index: number) => SequenceFrame | null
  /** Tells the cache which frame is "current" so eviction favors nearby frames. */
  setActiveIndex: (index: number) => void
  /** Kicks off preloading: critical sparse pass first, then fills in the rest. */
  start: () => Promise<void>
  dispose: () => void
}

function hasClose(frame: SequenceFrame): frame is ImageBitmap {
  return typeof (frame as ImageBitmap).close === 'function'
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${url}`))
    img.src = url
  })
}

/**
 * Preloads and caches a numbered image sequence with bounded memory use.
 * Loading happens in two passes: a sparse "critical" pass covering the full
 * range first (so scrubbing anywhere never shows a truly empty frame),
 * then a fill pass for everything in between. Frames are evicted by
 * distance from the current playhead once the cache exceeds its budget.
 */
export function useImageSequence(variant: SequenceVariantConfig): ImageSequenceHandle {
  const cache = new Map<number, SequenceFrame>()
  const pinned = new Set<number>()
  const inFlight = new Set<number>()
  const failed = new Set<number>()

  const isReady = ref(false)
  const isComplete = ref(false)
  const loadProgress = ref(0)

  const total = variant.frameCount
  let currentIndex = 0
  let disposed = false
  let loadedCount = 0

  function frameUrl(index: number) {
    return buildFramePath(variant.path, index)
  }

  async function fetchFrame(index: number): Promise<SequenceFrame | null> {
    const url = frameUrl(index)
    try {
      if (typeof createImageBitmap === 'function') {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        if (disposed) return null
        return await createImageBitmap(blob)
      }
      return await loadImageElement(url)
    } catch {
      failed.add(index)
      return null
    }
  }

  function evictIfNeeded() {
    if (cache.size <= SEQUENCE_PRELOAD.maxCachedFrames) return
    const evictable = [...cache.keys()]
      .filter((i) => !pinned.has(i))
      .sort((a, b) => Math.abs(b - currentIndex) - Math.abs(a - currentIndex))
    while (cache.size > SEQUENCE_PRELOAD.maxCachedFrames && evictable.length) {
      const idx = evictable.shift()!
      const frame = cache.get(idx)
      if (frame && hasClose(frame)) frame.close()
      cache.delete(idx)
    }
  }

  async function loadIndex(index: number) {
    if (disposed || cache.has(index) || inFlight.has(index) || failed.has(index)) return
    inFlight.add(index)
    const frame = await fetchFrame(index)
    inFlight.delete(index)
    if (disposed) {
      if (frame && hasClose(frame)) frame.close()
      return
    }
    if (frame) {
      cache.set(index, frame)
      loadedCount++
      loadProgress.value = Math.min(1, loadedCount / total)
      evictIfNeeded()
    }
  }

  async function runPool(indices: number[]) {
    let cursor = 0
    async function worker() {
      while (cursor < indices.length && !disposed) {
        const i = indices[cursor++]!
        await loadIndex(i)
      }
    }
    await Promise.all(Array.from({ length: SEQUENCE_PRELOAD.concurrency }, worker))
  }

  function getFrame(index: number): SequenceFrame | null {
    const clamped = Math.min(total - 1, Math.max(0, index))
    const exact = cache.get(clamped)
    if (exact) return exact

    if (!disposed) void loadIndex(clamped)

    let bestIndex = -1
    let bestDist = Infinity
    for (const i of cache.keys()) {
      const d = Math.abs(i - clamped)
      if (d < bestDist) {
        bestDist = d
        bestIndex = i
      }
    }
    return bestIndex >= 0 ? cache.get(bestIndex)! : null
  }

  function setActiveIndex(index: number) {
    currentIndex = Math.min(total - 1, Math.max(0, index))
  }

  async function start() {
    const critical: number[] = []
    for (let i = 0; i < total; i += SEQUENCE_PRELOAD.criticalStep) critical.push(i)
    if (critical[critical.length - 1] !== total - 1) critical.push(total - 1)
    critical.forEach((i) => pinned.add(i))

    await runPool(critical)
    if (disposed) return
    isReady.value = true

    const rest: number[] = []
    for (let i = 0; i < total; i++) if (!cache.has(i)) rest.push(i)
    await runPool(rest)
    if (disposed) return
    isComplete.value = true
  }

  function dispose() {
    disposed = true
    for (const frame of cache.values()) {
      if (hasClose(frame)) frame.close()
    }
    cache.clear()
    pinned.clear()
    inFlight.clear()
  }

  return { isReady, isComplete, loadProgress, getFrame, setActiveIndex, start, dispose }
}
