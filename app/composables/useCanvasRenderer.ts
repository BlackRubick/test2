const MAX_DEVICE_PIXEL_RATIO = 2

export interface CoverRect {
  sx: number
  sy: number
  sw: number
  sh: number
  dx: number
  dy: number
  dw: number
  dh: number
}

export type FitMode = 'cover' | 'contain'

/**
 * Computes the source-crop / destination-fill rectangle pair for an
 * `object-fit: cover`-equivalent draw: the image is scaled to fill the
 * destination completely and cropped on whichever axis overflows, never
 * stretched.
 */
export function computeCoverRect(srcW: number, srcH: number, dstW: number, dstH: number): CoverRect {
  const srcRatio = srcW / srcH
  const dstRatio = dstW / dstH

  let sx = 0
  let sy = 0
  let sw = srcW
  let sh = srcH

  if (srcRatio > dstRatio) {
    sw = srcH * dstRatio
    sx = (srcW - sw) / 2
  } else {
    sh = srcW / dstRatio
    sy = (srcH - sh) / 2
  }

  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: dstW, dh: dstH }
}

/**
 * `object-fit: contain`-equivalent draw: the whole source image is scaled
 * down to fit inside the destination, letterboxed, never cropped. Used on
 * mobile where the sequence photos are landscape but the viewport is
 * portrait — cropping to cover would cut the house out of frame.
 */
export function computeContainRect(srcW: number, srcH: number, dstW: number, dstH: number): CoverRect {
  const scale = Math.min(dstW / srcW, dstH / srcH)
  const dw = srcW * scale
  const dh = srcH * scale
  return { sx: 0, sy: 0, sw: srcW, sh: srcH, dx: (dstW - dw) / 2, dy: (dstH - dh) / 2, dw, dh }
}

function frameSize(source: CanvasImageSource): { w: number; h: number } {
  if ('naturalWidth' in source) return { w: source.naturalWidth, h: source.naturalHeight }
  if ('width' in source && 'height' in source) {
    return { w: source.width as number, h: source.height as number }
  }
  return { w: 0, h: 0 }
}

/**
 * Owns the single <canvas> used to render the sequence. Draws are cheap
 * (one drawImage per call) and only happen when the caller asks — there is
 * no internal render loop, since ScrollTrigger's onUpdate already ticks at
 * the browser's frame rate.
 */
export function useCanvasRenderer() {
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let lastRedraw: (() => void) | null = null
  let fitMode: FitMode = 'cover'

  function attach(el: HTMLCanvasElement, options?: { fit?: FitMode }) {
    canvas = el
    ctx = el.getContext('2d', { alpha: false })
    if (options?.fit) fitMode = options.fit
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }
    resize()
  }

  function resize() {
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    lastRedraw?.()
  }

  function paintBackground(background: CanvasImageSource | undefined) {
    if (!canvas || !ctx) return
    if (background) {
      const { w: bgW, h: bgH } = frameSize(background)
      if (bgW && bgH) {
        const bgRect = computeCoverRect(bgW, bgH, canvas.width, canvas.height)
        ctx.drawImage(background, bgRect.sx, bgRect.sy, bgRect.sw, bgRect.sh, bgRect.dx, bgRect.dy, bgRect.dw, bgRect.dh)
        return
      }
    }
    // Background not loaded yet — a flat fallback beats stale/garbled pixels.
    ctx.fillStyle = '#14130F'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function paint(source: CanvasImageSource, alpha: number, background?: CanvasImageSource) {
    if (!canvas || !ctx) return
    const { w: srcW, h: srcH } = frameSize(source)
    if (!srcW || !srcH || !canvas.width || !canvas.height) return

    if (fitMode === 'contain') {
      // The letterboxed edges are filled by a pre-blurred/darkened backdrop
      // baked at build time (see scripts/import-sequence.mjs) — reads as an
      // intentional backdrop rather than a hard crop, with zero runtime
      // blur cost (a live ctx.filter blur is slow and flaky on mobile).
      if (alpha >= 1) paintBackground(background)
      const rect = computeContainRect(srcW, srcH, canvas.width, canvas.height)
      ctx.globalAlpha = alpha
      ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, rect.dx, rect.dy, rect.dw, rect.dh)
      ctx.globalAlpha = 1
      return
    }

    const rect = computeCoverRect(srcW, srcH, canvas.width, canvas.height)
    ctx.globalAlpha = alpha
    ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, rect.dx, rect.dy, rect.dw, rect.dh)
    ctx.globalAlpha = 1
  }

  /** Draws a single frame, fully opaque. */
  function drawFrame(source: CanvasImageSource, background?: CanvasImageSource) {
    lastRedraw = () => paint(source, 1, background)
    lastRedraw()
  }

  /**
   * Draws two neighboring frames cross-dissolved by `t` (0 = fully `from`,
   * 1 = fully `to`) — with only a handful of real keyframes, blending
   * between the two nearest ones as the user scrolls is what keeps the
   * sequence reading as continuous motion instead of a slideshow.
   */
  function drawBlended(
    from: CanvasImageSource,
    to: CanvasImageSource,
    t: number,
    fromBackground?: CanvasImageSource
  ) {
    lastRedraw = () => {
      paint(from, 1, fromBackground)
      if (t > 0) paint(to, t)
    }
    lastRedraw()
  }

  function dispose() {
    canvas = null
    ctx = null
    lastRedraw = null
  }

  return { attach, resize, drawFrame, drawBlended, dispose }
}
