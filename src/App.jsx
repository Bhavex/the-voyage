import { useState } from 'react'
import World from './world/World'
import Overlay from './ui/Overlay'

export default function App() {
  const [sailing, setSailing] = useState(false)

  return (
    <main className="app">
      <World view={sailing ? 'deck' : 'intro'} />
      <Overlay sailing={sailing} onSetSail={() => setSailing(true)} />
    </main>
  )
}
