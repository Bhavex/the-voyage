export function filmObjective(reel, film, watched) {
  if (reel === 'rack') return { landmark: 'rack', text: 'Find the film reel' }
  if (reel === 'carrying') return { landmark: 'projector', text: 'Take the reel to the projector booth' }
  if (watched && !['loading', 'playing', 'blocked', 'soon'].includes(film)) return { landmark: 'lighthouse', text: 'Visit the lighthouse' }
  return { landmark: 'projector', text: 'Watch Qile Ki Kasak' }
}
