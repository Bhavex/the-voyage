import { useEffect, useState } from 'react'
import { LANDMARKS } from '../world/film/layout'

function actionFor(id, game) {
  if (id === 'rack' && game.reel !== 'rack') return null
  if (id === 'projector') return ['playing', 'paused', 'ended', 'soon', 'blocked', 'loading'].includes(game.film) ? (game.touch ? 'Stop' : 'Stop film') : game.touch ? 'Play' : game.reel === 'loaded' ? 'Play film' : 'Load reel and play'
  return LANDMARKS.find((landmark) => landmark.id === id)?.[game.touch ? 'action' : 'prompt']
}

export default function IslandOverlay({ game }) {
  const [sound, setSound] = useState(false)
  const [soundInvitation, setSoundInvitation] = useState(false)
  useEffect(() => {
    if (game.touch || game.film !== 'playing' || !game.videoRef.current?.muted) { setSoundInvitation(false); return }
    setSoundInvitation(true)
    const timer = setTimeout(() => setSoundInvitation(false), 6000)
    return () => clearTimeout(timer)
  }, [game.touch, game.film, game.videoRef])
  const id = game.touch ? game.focus : game.nearby
  const action = actionFor(id, game)
  const toggleSound = () => {
    if (!game.videoRef.current) return
    game.videoRef.current.muted = sound
    setSound(!sound)
    setSoundInvitation(false)
  }
  return <>
    {game.mode === 'sailing' && !game.touch && <div ref={game.bearingElement} className="film-bearing" aria-label="Direction to Film Island">
      <span className="film-bearing-arrow" aria-hidden="true">↑</span><span>Film Island</span>
    </div>}
    {game.mode === 'sailing' && game.touch && <button className="visit-island btn-primary" onClick={() => game.changeMode('arrival')}>Visit Film Island</button>}
    {game.mode === 'arrival' && <div className="arrival-card arrival-card-corner">
      <p className="eyebrow">A story on the shore</p>
      <h2 className="arrival-title">Film Island</h2>
      <p>Home of Qile Ki Kasak</p>
      <button className="btn-quiet" onClick={() => game.changeMode('disembark')}>Skip arrival · Space</button>
    </div>}
    {['disembark', 'departure'].includes(game.mode) && <p className="phase-note" role="status">{game.mode === 'disembark' ? 'Coming ashore…' : 'Back to the sea…'}</p>}
    {game.mode === 'island' && <>
      <div className="island-heading"><span className="eyebrow">The Voyage</span><h2>Film Island</h2>{!game.touch && <p className="objective-line" role="status">{game.objective.text}</p>}</div>
      {game.touch ? <nav className="landmark-nav" aria-label="Film Island landmarks">
        {LANDMARKS.map((landmark) => <button key={landmark.id} className={game.focus === landmark.id ? 'is-selected' : ''}
          aria-pressed={game.focus === landmark.id} onClick={() => game.setFocus(landmark.id)}>{landmark.name}</button>)}
      </nav> : <p className="walking-hint">WASD walk · Shift run · Drag to look · E interact</p>}
      {action && !game.awardOpen && <button className="interaction-prompt" onClick={() => game.interact(id)}>
        {!game.touch && <><kbd>E</kbd> –</>} {action}
      </button>}
      {game.reel === 'carrying' && <p className={`inventory-note ${game.touch ? '' : 'inventory-note-desktop'}`}>Carrying The Director</p>}
      {game.message && <p className="island-message" role="status">{game.message}</p>}
      {soundInvitation && <button className="sound-invitation btn-primary" onClick={toggleSound}>Turn on sound</button>}
      {['playing', 'paused', 'ended', 'soon', 'loading', 'blocked'].includes(game.film) && <div className="film-controls">
        <span>The Director</span>
        {['playing', 'paused'].includes(game.film) && <button onClick={toggleSound}>{sound ? 'Mute' : game.touch ? 'Enable sound' : 'Turn on sound'}</button>}
        {game.film === 'playing' && <button onClick={() => game.setFilm('paused')}>Pause</button>}
        {['paused', 'blocked'].includes(game.film) && <button onClick={() => game.videoRef.current?.play().then(() => game.setFilm('playing')).catch(() => game.setFilm('blocked'))}>Play</button>}
        {['playing', 'paused', 'ended', 'blocked'].includes(game.film) && <button onClick={game.playFilm}>Replay</button>}
        <button onClick={() => game.setFilm('stopped')}>Stop film</button>
      </div>}
    </>}

  </>
}
