/**
 * Crea assets PNG placeholder usando solo Node.js nativo (sin dependencias).
 * Genera archivos PNG válidos con color sólido.
 *
 * Ejecutar: node scripts/create-placeholder-assets.js
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const ASSETS_DIR = path.join(__dirname, '../assets')
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true })

/** Crea un PNG de color sólido sin dependencias */
function createSolidPng(width, height, r, g, b, a = 255) {
  // PNG header
  const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const crcBuf = Buffer.concat([typeBytes, data])
    let crc = 0xffffffff
    for (const byte of crcBuf) {
      crc ^= byte
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
    crc ^= 0xffffffff
    const crcOut = Buffer.alloc(4)
    crcOut.writeUInt32BE(crc >>> 0, 0)
    return Buffer.concat([len, typeBytes, data, crcOut])
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8       // bit depth
  ihdr[9] = a < 255 ? 6 : 2  // color type: 2=RGB, 6=RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // IDAT — scan lines
  const channels = a < 255 ? 4 : 3
  const row = Buffer.alloc(1 + width * channels)
  row[0] = 0  // filter type None
  for (let x = 0; x < width; x++) {
    row[1 + x * channels + 0] = r
    row[1 + x * channels + 1] = g
    row[1 + x * channels + 2] = b
    if (channels === 4) row[1 + x * channels + 3] = a
  }
  const rawData = Buffer.concat(Array(height).fill(row))
  const compressed = zlib.deflateSync(rawData, { level: 9 })

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const assets = [
  // [filename, width, height, r, g, b, alpha]
  ['icon.png',             1024, 1024, 79,  83,  83,  255],  // #4F5353 — carbón
  ['adaptive-icon.png',    1024, 1024, 247, 243, 239, 255],  // #F7F3EF — crema
  ['splash.png',           1284, 2778, 247, 243, 239, 255],  // #F7F3EF — crema
  ['notification-icon.png',  96,   96, 255, 255, 255, 0  ],  // blanco transparente
  ['favicon.png',            48,   48, 79,  83,  83,  255],  // #4F5353 — carbón
]

for (const [file, w, h, r, g, b, a] of assets) {
  const buf = createSolidPng(w, h, r, g, b, a)
  const filePath = path.join(ASSETS_DIR, file)
  fs.writeFileSync(filePath, buf)
  console.log(`✅  ${file.padEnd(26)} ${w}×${h}`)
}

console.log(`
✨  Assets placeholder creados en apps/mobile/assets/

⚠️  IMPORTANTE — Antes de publicar en Play Store reemplaza estos
    archivos por las imágenes reales del branding Velunisa:

    icon.png            → 1024×1024 — Logotipo sobre fondo crema (#F7F3EF)
    adaptive-icon.png   → 1024×1024 — Solo el símbolo (sin fondo), para Android
    splash.png          → 1284×2778 — Pantalla de carga con logotipo centrado
    notification-icon.png → 96×96  — Ícono blanco sobre fondo transparente
    favicon.png         → 48×48   — Ícono pequeño
`)
