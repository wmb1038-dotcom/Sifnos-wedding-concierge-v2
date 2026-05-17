import sharp from '../node_modules/sharp/lib/index.js'
import { statSync } from 'fs'

const SRC = 'C:/Users/wmb10/Downloads/Gemini_Generated_Image_owvny7owvny7owvn.png'
const OUT = 'D:/sifnos-wedding-concierge-v2/public/images/cleo-256.png'
const cropX = 96, cropY = 0, cropW = 1760, cropH = 1760

await sharp(SRC)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(256, 256)
  .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 80 })
  .toFile(OUT)

console.log('cleo-256.png:', Math.round(statSync(OUT).size / 1024) + 'KB')
