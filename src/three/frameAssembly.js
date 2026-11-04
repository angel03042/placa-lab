import { Box3, Vector3 } from 'three'

// Fit the whole service assembly, including its nearest corners in perspective.
export function frameDesktop(mode, aspect, verticalFov) {
  const closed = mode === 'equipment'
  const raised = mode === 'released'
  const exploded = mode === 'exploded'
  const bounds = exploded
    ? new Box3(new Vector3(-4.7, 0, -4.4), new Vector3(4.1, 7.7, 4.4))
    : new Box3(new Vector3(-4.6, -.4, -5.2), new Vector3(7.5, raised ? 7.9 : 4.2, 7.4))
  const target = bounds.getCenter(new Vector3())
  const front = (closed ? new Vector3(.82, .88, 1) : new Vector3(.40, 1, raised ? .80 : .50)).normalize()
  const right = new Vector3(0, 1, 0).cross(front).normalize()
  const up = new Vector3().crossVectors(front, right)
  const slope = Math.tan(verticalFov * Math.PI / 360)
  let distance = 0
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z).sub(target)
        const fitX = Math.abs(corner.dot(right)) / (slope * aspect * .88)
        const fitY = Math.abs(corner.dot(up)) / (slope * .82)
        distance = Math.max(distance, corner.dot(front) + Math.max(fitX, fitY))
      }
    }
  }
  return { position: target.clone().addScaledVector(front, distance), target }
}
