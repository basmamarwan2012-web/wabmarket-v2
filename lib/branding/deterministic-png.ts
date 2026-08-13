import { deflateSync } from 'node:zlib'

const TABLE = Object.freeze(Array.from({ length: 256 }, (_, value) => {
  let crc = value
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
}))

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff
  for (const byte of bytes) crc = TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

const uint32 = (value: number) => new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255])
const concat = (...arrays: readonly Uint8Array[]) => {
  const output = new Uint8Array(arrays.reduce((sum, item) => sum + item.length, 0)); let offset = 0
  for (const item of arrays) { output.set(item, offset); offset += item.length }
  return output
}
const chunk = (type: string, data: Uint8Array) => {
  const name = new TextEncoder().encode(type)
  return concat(uint32(data.length), name, data, uint32(crc32(concat(name, data))))
}

export interface RgbaRaster {
  readonly width: number
  readonly height: number
  readonly pixels: Uint8Array
}

export const createRgbaRaster = (width: number, height: number, color: readonly [number, number, number, number]): RgbaRaster => {
  const pixels = new Uint8Array(width * height * 4)
  for (let offset = 0; offset < pixels.length; offset += 4) pixels.set(color, offset)
  return { width, height, pixels }
}

export const fillRect = (raster: RgbaRaster, x: number, y: number, width: number, height: number, color: readonly [number, number, number, number]) => {
  for (let py = Math.max(0, y); py < Math.min(raster.height, y + height); py += 1)
    for (let px = Math.max(0, x); px < Math.min(raster.width, x + width); px += 1)
      raster.pixels.set(color, (py * raster.width + px) * 4)
}

export const fillCircle = (raster: RgbaRaster, cx: number, cy: number, radius: number, color: readonly [number, number, number, number]) => {
  const squared = radius * radius
  for (let y = Math.max(0, cy - radius); y < Math.min(raster.height, cy + radius); y += 1)
    for (let x = Math.max(0, cx - radius); x < Math.min(raster.width, cx + radius); x += 1)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= squared) raster.pixels.set(color, (y * raster.width + x) * 4)
}

export const encodePng = (raster: RgbaRaster) => {
  const rowSize = raster.width * 4
  const scanlines = new Uint8Array((rowSize + 1) * raster.height)
  for (let row = 0; row < raster.height; row += 1) scanlines.set(raster.pixels.slice(row * rowSize, (row + 1) * rowSize), row * (rowSize + 1) + 1)
  const header = concat(uint32(raster.width), uint32(raster.height), new Uint8Array([8, 6, 0, 0, 0]))
  return concat(new Uint8Array([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(scanlines, { level: 9 })), chunk('IEND', new Uint8Array()))
}
