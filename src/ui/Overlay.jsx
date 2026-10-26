import { useEffect, useState } from 'react'
import { SAIL_NAMES } from '../world/sailing'

export default function Overlay({ sailing, onSetSail, status }) {
  const [quickNote, setQuickNote] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [hintRound, setHintRound] = useState(0)
  const [touch, setTouch] = useState(() => navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches)
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setTouch(navigator.maxTouchPoints > 0 || query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!sailing) return
    const hide = window.setTimeout(() => setHintVisible(false), 8000)
    return () => window.clearTimeout(hide)
  }, [sailing, hintRound])
  useEffect(() => {
    if (!sailing) return
    const show = (event) => {
      if (event.code !== 'KeyH' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      setHintVisible(true)
      setHintRound((round) => round + 1)
    }
    window.addEventListener('keydown', show)
    return () => window.removeEventListener('keydown', show)
  }, [sailing])

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
      <div className={`deck-hint ${sailing && hintVisible ? 'is-shown' : ''}`} aria-hidden={!sailing || !hintVisible}>
        {touch ? <p>Sailing works best on a computer for now</p> : <>
          <p>A / D or drag the wheel to steer.</p>
          <p>W raises sail · S lowers sail · Left-drag sea to look.</p>
          <p className="sail-setting" role="status">Sail: {SAIL_NAMES[status.sailLevel]}</p>
        </>}
      </div>
      {sailing && !touch && !hintVisible && <p className="hint-reminder">Press H for controls</p>}
    </>
  )
}
