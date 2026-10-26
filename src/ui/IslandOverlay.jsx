import { useEffect, useRef, useState } from 'react'
import { LANDMARKS } from '../world/film/layout'

function actionFor(id, game) {
  if (id === 'rack' && game.reel !== 'rack') return null
  if (id === 'projector') return ['playing', 'soon', 'loading'].includes(game.film) ? 'Stop' : 'Play'
  return LANDMARKS.find((landmark) => landmark.id === id)?.action
}

export default function IslandOverlay({ game }) {
  const dialog = useRef()
  const [sound, setSound] = useState(false)
  const id = game.touch ? game.focus : game.nearby
  const action = actionFor(id, game)
  useEffect(() => {
    if (game.awardOpen) dialog.current.showModal()
    else if (dialog.current.open) dialog.current.close()
  }, [game.awardOpen])
  const toggleSound = () => {
    if (!game.videoRef.current) return
    game.videoRef.current.muted = sound
    setSound(!sound)
  }
  return <>
    {game.mode === 'sailing' && game.touch && <button className="visit-island btn-primary" onClick={() => game.changeMode('arrival')}>Visit Film Island</button>}
    {game.mode === 'arrival' && <div className="arrival-card">
      <p className="eyebrow">A story on the shore</p>
      <h2 className="arrival-title">Film Island</h2>
      <p>Home of Qile Ki Kasak</p>
      <button className="btn-quiet" onClick={() => game.changeMode('disembark')}>Skip arrival · any key</button>
    </div>}
    {['disembark', 'departure'].includes(game.mode) && <p className="phase-note" role="status">{game.mode === 'disembark' ? 'Coming ashore…' : 'Back to the sea…'}</p>}
    {game.mode === 'island' && <>
      <div className="island-heading"><span className="eyebrow">The Voyage</span><h2>Film Island</h2></div>
      {game.touch ? <nav className="landmark-nav" aria-label="Film Island landmarks">
        {LANDMARKS.map((landmark) => <button key={landmark.id} className={game.focus === landmark.id ? 'is-selected' : ''}
          aria-pressed={game.focus === landmark.id} onClick={() => game.setFocus(landmark.id)}>{landmark.name}</button>)}
      </nav> : <p className="walking-hint">WASD walk · Shift run · Drag to look · E interact</p>}
      {action && !game.awardOpen && <button className="interaction-prompt" onClick={() => game.interact(id)}>
        {!game.touch && <kbd>E</kbd>} {action}
      </button>}
      {game.reel === 'carrying' && <p className="inventory-note">Carrying a film reel</p>}
      {game.message && <p className="island-message" role="status">{game.message}</p>}
      {['playing', 'soon', 'loading', 'blocked'].includes(game.film) && <div className="film-controls">
        <span>Qile Ki Kasak</span>
        {game.film === 'playing' && <button onClick={toggleSound}>{sound ? 'Mute' : 'Enable sound'}</button>}
        {game.film === 'blocked' && <button onClick={() => game.videoRef.current?.play().then(() => game.setFilm('playing')).catch(() => {})}>Play film</button>}
        <button onClick={() => game.setFilm('stopped')}>Stop film</button>
      </div>}
    </>}
    <dialog ref={dialog} className="award-panel" aria-labelledby="award-title" onCancel={(event) => { event.preventDefault(); game.setAwardOpen(false) }}>
      <p className="eyebrow">From the lighthouse</p>
      <h2 id="award-title">Qile Ki Kasak</h2>
      <p className="award-honour">Overall Best Film</p>
      <p>INTACH Filmit India</p>
      <p className="award-story">Qile Ki Kasak — Overall Best Film, INTACH Filmit India</p>
      <p>Bhavishya’s film received the Overall Best Film award at the national INTACH Filmit India awards. The lighthouse celebrates this chapter of his filmmaking journey.</p>
      <button className="btn-primary" onClick={() => game.setAwardOpen(false)}>Back to the island</button>
    </dialog>
  </>
}
