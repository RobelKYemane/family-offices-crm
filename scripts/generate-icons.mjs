/**
 * Generates three PWA icon PNGs from the SVG source using the `sharp` package.
 * Run: node scripts/generate-icons.mjs
 *
 * Outputs:
 *   public/icon-192.png          — 192x192 standard
 *   public/icon-512.png          — 512x512 standard
 *   public/icon-512-maskable.png — 512x512 with extra safe-zone padding (maskable)
 */

import { createRequire } from 'module'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')

// Load sharp — it must already be installed as a dev dep.
// We use createRequire so this works with ESM.
const require = createRequire(import.meta.url)

let sharp
try {
  sharp = require('sharp')
} catch {
  console.error(
    '[generate-icons] sharp not found.\n' +
    'Install it first: npm install -D sharp\n' +
    'Then re-run: node scripts/generate-icons.mjs'
  )
  process.exit(1)
}

// ---- SVG source ---------------------------------------------------------

// Standard icon: full bleed teal with "FO" wordmark
const svgStandard = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="0" fill="#0f766e"/>
  <text
    x="256"
    y="320"
    font-family="Arial, Helvetica, sans-serif"
    font-size="220"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    letter-spacing="-8"
  >FO</text>
</svg>`

// Maskable icon: safe zone = inner 80% (40px padding on each side at 512px scale)
// The coloured background must fill the full 512x512; the logo lives in the safe zone.
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f766e"/>
  <text
    x="256"
    y="310"
    font-family="Arial, Helvetica, sans-serif"
    font-size="180"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    letter-spacing="-6"
  >FO</text>
</svg>`

// ---- Generate -----------------------------------------------------------

async function generateIcon(svgString, outputPath, size) {
  const svgBuffer = Buffer.from(svgString)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath)
  console.log(`  created ${path.relative(root, outputPath)} (${size}x${size})`)
}

console.log('[generate-icons] Generating PWA icons...')

await generateIcon(svgStandard, path.join(publicDir, 'icon-192.png'), 192)
await generateIcon(svgStandard, path.join(publicDir, 'icon-512.png'), 512)
await generateIcon(svgMaskable, path.join(publicDir, 'icon-512-maskable.png'), 512)

console.log('[generate-icons] Done.')
