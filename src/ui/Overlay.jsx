import { useEffect, useState } from 'react'
import { SAIL_NAMES } from '../world/sailing'

export default function Overlay({ sailing, onSetSail, status }) {
  const [quickNote, setQuickNote] = useState(false)
  const [touch, setTouch] = useState(() => navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches)
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setTouch(navigator.maxTouchPoints > 0 || query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <>
      <div className={`title-card ${sailing ? 'is-hidden' : ''}`} aria-hidden={sailing}>
        <h1 className="title">The Voyage</h1>
        <p className="subtitle">A sea of islands, each one something Bhavishya made.</p>
        <div className="actions">
          <button className="btn-primary" onClick={onSetSail} disabled={sailing}>
            Set sail
          </button>
          <button className="btn-quiet" onClick={() => setQuickNote(true)} disabled={sailing}>
            Quick voyage
          </button>
        </div>
        <p className={`note ${quickNote ? 'is-shown' : ''}`} role="status">
          The quick overview opens once the islands are built. Set sail to see the sea for now.
        </p>
      </div>

      <div className="sailing-status" aria-live="polite" aria-atomic="true">
        {sailing && status.island && <p className="island-name">{status.island}</p>}
        {sailing && status.returning && <p className="sea-warning">The sea turns rough. Head back toward the islands.</p>}
      </div>
      <div className={`deck-hint ${sailing ? 'is-shown' : ''}`} aria-hidden={!sailing}>
        {touch ? <p>Sailing works best on a computer for now</p> : <>
          <p>Hold A / D or drag the ship’s wheel left / right to steer.</p>
          <p>Press W to raise the sail, S to lower it. Move the mouse to look around.</p>
          <p className="sail-setting" role="status">Sail: {SAIL_NAMES[status.sailLevel]} · Furled / Half / Full</p>
        </>}
      </div>
    </>
  )
}
