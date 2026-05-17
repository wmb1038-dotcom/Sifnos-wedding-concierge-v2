import sharp from '../node_modules/sharp/lib/index.js'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SRC = 'C:/Users/wmb10/Downloads/Gemini_Generated_Image_owvny7owvny7owvn.png'
const OUT_DIR = 'D:/sifnos-wedding-concierge-v2/public/images'

mkdirSync(OUT_DIR, { recursive: true })

// First, get metadata
const meta = await sharp(SRC).metadata()
console.log(`Source: ${meta.width}x${meta.height}`)

const W = meta.width
const H = meta.height

// Copy original
copyFileSync(SRC, `${OUT_DIR}/cleo-avatar.png`)
console.log('Copied original to public/images/cleo-avatar.png')

// Crop: center-x, top 78% of image height, square crop
// The dog's face occupies the top portion; the floral banner is at ~75-80% height
// We want a square that captures face + banner comfortably
const cropH = Math.round(H * 0.82)  // take 82% of height to include banner
const cropW = Math.min(W, cropH)     // square crop
const cropX = Math.round((W - cropW) / 2)  // centered horizontally
const cropY = 0                             // from top

console.log(`Crop: ${cropW}x${cropH} at (${cropX}, ${cropY})`)

// Generate 96x96 PNG (sm avatar)
await sharp(SRC)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(96, 96)
  .png({ compressionLevel: 9 })
  .toFile(`${OUT_DIR}/cleo-96.png`)
console.log('Generated cleo-96.png')

// Generate 96x96 WebP
await sharp(SRC)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(96, 96)
  .webp({ quality: 85 })
  .toFile(`${OUT_DIR}/cleo-96.webp`)
console.log('Generated cleo-96.webp')

// Generate 256x256 PNG (lg avatar)
await sharp(SRC)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(256, 256)
  .png({ compressionLevel: 9 })
  .toFile(`${OUT_DIR}/cleo-256.png`)
console.log('Generated cleo-256.png')

// Generate 256x256 WebP
await sharp(SRC)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(256, 256)
  .webp({ quality: 85 })
  .toFile(`${OUT_DIR}/cleo-256.webp`)
console.log('Generated cleo-256.webp')

console.log('Done.')
