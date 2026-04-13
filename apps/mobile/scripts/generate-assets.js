/**
 * Genera assets placeholder para Velunisa Mobile
 * Ejecutar: node scripts/generate-assets.js
 *
 * Reemplaza los archivos generados por imágenes reales de la marca antes de publicar.
 *
 * Tamaños requeridos:
 *   icon.png            — 1024×1024 (icono de la app, esquinas redondeadas las hace el SO)
 *   adaptive-icon.png   — 1024×1024 (primer plano del icono adaptativo Android)
 *   splash.png          — 1284×2778 (pantalla de carga, se escala con resizeMode:contain)
 *   notification-icon.png — 96×96 (icono en la barra de notificaciones, fondo transparente, solo blanco)
 *   favicon.png         — 48×48 (para web preview)
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const ASSETS_DIR = path.join(__dirname, '../assets')
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true })

function saveCanvas(canvas, filename) {
  const buf = canvas.toBuffer('image/png')
  const filePath = path.join(ASSETS_DIR, filename)
  fs.writeFileSync(filePath, buf)
  console.log(`✅  ${filename} (${canvas.width}×${canvas.height})`)
}

/** Icono principal de la app — fondo crema, letra V estilizada */
function makeIcon(size, filename) {
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  // Fondo
  ctx.fillStyle = '#F7F3EF'
  ctx.fillRect(0, 0, size, size)
  // Círculo decorativo
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2)
  ctx.fillStyle = '#4F5353'
  ctx.fill()
  // Letra V
  ctx.fillStyle = '#F7F3EF'
  ctx.font = `bold ${size * 0.42}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('V', size / 2, size * 0.52)
  saveCanvas(c, filename)
}

/** Splash screen — fondo claro, logo centrado */
function makeSplash() {
  const w = 1284, h = 2778
  const c = createCanvas(w, h)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#F7F3EF'
  ctx.fillRect(0, 0, w, h)
  // Nombre de la marca
  ctx.fillStyle = '#4F5353'
  ctx.font = `bold ${w * 0.14}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Velunisa', w / 2, h / 2 - h * 0.04)
  ctx.font = `${w * 0.05}px sans-serif`
  ctx.fillStyle = '#9C8C80'
  ctx.fillText('Wax Melts Artesanales', w / 2, h / 2 + h * 0.04)
  saveCanvas(c, 'splash.png')
}

/** Ícono de notificación — fondo transparente, forma blanca */
function makeNotificationIcon() {
  const size = 96
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${size * 0.6}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('V', size / 2, size * 0.52)
  saveCanvas(c, 'notification-icon.png')
}

/** Favicon pequeño */
function makeFavicon() {
  const size = 48
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#4F5353'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#F7F3EF'
  ctx.font = `bold ${size * 0.6}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('V', size / 2, size * 0.52)
  saveCanvas(c, 'favicon.png')
}

try {
  makeIcon(1024, 'icon.png')
  makeIcon(1024, 'adaptive-icon.png')
  makeSplash()
  makeNotificationIcon()
  makeFavicon()
  console.log('\n✨ Assets generados en apps/mobile/assets/')
  console.log('   Reemplaza con imágenes de marca real antes de publicar en Play Store.')
} catch (e) {
  console.error('Error generando assets. Instala canvas: npm install canvas')
  console.error(e.message)
  process.exit(1)
}
