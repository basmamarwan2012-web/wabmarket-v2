import type { DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import type { BrandIdentity } from './brand-identity.types'
import type { BrandAssetGenerator, GeneratedBrandAsset } from './brand-asset-generator.types'
import { createRgbaRaster, encodePng, fillCircle, fillRect } from './deterministic-png'

const hex = (value: string): [number, number, number, number] => [Number.parseInt(value.slice(1,3),16), Number.parseInt(value.slice(3,5),16), Number.parseInt(value.slice(5,7),16), 255]
const dimensions: Readonly<Record<DomainAssetKind, readonly [number, number]>> = Object.freeze({ LOGO: [512,512], FAVICON: [64,64], OPEN_GRAPH_IMAGE: [1200,630] })

const drawGlyph = (raster: ReturnType<typeof createRgbaRaster>, character: string, x: number, y: number, size: number, color: [number,number,number,number]) => {
  const bits = character.charCodeAt(0)
  for (let row = 0; row < 5; row += 1) for (let column = 0; column < 4; column += 1)
    if (((bits >>> ((row * 4 + column) % 8)) & 1) === 1 || row === 4) fillRect(raster, x + column * size, y + row * size, size - 1, size - 1, color)
}
const drawIdentity = (identity: BrandIdentity, kind: DomainAssetKind) => {
  const [width,height] = dimensions[kind], background=hex(identity.paletteProfile.background), foreground=hex(identity.paletteProfile.foreground), accent=hex(identity.paletteProfile.accent)
  const raster=createRgbaRaster(width,height,background), unit=Math.max(3,Math.floor(Math.min(width,height)/18)), radius=Math.floor(Math.min(width,height)*0.3)
  fillCircle(raster, kind==='OPEN_GRAPH_IMAGE'?240:Math.floor(width/2), Math.floor(height/2), radius, accent)
  const letters=identity.monogram.slice(0,2), originX=(kind==='OPEN_GRAPH_IMAGE'?240:width/2)-letters.length*2.2*unit, originY=height/2-2.5*unit
  letters.split('').forEach((letter,index)=>drawGlyph(raster,letter,Math.round(originX+index*5*unit),Math.round(originY),unit,foreground))
  if (kind==='OPEN_GRAPH_IMAGE') {
    const bars=Math.min(12,identity.hostname.length); for(let i=0;i<bars;i+=1) fillRect(raster,520+i*42,270+(i%2)*18,28,28,foreground)
    fillRect(raster,520,370,Math.min(560,identity.hostname.length*22),8,accent)
  }
  return encodePng(raster)
}

export class DeterministicBrandAssetGenerator implements BrandAssetGenerator {
  generate(identity: BrandIdentity, kind: DomainAssetKind): GeneratedBrandAsset {
    const [width,height]=dimensions[kind]
    return Object.freeze({ kind, source:'DETERMINISTIC', mimeType:'image/png', width, height, identitySeed:identity.seed, contents:drawIdentity(identity,kind) })
  }
}
