/**
 * Central tuning file for the scroll-driven image-sequence construction
 * experience. Swapping in real renders, changing frame counts, or retuning
 * preload behavior should only ever require editing values here.
 */

export type SequenceVariantId = 'desktop' | 'mobile'

export interface SequenceVariantConfig {
  id: SequenceVariantId
  /** Total number of frames in this variant's sequence. */
  frameCount: number
  /** Path pattern for a frame file. `{index}` is replaced with a zero-padded, 1-based frame number. */
  path: string
  /** Native resolution the frames were exported at (used for aspect-ratio hints, not required at runtime). */
  width: number
  height: number
}

export const SEQUENCE_VARIANTS: Record<SequenceVariantId, SequenceVariantConfig> = {
  desktop: {
    id: 'desktop',
    frameCount: 13,
    path: '/sequence/desktop/frame-{index}.webp',
    width: 2400,
    height: 1309
  },
  mobile: {
    id: 'mobile',
    frameCount: 13,
    path: '/sequence/mobile/frame-{index}.webp',
    width: 1200,
    height: 655
  }
}

/** Builds the file path for a 0-based frame index, e.g. index 8 -> "frame-009.webp". */
export function buildFramePath(pattern: string, index: number): string {
  const padded = String(index + 1).padStart(3, '0')
  return pattern.replace('{index}', padded)
}

/** Preload tuning. */
export const SEQUENCE_PRELOAD = {
  /** Every Nth frame is loaded first so the full range has coverage before the rest fills in. */
  criticalStep: 4,
  /** Max parallel in-flight frame requests. */
  concurrency: 6,
  /** Max decoded frames kept resident at once; farthest-from-current are evicted first. */
  maxCachedFrames: 48
} as const
