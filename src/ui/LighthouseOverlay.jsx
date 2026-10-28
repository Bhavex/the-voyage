import { useEffect, useRef } from 'react'
import { LIGHTHOUSE } from '../config/lighthouse'
import LighthouseMedia from './LighthouseMedia'

export default function LighthouseOverlay({ game }) {
  const viewer = useRef(null), award = useRef(null)
  const entries = game.viewer ? LIGHTHOUSE[game.viewer.kind] ?? [] : []
  const index = entries.findIndex((item) => item.id === game.viewer?.id)
  const item = entries[index]
  const move = (direction) => {
    const next = (index + direction + entries.length) % entries.length
    game.setViewer({ ...game.viewer, id: entries[next].id })
  }
  useEffect(() => {
    if (game.viewer) viewer.current.showModal()
    else viewer.current.close()
  }, [game.viewer])
  useEffect(() => {
    if (game.awardOpen) award.current.showModal()
    else award.current.close()
  }, [game.awardOpen])
  return <>
    {game.mode === 'lighthouse' && <>
      <div className="island-heading"><span className="eyebrow">Film Island · The lighthouse</span><h2>The trophy room</h2><p className="objective-line">The stories behind the films</p></div>
      <div className="room-actions"><button onClick={() => game.setAwardOpen(true)}>Award story</button><button onClick={game.leaveRoom}>Leave lighthouse</button></div>
      {game.touch ? <nav className="room-catalogue" aria-label="Lighthouse frames">
        {['certificates', 'gallery'].flatMap((kind) => LIGHTHOUSE[kind].map((entry) => <button key={entry.id} onClick={() => game.setViewer({ kind, id: entry.id })}>{entry.title}</button>))}
      </nav> : <p className="walking-hint">WASD walk · Drag to look · Click a frame to view</p>}
      {!game.touch && game.nearby && !game.viewer && !game.awardOpen && <button className="interaction-prompt" onClick={() => game.interact(game.nearby)}><kbd>E</kbd> – {game.nearby === 'room-exit' ? 'Leave the lighthouse' : 'Read the award'}</button>}
    </>}
    <dialog ref={viewer} className="image-viewer" aria-labelledby="image-title" onCancel={(e) => { e.preventDefault(); game.setViewer(null) }} onKeyDown={(e) => {
      if (!item || entries.length < 2) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1) }
    }}>
      {item && <>
        <div className="viewer-top"><span className="eyebrow">{game.viewer.kind === 'gallery' ? 'Behind the films' : 'From the trophy room'}</span><button onClick={() => game.setViewer(null)}>Close</button></div>
        <LighthouseMedia key={item.id} item={item} kind={game.viewer.kind} />
        <h2 id="image-title">{item.title}</h2><p>{item.caption}</p>
        {entries.length > 1 && <nav aria-label="Image navigation"><button onClick={() => move(-1)}>← Previous</button><span>{index + 1} / {entries.length}</span><button onClick={() => move(1)}>Next →</button></nav>}
      </>}
    </dialog>
    <dialog ref={award} className="award-panel" aria-labelledby="award-title" onCancel={(e) => { e.preventDefault(); game.setAwardOpen(false) }}>
      <p className="eyebrow">From the lighthouse</p><h2 id="award-title">{LIGHTHOUSE.story.title}</h2>
      <p className="award-honour">{LIGHTHOUSE.story.honour}</p><p>{LIGHTHOUSE.story.organisation}</p>
      <p className="award-story">{LIGHTHOUSE.story.text}</p>
      <button className="btn-primary" onClick={() => game.setAwardOpen(false)}>Back to the trophy room</button>
    </dialog>
  </>
}
