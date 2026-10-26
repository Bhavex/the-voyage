import World from './world/World'
import Overlay from './ui/Overlay'
import IslandOverlay from './ui/IslandOverlay'
import useVoyage from './useVoyage'

export default function App() {
  const game = useVoyage()
  return (
    <main className="app">
      <World game={game} />
      <Overlay status={game.status} sailing={game.mode !== 'intro'} showControls={game.mode === 'sailing'} onSetSail={() => game.changeMode('sailing')} />
      <IslandOverlay game={game} />
    </main>
  )
}
