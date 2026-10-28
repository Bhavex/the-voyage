import { Html } from '@react-three/drei'
import { LIGHTHOUSE } from '../../config/lighthouse'
import { ISLAND_PALETTES } from '../../config/palette'
import LighthouseMedia from '../../ui/LighthouseMedia'
import { useToonPalette } from './materials'
import { Block } from './Primitives'
import { GROUND_Y } from './layout'
import { ROOM, frameSlots } from './room'

function Frame({ item, material, game }) {
  return <group name={`frame_${item.id}`} position={item.position} rotation-y={item.rotation}>
    <Block scale={[3.7, 3, 0.18]} material={material} />
    <Html transform occlude position-z={0.12} distanceFactor={4} zIndexRange={[20, 10]}>
      <button className="lighthouse-frame" aria-label={`View ${item.title}`} onClick={() => game.setViewer({ kind: item.kind, id: item.id })}>
        <LighthouseMedia item={item} kind={item.kind} />
        <span>{item.title}</span><small>{item.caption}</small>
      </button>
    </Html>
  </group>
}

export default function LighthouseRoom({ game }) {
  const m = useToonPalette(ISLAND_PALETTES.film.land)
  const rows = Math.max(Math.ceil(LIGHTHOUSE.gallery.length / 3), Math.ceil(LIGHTHOUSE.certificates.length / 2), 1)
  const height = Math.max(8, rows * 3.6 + 2)
  return <group name="lighthouse_room">
    <Block name="room_ceiling" position={[ROOM.x, GROUND_Y + height + 0.1, 0]} scale={[14, 0.3, 12]} material={m.walls} />
    <Block position={[ROOM.x, GROUND_Y - 0.18, 0]} scale={[14, 0.36, 12]} material={m.wood} />
    <Block position={[ROOM.x, GROUND_Y + 0.02, 0]} scale={[8, 0.04, 7]} material={m.terracotta} />
    <Block position={[ROOM.x, GROUND_Y + height / 2, -6]} scale={[14, height, 0.4]} material={m.walls} />
    {[-7, 7].map((x) => <Block key={x} position={[ROOM.x + x, GROUND_Y + height / 2, 0]} scale={[0.4, height, 12]} material={m.walls} />)}
    {[-4.5, 4.5].map((x) => <Block key={x} position={[ROOM.x + x, GROUND_Y + height / 2, 6]} scale={[5, height, 0.4]} material={m.walls} />)}
    {[-6.7, 6.7].map((x) => <Block key={x} position={[ROOM.x + x, GROUND_Y + 0.35, 0]} scale={[0.2, 0.7, 12]} material={m.trim} />)}
    <Block position={[ROOM.x, GROUND_Y + 0.35, -5.7]} scale={[14, 0.7, 0.2]} material={m.trim} />
    {[...frameSlots(LIGHTHOUSE.certificates, 'certificates'), ...frameSlots(LIGHTHOUSE.gallery, 'gallery')].map((item) => <Frame key={item.id} item={item} material={m.wood} game={game} />)}
    <group name="award_plaque" position={[ROOM.x + 6.7, GROUND_Y + 3.4, 0]} rotation-y={-Math.PI / 2}>
      <Block scale={[4.4, 3.8, 0.2]} material={m.accent} />
      <Html transform occlude position-z={0.13} distanceFactor={4} zIndexRange={[20, 10]}>
        <button className="room-award" onClick={() => game.setAwardOpen(true)}>
          <span className="eyebrow">INTACH Filmit India</span>
          <strong>Qile Ki Kasak</strong><span>Overall Best Film</span><small>Read the award story ↗</small>
        </button>
      </Html>
    </group>
    <Block name="room_exit_door" position={[ROOM.x, GROUND_Y + 2, 5.8]} scale={[3.2, 4, 0.2]} material={m.wood} onClick={(event) => { event.stopPropagation(); game.leaveRoom() }} />
    <Block position={[ROOM.x + 1, GROUND_Y + 1.8, 5.65]} scale={[0.15, 0.35, 0.15]} material={m.accent} />

    <hemisphereLight args={[ISLAND_PALETTES.film.land.walls, ISLAND_PALETTES.film.land.wood, 1.8]} />
  </group>
}
