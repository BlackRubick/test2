#!/usr/bin/env node
/**
 * Imports a numbered set of real (or AI-generated) construction-sequence
 * photos from a source folder into public/sequence/{desktop,mobile}/,
 * re-encoding to WebP at the resolutions declared in sequence-config.ts.
 *
 * Source files must be named 1.<ext> .. N.<ext> (any common raster
 * extension), matching the order the construction stages were generated in.
 *
 * Usage: node scripts/import-sequence.mjs <source-dir>
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_SEQUENCE_DIR = path.join(__dirname, '..', 'public', 'sequence')

// Source stills from image-gen models (Gemini/Nano Banana, etc.) typically
// cap out around 1400px on the long edge. We upscale past that with a
// Lanczos3 kernel (sharper than the browser's own upscale) so the canvas
// has to stretch the image less at large/retina viewport sizes.
const DESKTOP_WIDTH = 2400
const MOBILE_WIDTH = 1200
// Blurred backdrop shown behind the contain-fit mobile frame (letterbox
// fill). Pre-baked at build time — a live `ctx.filter` blur on every scroll
// tick is expensive and inconsistently supported on mobile browsers.
const MOBILE_BG_WIDTH = 500
const MOBILE_BG_BLUR = 24
const MOBILE_BG_BRIGHTNESS = 0.5

async function main() {
  const sourceDir = process.argv[2]
  if (!sourceDir) {
    console.error('Usage: node scripts/import-sequence.mjs <source-dir>')
    process.exit(1)
  }

  const files = await readdir(sourceDir)
  const numbered = files
    .map((f) => {
      const match = f.match(/^(\d+)\.(jpe?g|png|webp)$/i)
      return match ? { file: f, index: Number(match[1]) } : null
    })
    .filter((f) => f !== null)
    .sort((a, b) => a.index - b.index)

  if (numbered.length === 0) {
    console.error(`No numbered image files (1.jpg, 2.jpg, ...) found in ${sourceDir}`)
    process.exit(1)
  }

  console.log(`Found ${numbered.length} frames. Importing...`)

  await mkdir(path.join(PUBLIC_SEQUENCE_DIR, 'desktop'), { recursive: true })
  await mkdir(path.join(PUBLIC_SEQUENCE_DIR, 'mobile'), { recursive: true })
  await mkdir(path.join(PUBLIC_SEQUENCE_DIR, 'mobile-bg'), { recursive: true })

  for (let i = 0; i < numbered.length; i++) {
    const srcPath = path.join(sourceDir, numbered[i].file)
    const outName = `frame-${String(i + 1).padStart(3, '0')}.webp`

    await sharp(srcPath)
      .resize({ width: DESKTOP_WIDTH, kernel: sharp.kernel.lanczos3 })
      .sharpen()
      .webp({ quality: 88 })
      .toFile(path.join(PUBLIC_SEQUENCE_DIR, 'desktop', outName))

    await sharp(srcPath)
      .resize({ width: MOBILE_WIDTH, kernel: sharp.kernel.lanczos3 })
      .sharpen()
      .webp({ quality: 85 })
      .toFile(path.join(PUBLIC_SEQUENCE_DIR, 'mobile', outName))

    await sharp(srcPath)
      .resize({ width: MOBILE_BG_WIDTH })
      .blur(MOBILE_BG_BLUR)
      .modulate({ brightness: MOBILE_BG_BRIGHTNESS })
      .webp({ quality: 60 })
      .toFile(path.join(PUBLIC_SEQUENCE_DIR, 'mobile-bg', outName))

    process.stdout.write(`\r${i + 1}/${numbered.length}`)
  }
  console.log(`\nImported ${numbered.length} frames into public/sequence/{desktop,mobile}/`)
  console.log(`Update SEQUENCE_VARIANTS.desktop/mobile.frameCount to ${numbered.length} in app/utils/sequence-config.ts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
