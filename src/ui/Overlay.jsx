import { useState } from 'react'

export default function Overlay({ sailing, onSetSail }) {
  const [quickNote, setQuickNote] = useState(false)

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

      <p className={`deck-hint ${sailing ? 'is-shown' : ''}`} role="status">
        Move the mouse to look around. Steering comes next.
      </p>
    </>
  )
}
