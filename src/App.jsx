import { useRef, useState } from 'react'
import World from './world/World'
import Overlay from './ui/Overlay'
import { createSailingState } from './world/sailing'

export default function App() {
  const [sailing, setSailing] = useState(false)
  const ship = useRef(createSailingState())
  const [status, setStatus] = useState({ sailLevel: 0, returning: false, island: '' })

  return (
    <main className="app">
      <World view={sailing ? 'deck' : 'intro'} ship={ship} onStatus={setStatus} />
      <Overlay status={status} sailing={sailing} onSetSail={() => setSailing(true)} />
    </main>
  )
}
