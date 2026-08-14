#!/usr/bin/env node
/**
 * Generates a placeholder image sequence for the scroll-driven construction
 * experience: a fixed-camera, flat-illustration elevation of a plot that
 * progresses from empty terrain to a finished house, in the same 8-stage
 * breakdown the real renders will follow. Purely a stand-in so the canvas
 * pipeline (preload, cover-fit, ScrollTrigger scrub) can be built and tested
 * before real architectural renders exist — swap the files in
 * public/sequence/{desktop,mobile}/ with real frames and nothing else needs
 * to change.
 *
 * Usage: node scripts/generate-placeholder-frames.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_SEQUENCE_DIR = path.join(__dirname, '..', 'public', 'sequence')

const VARIANTS = [
  { id: 'desktop', frameCount: 120, width: 1600, height: 900 },
  { id: 'mobile', frameCount: 60, width: 900, height: 1600 }
]

// ---------- small numeric helpers, mirroring the runtime easing style ----------
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (t) => t * t * (3 - 2 * t)
const seg = (p, start, end) => (end <= start ? (p >= start ? 1 : 0) : smooth(clamp01((p - start) / (end - start))))
const lerp = (a, b, t) => a + (b - a) * t

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(clamp01(v / 255) * 255).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}
function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  return rgbToHex(a.map((v, i) => lerp(v, b[i], t)))
}

// ---------- palette (matches tailwind.config.ts) ----------
const COLOR = {
  paper: '#F4F1EB',
  paperWarm: '#F6E2C8',
  paperDim: '#EAE6DC',
  paperDimWarm: '#F4E3CE',
  ink: '#14130F',
  inkSoft: '#3A382F',
  stone: '#A9A79E',
  stoneLight: '#D8D5CA',
  clay: '#A85B34',
  clayDim: '#C98B67',
  dirt: '#6B5A45',
  foliage: '#6B7358',
  concreteRaw: '#A9A79E',
  wallFinished: '#EDE9DF'
}

// Stage boundaries, as fractions of the 0-1 scroll timeline. Frame counts
// differ between variants but these fractions do not — that's what keeps
// mobile's shorter sequence narratively in sync with desktop's.
const STAGE = {
  terrainEnd: 15 / 120,
  excavationEnd: 30 / 120,
  foundationEnd: 45 / 120,
  structureEnd: 65 / 120,
  wallsEnd: 80 / 120,
  facadeEnd: 95 / 120,
  detailsEnd: 108 / 120
}

function buildSceneSVG(p, W, H) {
  const groundY = H * 0.66
  const FW = W * 0.3
  const CX = W * 0.5
  const wallH = H * 0.2
  const slabH = H * 0.025
  const pitPad = FW * 0.12

  const tReveal = seg(p, 0.92, 1)

  const tExcavate = seg(p, 0.02, STAGE.excavationEnd)
  const tPit = tExcavate * (1 - seg(p, STAGE.foundationEnd * 0.65, STAGE.foundationEnd))
  const tFound = seg(p, STAGE.excavationEnd * 0.8, STAGE.foundationEnd)

  const structureSpan = STAGE.structureEnd - STAGE.foundationEnd
  const colStep = structureSpan * 0.12
  const colDur = structureSpan * 0.55
  const columnCount = 5
  const tCols = Array.from({ length: columnCount }, (_, i) =>
    seg(p, STAGE.foundationEnd + i * colStep, STAGE.foundationEnd + i * colStep + colDur)
  )
  const tBeam = seg(p, STAGE.structureEnd - structureSpan * 0.3, STAGE.structureEnd)

  const tWalls = seg(p, STAGE.structureEnd, STAGE.wallsEnd)
  const tRoof = seg(
    p,
    STAGE.structureEnd + (STAGE.wallsEnd - STAGE.structureEnd) * 0.5,
    STAGE.wallsEnd + (STAGE.facadeEnd - STAGE.wallsEnd) * 0.4
  )

  const tGlass = seg(p, STAGE.wallsEnd, STAGE.facadeEnd)
  const tDoor = seg(p, STAGE.wallsEnd, STAGE.wallsEnd + (STAGE.facadeEnd - STAGE.wallsEnd) * 0.6)
  const tFacade = seg(p, STAGE.wallsEnd, STAGE.facadeEnd)

  const tDetails = seg(p, STAGE.facadeEnd, STAGE.detailsEnd)

  const treeCount = 2
  const tTrees = Array.from({ length: treeCount }, (_, i) => seg(p, STAGE.detailsEnd + i * 0.02, 1))
  const tPath = seg(p, STAGE.detailsEnd, STAGE.detailsEnd + (1 - STAGE.detailsEnd) * 0.6)

  const skyTop = lerpColor(COLOR.paperDim, COLOR.paperWarm, tReveal * 0.6)
  const skyBottom = lerpColor(COLOR.paper, COLOR.paperDimWarm, tReveal * 0.5)
  const groundColor = lerpColor(COLOR.paperDim, COLOR.stoneLight, 0.25 + tDetails * 0.2)
  const wallColor = lerpColor(COLOR.concreteRaw, COLOR.wallFinished, tFacade)
  const windowColor = lerpColor('#C7D0CB', COLOR.clayDim, tReveal * 0.85)

  const baseY = groundY - slabH
  const parts = []

  // sky
  parts.push(`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}" />
      <stop offset="100%" stop-color="${skyBottom}" />
    </linearGradient>
  </defs>`)
  parts.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#sky)" />`)

  // sun accent, top right — fixed presence, warms slightly at reveal
  const sunColor = lerpColor(COLOR.stoneLight, '#F2C79A', tReveal)
  parts.push(`<circle cx="${W * 0.86}" cy="${H * 0.16}" r="${H * 0.045}" fill="${sunColor}" opacity="${0.55 + tReveal * 0.25}" />`)

  // distant hill silhouette, always present, subtle
  parts.push(
    `<path d="M0 ${groundY - H * 0.03} Q ${W * 0.25} ${groundY - H * 0.08} ${W * 0.5} ${groundY - H * 0.02} T ${W} ${groundY - H * 0.04} V ${groundY} H 0 Z" fill="${COLOR.stone}" opacity="0.12" />`
  )

  // ground
  parts.push(`<rect x="0" y="${groundY}" width="${W}" height="${H - groundY}" fill="${groundColor}" />`)
  parts.push(`<rect x="0" y="${groundY}" width="${W}" height="${H * 0.006}" fill="${COLOR.stone}" opacity="0.25" />`)

  // fixed context tree, far left — sells a locked-off camera on a real plot
  parts.push(treeSVG(W * 0.09, groundY, H * 0.11, COLOR.foliage, COLOR.inkSoft, 1))

  // excavation pit + dirt piles
  if (tPit > 0.001) {
    const pitW = FW + pitPad * 2
    const pitDepth = H * 0.06 * tPit
    parts.push(
      `<rect x="${CX - pitW / 2}" y="${groundY}" width="${pitW}" height="${pitDepth}" fill="${COLOR.dirt}" opacity="${0.9}" />`
    )
    const piles = [
      [CX - pitW / 2 - W * 0.05, groundY - H * 0.02],
      [CX + pitW / 2 + W * 0.03, groundY - H * 0.015],
      [CX + pitW / 2 + W * 0.06, groundY + H * 0.01]
    ]
    for (const [px, py] of piles) {
      parts.push(`<ellipse cx="${px}" cy="${py}" rx="${W * 0.02 * tPit}" ry="${H * 0.014 * tPit}" fill="${COLOR.dirt}" opacity="${0.85 * tPit}" />`)
    }
  }

  // foundation slab
  if (tFound > 0.001) {
    const h = slabH * tFound
    parts.push(
      `<rect x="${CX - (FW + pitPad) / 2}" y="${groundY - h}" width="${FW + pitPad}" height="${h}" fill="${lerpColor(COLOR.stone, COLOR.stoneLight, tFound)}" />`
    )
  }

  // columns
  const colWidth = FW * 0.045
  tCols.forEach((t, i) => {
    if (t <= 0.001) return
    const x = CX - FW / 2 + (FW * i) / (columnCount - 1) - colWidth / 2
    const h = wallH * t
    parts.push(`<rect x="${x}" y="${baseY - h}" width="${colWidth}" height="${h}" fill="${COLOR.concreteRaw}" />`)
  })

  // beam
  if (tBeam > 0.001) {
    const w = (FW + pitPad) * tBeam
    parts.push(
      `<rect x="${CX - w / 2}" y="${baseY - wallH - H * 0.012}" width="${w}" height="${H * 0.012}" fill="${COLOR.concreteRaw}" />`
    )
  }

  // walls
  if (tWalls > 0.001) {
    const h = wallH * tWalls
    parts.push(`<rect x="${CX - FW / 2}" y="${baseY - h}" width="${FW}" height="${h}" fill="${wallColor}" />`)
  }

  // roof, slides down into place
  if (tRoof > 0.001) {
    const restY = baseY - wallH - H * 0.02
    const y = lerp(restY - H * 0.12, restY, tRoof)
    parts.push(`<rect x="${CX - (FW + pitPad) / 2}" y="${y}" width="${FW + pitPad}" height="${H * 0.018}" fill="${COLOR.inkSoft}" opacity="${tRoof}" />`)
  }

  // windows + door, cut into the wall band once it exists
  if (tWalls > 0.5) {
    const wallTop = baseY - wallH * tWalls
    const winY = wallTop + wallH * 0.18
    const winH = wallH * 0.4
    const winSlots = [-0.32, -0.1, 0.24]
    for (const slot of winSlots) {
      const winW = FW * 0.14
      const x = CX + FW * slot - winW / 2
      parts.push(`<rect x="${x}" y="${winY}" width="${winW}" height="${winH}" fill="${windowColor}" opacity="${tGlass}" />`)
    }
    if (tDoor > 0.001) {
      const doorW = FW * 0.1
      const doorH = wallH * 0.62 * tDoor
      parts.push(`<rect x="${CX + FW * 0.42 - doorW / 2}" y="${baseY - doorH}" width="${doorW}" height="${doorH}" fill="${COLOR.ink}" />`)
    }
  }

  // cladding accents
  if (tFacade > 0.001) {
    const h = wallH * 0.55 * tFacade
    parts.push(`<rect x="${CX - FW / 2 - W * 0.012}" y="${baseY - h}" width="${W * 0.008}" height="${h}" fill="${COLOR.clayDim}" opacity="${tFacade}" />`)
    parts.push(`<rect x="${CX + FW / 2 + W * 0.004}" y="${baseY - h}" width="${W * 0.008}" height="${h}" fill="${COLOR.clayDim}" opacity="${tFacade}" />`)
  }

  // warm glow behind glazing at reveal
  if (tReveal > 0.001) {
    parts.push(`<rect x="${CX - FW * 0.36}" y="${baseY - wallH * 0.62}" width="${FW * 0.72}" height="${wallH * 0.32}" fill="${COLOR.clayDim}" opacity="${tReveal * 0.3}" />`)
  }

  // landscaping: growing trees flanking the house
  const treeSpots = [CX - FW / 2 - W * 0.05, CX + FW / 2 + W * 0.05]
  tTrees.forEach((t, i) => {
    if (t <= 0.001) return
    parts.push(treeSVG(treeSpots[i], groundY, H * 0.1, COLOR.foliage, COLOR.inkSoft, t))
  })

  // stone path from the door
  if (tPath > 0.001) {
    const steps = 5
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const y = lerp(groundY + H * 0.02, groundY + H * 0.14, t)
      parts.push(`<ellipse cx="${CX + FW * 0.42}" cy="${y}" rx="${W * 0.012}" ry="${H * 0.006}" fill="${COLOR.stoneLight}" opacity="${tPath}" />`)
    }
  }

  return parts.join('\n')
}

function treeSVG(x, groundY, size, foliageColor, trunkColor, scale) {
  if (scale <= 0.001) return ''
  const trunkH = size * 0.5 * scale
  const trunkW = size * 0.08 * scale
  return `<g>
    <rect x="${x - trunkW / 2}" y="${groundY - trunkH}" width="${trunkW}" height="${trunkH}" fill="${trunkColor}" />
    <ellipse cx="${x}" cy="${groundY - trunkH - size * 0.28 * scale}" rx="${size * 0.34 * scale}" ry="${size * 0.28 * scale}" fill="${foliageColor}" />
    <ellipse cx="${x}" cy="${groundY - trunkH - size * 0.5 * scale}" rx="${size * 0.24 * scale}" ry="${size * 0.2 * scale}" fill="${foliageColor}" />
  </g>`
}

function buildFrameSVG(index, total, W, H) {
  const p = index / (total - 1)
  const body = buildSceneSVG(p, W, H)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`
}

async function generateVariant({ id, frameCount, width, height }) {
  const dir = path.join(PUBLIC_SEQUENCE_DIR, id)
  await mkdir(dir, { recursive: true })

  for (let i = 0; i < frameCount; i++) {
    const svg = buildFrameSVG(i, frameCount, width, height)
    const filename = `frame-${String(i + 1).padStart(3, '0')}.webp`
    await sharp(Buffer.from(svg)).resize(width, height).webp({ quality: 72 }).toFile(path.join(dir, filename))
    process.stdout.write(`\r${id}: ${i + 1}/${frameCount}`)
  }
  process.stdout.write('\n')
}

async function main() {
  for (const variant of VARIANTS) {
    await generateVariant(variant)
  }
  console.log('Placeholder sequence generated in public/sequence/{desktop,mobile}/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
