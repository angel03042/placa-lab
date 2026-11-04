import * as THREE from 'three'

// Surface artwork, batched into one set of traces and two instanced via finishes.
export function finishBoardSurface(p, pcb, holes, laptop) {
  const annulus = new THREE.RingGeometry(.088, .165, 32)
  annulus.rotateX(-Math.PI / 2)
  p.resources.add(annulus)
  const vias = []
  for (const [x, z] of holes) {
    p.mesh(pcb, annulus, p.material('#bea776', .67), x, .117, z)
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4
      vias.push([x + .202 * Math.cos(angle), z + .202 * Math.sin(angle)])
    }
  }

  const vertices = []
  function trace(points) {
    for (let i = 1; i < points.length; i++) {
      vertices.push(points[i-1][0], .12, points[i-1][1], points[i][0], .12, points[i][1])
    }
    vias.push(points[0], points.at(-1))
  }
  const startX = laptop ? -.83 : .36
  for (let i = 0; i < 9; i++) {
    const z = (laptop ? -2.27 : -1.82) + i * .042
    const x = startX + .24 + i * .016
    // 45° segments and a meander on the path between CPU and the memory socket.
    const endX = laptop ? .64 + i * .051 : 2.36
    trace([[startX,z], [x,z], [x+.10,z+.10], [x+.19,z+.10], [x+.29,z], [x+.47,z],
      [x+.54,z-.07], [endX-.13,z-.07], [endX,z+.06]])
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  const material = new THREE.LineBasicMaterial({ color: '#538679' })
  p.resources.add(geometry)
  p.resources.add(material)
  pcb.add(new THREE.LineSegments(geometry, material))

  for (const [radius, height, color] of [[.030,.120,'#ae9b67'], [.014,.123,'#2b5148']]) {
    const disc = new THREE.CylinderGeometry(radius, radius, .004, 10)
    const dots = new THREE.InstancedMesh(disc, p.material(color, .35), vias.length)
    const matrix = new THREE.Matrix4()
    vias.forEach(([x,z], i) => dots.setMatrixAt(i, matrix.makeTranslation(x,height,z)))
    pcb.add(dots)
    p.resources.add(disc)
    p.resources.add(dots)
  }
}
