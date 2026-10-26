import { lazy, Suspense, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { OPEN_SEA } from '../../config/palette'
import { FILM_ISLAND } from './layout'

const FilmIsland = lazy(() => import('./FilmIsland'))
function DistantFilm() {
  return <group name="distant_film" position={[FILM_ISLAND.position[0], 0, FILM_ISLAND.position[1]]}>
    <mesh scale={[35, 4, 28]}><sphereGeometry args={[1, 32, 16]} /><meshToonMaterial color={OPEN_SEA.fog} /></mesh>
    <mesh position={[22, 11, -8]}><cylinderGeometry args={[2, 3, 22, 24]} /><meshToonMaterial color={OPEN_SEA.cloudLight} /></mesh>
  </group>
}
export default function FilmIslandPresence({ game }) {
  const [loaded, setLoaded] = useState(false)
  useFrame(() => {
    if (loaded) return
    if (['arrival', 'disembark', 'island', 'departure'].includes(game.mode) ||
      Math.hypot(game.ship.current.x - FILM_ISLAND.position[0], game.ship.current.z - FILM_ISLAND.position[1]) < 220) setLoaded(true)
  })
  return loaded ? <Suspense fallback={<DistantFilm />}><FilmIsland game={game} /></Suspense> : <DistantFilm />
}
