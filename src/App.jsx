import { ISLAND_PALETTES } from './config/palette'
import World from './world/World'
import Overlay from './ui/Overlay'
import IslandOverlay from './ui/IslandOverlay'
import LighthouseOverlay from './ui/LighthouseOverlay'
import useVoyage from './useVoyage'

export default function App() {
  const game = useVoyage()
  return (
    <main className="app" style={Object.fromEntries(Object.entries(ISLAND_PALETTES.film.land).map(([key, value]) => [`--film-${key}`, value]))}>
      <World game={game} />
      <Overlay status={game.status} sailing={game.mode !== 'intro'} showControls={game.mode === 'sailing'} onSetSail={() => game.changeMode('sailing')} />
      <IslandOverlay game={game} />
      <LighthouseOverlay game={game} />
    </main>
  )
}
