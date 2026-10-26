import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Ocean from './Ocean'
import { oceanGridPosition } from './sailing'

export default function FollowingOcean({ ship, segments }) {
  const group = useRef()
  const size = 1600
  useFrame(() => {
    group.current.position.set(
      oceanGridPosition(ship.current.x, size, segments),
      0,
      oceanGridPosition(ship.current.z, size, segments),
    )
  }, -1)

  return <group ref={group}><Ocean size={size} segments={segments} /></group>
}
