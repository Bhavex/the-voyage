// Steering input must never dismiss the cinematic it just triggered.
export function canSkipArrival(code, elapsed, repeat = false) {
  return elapsed >= 1.5 && !repeat && ['Space', 'Enter', 'Escape'].includes(code)
}
