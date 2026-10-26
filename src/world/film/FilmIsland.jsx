import { useEffect } from 'react'
import { useOptionalModel } from '../useOptionalModel'
import Interactable from '../Interactable'
import { BUILDINGS, FILM_ISLAND, GROUND_Y, LANDMARKS } from './layout'
import { useToonPalette } from './materials'
import { Block, Reel } from './Primitives'
import FilmScreen from './FilmScreen'

function Building({ building: b, materials: m }) {
  return <group position={[b.x, GROUND_Y, b.z]}>
    <Block name="building" position-y={b.height / 2} scale={[b.width, b.height, b.depth]} material={m.skyHorizon} />
    <Block position-y={b.height + 0.25} scale={[b.width + 1, 0.6, b.depth + 1]} material={m[b.roof]} />
    <mesh position-y={b.height + 1.1} rotation-y={Math.PI / 4} scale={[b.width * 0.8, 1, b.depth * 0.8]} material={m[b.roof]}>
      <coneGeometry args={[1, 2, 4]} />
    </mesh>
    <Block position={[0, 1.3, b.depth / 2 + 0.05]} scale={[1.5, 2.6, 0.18]} material={m.oceanDeep} />
    {[-1, 1].map((side) => <group key={side} position={[side * b.width * 0.3, b.height * 0.6, b.depth / 2 + 0.13]}>
      <Block scale={[1.3, 1.6, 0.2]} material={m[b.roof]} />
      <Block position-z={0.13} scale={[0.95, 1.25, 0.08]} material={m.sun} />
    </group>)}
  </group>
}

function Placeholder({ m, reel }) {
  return <group name="film_island_placeholder">
    <mesh name="beach" position-y={-0.2} scale={[35, 4, 28]} material={m.skyHorizon}>
      <cylinderGeometry args={[0.96, 1.07, 1, 64]} />
    </mesh>
    <mesh name="island_ground" position-y={0.8} scale={[32, 4.8, 25]} material={m.fog}>
      <cylinderGeometry args={[1, 1.05, 1, 64]} />
    </mesh>
    <mesh name="town_square" position={[0, GROUND_Y + 0.025, 0]} rotation-x={-Math.PI / 2} material={m.skyHorizon}>
      <circleGeometry args={[13, 48]} />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => <Block key={i} position={[0, GROUND_Y + 0.06, 13 + i * 2.3]} scale={[4, 0.12, 1.8]} material={m.cloudLight} />)}
    <group name="dock">
      {Array.from({ length: 14 }, (_, i) => <Block key={i} position={[0, 3, 20 + i * 1.9]} scale={[6, 0.4, 1.75]} material={m.cloudShadow} />)}
      {[24, 33, 43].flatMap((z) => [-3, 3].map((x) => <mesh key={`${x}/${z}`} position={[x, 1, z]} material={m.oceanDeep}>
        <cylinderGeometry args={[0.18, 0.24, 6, 12]} />
      </mesh>))}
    </group>
    {BUILDINGS.map((building, i) => <Building key={i} building={building} materials={m} />)}
    <group name="cinema">
      <Block position={[4, 8.4, -20]} scale={[15, 8.8, 0.65]} material={m.oceanDeep} />
      {[-3, 11].map((x) => <Block key={x} position={[x, 5.5, -20]} scale={[0.45, 5.5, 0.65]} material={m.oceanDeep} />)}
      {[-12, -8, -4].flatMap((z) => [-1, 9].map((x) => <group key={`${x}/${z}`} name="cinema_seat" position={[x, GROUND_Y, z]}>
        <Block position-y={0.75} scale={[4.2, 0.3, 1.4]} material={m.cloudShadow} />
        <Block position={[0, 1.15, 0.6]} scale={[4.2, 1.1, 0.2]} material={m.oceanDeep} />
        {[-1.5, 1.5].map((leg) => <Block key={leg} position={[leg, 0.35, 0]} scale={[0.2, 0.7, 0.8]} material={m.oceanDeep} />)}
      </group>))}
      <group name="projector_booth">
        <Block position={[4, 6, 6.5]} scale={[7, 5.5, 0.4]} material={m.fog} />
        {[0.6, 7.4].map((x) => <Block key={x} position={[x, 6, 4.2]} scale={[0.35, 5.5, 5]} material={m.skyHorizon} />)}
        <Block position={[4, 8.85, 4.2]} scale={[8, 0.5, 6]} material={m.oceanDeep} />
        <Block position={[4, 4.05, 4.8]} scale={[2.1, 1.7, 1.8]} material={m.cloudShadow} />
        <group name="projector" position={[4, 5.4, 4.8]}>
          <Block scale={[1.3, 0.9, 1.8]} material={m.oceanDeep} />
          <mesh rotation-x={Math.PI / 2} position={[0, 0, -1.05]} material={m.sun}><cylinderGeometry args={[0.26, 0.34, 0.5, 24]} /></mesh>
          <Reel position={[0, 0.7, 0.35]} material={m.cloudShadow} />
          {reel === 'loaded' && <Reel name="projector_reel" position={[0, 0.7, -0.55]} material={m.sun} />}
        </group>
      </group>
    </group>
    <group name="reel_rack" position={[-8, GROUND_Y, 8]}>
      <Block position-y={1} scale={[3.5, 2, 0.8]} material={m.oceanDeep} />
      <Block position={[0, 2, 0]} scale={[3.8, 0.18, 1]} material={m.cloudShadow} />
      {reel === 'rack' && <Reel name="reel" position={[0, 2.5, 0]} scale={1.3} material={m.sun} />}
    </group>
    <group name="lighthouse" position={[22, GROUND_Y, -8]}>
      <mesh position-y={8} material={m.cloudLight}><cylinderGeometry args={[2.1, 3, 16, 40]} /></mesh>
      {[4, 10].map((y) => <mesh key={y} position-y={y} material={m.cloudShadow}><cylinderGeometry args={[2.85 - y * 0.05, 2.9 - y * 0.05, 1.1, 40]} /></mesh>)}
      <mesh position-y={16} material={m.oceanDeep}><cylinderGeometry args={[3.2, 3.2, 0.5, 40]} /></mesh>
      <mesh position-y={17.2} material={m.sun}><cylinderGeometry args={[1.9, 1.9, 2, 32]} /></mesh>
      <mesh position-y={19} material={m.oceanDeep}><coneGeometry args={[3, 2, 40]} /></mesh>
      <Block name="lighthouse_door" position={[0, 1.7, 2.8]} scale={[1.6, 3.4, 0.25]} material={m.oceanDeep} />
      <Block position={[0, 6, 2.6]} scale={[0.8, 1.5, 0.2]} material={m.skyMid} />
    </group>
    {[[-26, 4], [-16, -16], [25, 5], [12, 18]].map(([x, z], i) => <group key={i} name="tree" position={[x, GROUND_Y, z]}>
      <mesh position-y={1.8} material={m.oceanDeep}><cylinderGeometry args={[0.18, 0.32, 3.6, 12]} /></mesh>
      <mesh position-y={4} scale={[2.6, 2.2, 2.4]} material={m.oceanMid}><sphereGeometry args={[1, 24, 16]} /></mesh>
      <mesh position={[1.3, 3.6, 0.5]} scale={[1.7, 1.5, 1.7]} material={m.oceanShallow}><sphereGeometry args={[1, 20, 12]} /></mesh>
    </group>)}
  </group>
}

export default function FilmIsland({ game }) {
  const materials = useToonPalette()
  const model = useOptionalModel('/models/film-island.glb', 'projector reel screen:mesh')
  useEffect(() => {
    const reel = model?.scene.getObjectByName('reel')
    if (reel) reel.visible = game.reel === 'rack'
  }, [model, game.reel])
  return <group name="island_film" position={[FILM_ISLAND.position[0], 0, FILM_ISLAND.position[1]]} onClick={(event) => {
    if (!game.touch) return
    let node = event.object
    while (node) {
      const id = { screen: 'projector', projector: 'projector', cinema: 'projector', projector_booth: 'projector',
        reel: 'rack', reel_rack: 'rack', lighthouse: 'lighthouse', lighthouse_door: 'lighthouse', dock: 'dock' }[node.name]
      if (id) { event.stopPropagation(); game.setFocus(id); break }
      node = node.parent
    }
  }}>
    {model ? <primitive object={model.scene} /> : <Placeholder m={materials} reel={game.reel} />}
    <FilmScreen game={game} model={model} />
    {game.mode === 'island' && LANDMARKS.map((landmark) => <Interactable key={landmark.id}
      landmark={landmark} model={model} highlighted={(game.touch ? game.focus : game.nearby) === landmark.id}
      touch={game.touch} onSelect={game.setFocus} />)}
  </group>
}
