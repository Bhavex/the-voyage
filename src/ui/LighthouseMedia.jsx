import { useState } from 'react'
import { ISLAND_PALETTES } from '../config/palette'

function placeholder(kind) {
  const p = ISLAND_PALETTES.film.land
  const art = kind === 'certificates'
    ? `<rect x="25" y="25" width="550" height="350" fill="none" stroke="${p.wood}" stroke-width="3"/><circle cx="300" cy="130" r="44" fill="none" stroke="${p.accent}" stroke-width="8"/><path d="M278 168l-8 51 30-15 30 15-8-51" fill="${p.accent}"/><path d="M130 260h340M170 285h260M210 310h180" stroke="${p.wood}" stroke-width="5"/>`
    : `<path d="M0 270Q130 180 280 260T600 220V400H0Z" fill="${p.teal}"/><path d="M0 330Q180 260 350 310T600 290V400H0Z" fill="${p.wood}"/><circle cx="440" cy="100" r="47" fill="${p.accent}"/><path d="M180 100v145m-60-115h120m-100 45h80" stroke="${p.trim}" stroke-width="14"/>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="${p.walls}"/>${art}</svg>`)
}
export default function LighthouseMedia({ item, kind }) {
  const [failed, setFailed] = useState(false)
  return <img src={!failed && item.src ? item.src : placeholder(kind)} alt={item.caption} onError={() => setFailed(true)} draggable="false" />
}
