import * as THREE from 'three'

// The tower rests on its cable-management side. X runs rear to front, and Y is
// the extraction axis of the service panel and the card in the motherboard slot.
const paint = '#34414b'
const trim = '#1e292f'
const steel = '#8e999c'
const dark = '#152026'
const copper = '#b98155'
const gpuId = 'gpu'

function rectangle(left, bottom, right, top, r = 0, hole = false) {
  const path = hole ? new THREE.Path() : new THREE.Shape()
  path.moveTo(left + r, bottom)
  path.lineTo(right - r, bottom)
  path.quadraticCurveTo(right, bottom, right, bottom + r)
  path.lineTo(right, top - r)
  path.quadraticCurveTo(right, top, right - r, top)
  path.lineTo(left + r, top)
  path.quadraticCurveTo(left, top, left, top - r)
  path.lineTo(left, bottom + r)
  path.quadraticCurveTo(left, bottom, left + r, bottom)
  path.closePath()
  return path
}

function polygon(points) {
  const shape = new THREE.Shape()
  points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y))
  shape.closePath()
  return shape
}

function circleHole(x, y, radius) {
  const path = new THREE.Path()
  path.absarc(x, y, radius, 0, Math.PI * 2, true)
  return path
}

function solid(p, parent, shape, depth, color, metal, id, position, rotation) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: false, curveSegments: 10, steps: 1,
  })
  p.resources.add(geometry)
  const mesh = p.mesh(parent, geometry, p.material(color, metal), ...position, id)
  if (rotation) mesh.rotation.set(...rotation)
  return mesh
}

// Repeated contacts, fins and fan blades share draw calls and raycast identity.
function instances(p, parent, geometry, color, metal, poses, id) {
  p.resources.add(geometry)
  const mesh = new THREE.InstancedMesh(geometry, p.material(color, metal), poses.length)
  const pose = new THREE.Object3D()
  poses.forEach(([x, y, z, angle = 0], i) => {
    pose.position.set(x, y, z)
    pose.rotation.z = angle
    pose.updateMatrix()
    mesh.setMatrixAt(i, pose.matrix)
  })
  mesh.castShadow = mesh.receiveShadow = true
  if (id) { mesh.userData.id = id; p.selectables.push(mesh) }
  parent.add(mesh)
  p.resources.add(mesh)
  return mesh
}

function ring(p, parent, point, radius, thickness, color, face, id) {
  const geometry = new THREE.TorusGeometry(radius, thickness, 6, 40)
  p.resources.add(geometry)
  const mesh = p.mesh(parent, geometry, p.material(color, .55), ...point, id)
  if (face === 'x') mesh.rotation.y = Math.PI / 2
  return mesh
}

function buildChassis(p, chassis, panel) {
  const { box, cylinder, screw, text } = p
  const back = -4.33, front = 7.12, top = -5.04, bottom = 6.95
  const floor = -.29, lip = 3.98
  const width = front - back, height = bottom - top
  const midX = (back + front) / 2, midZ = (top + bottom) / 2

  // Rolled tray edges and brass spacers meet the motherboard's four drillings.
  box(chassis, midX, floor, midZ, width, .17, height, '#737e84', null, .55, .08)
  for (const x of [-3.65, 3.65]) for (const z of [-3.95, 3.95]) {
    cylinder(chassis, x, -.102, z, .145, .204, '#b1945e', null, .65)
  }
  for (const x of [back + .04, front - .04]) {
    for (const z of [top + .05, bottom - .05]) {
      box(chassis, x, 1.84, z, .13, 4.27, .18, '#69767b', null, .6, .018)
    }
  }
  for (const z of [top, bottom]) {
    box(chassis, midX, lip, z, width, .14, .17, '#657279', null, .55)
    box(chassis, midX, floor + .08, z, width, .16, .13, '#4c5a60', null, .5)
  }
  for (const x of [back, front]) {
    box(chassis, x, lip, midZ, .17, .14, height, '#657279', null, .55)
  }

  // These skins form the tower's roof and base when the case stands upright.
  // The service opening remains unobstructed above the motherboard.
  box(chassis, midX, 1.84, top, width, 4.26, .12, paint, null, .4, .04)
  box(chassis, midX, 1.84, bottom, width, 4.26, .12, paint, null, .4, .04)
  for (const x of [back + 1.05, front - 1.05]) for (const y of [.35, 3.3]) {
    box(chassis, x, y, bottom + .17, .93, .57, .25, trim, null, .08, .09)
    box(chassis, x, y, bottom + .32, .74, .45, .09, '#30393d', null, 0, .04)
  }

  // The rear sheet has real openings, leaving the motherboard ports and the
  // graphics card bracket accessible when the camera is rotated to the rear.
  const rear = rectangle(top, floor, bottom, lip, .055)
  rear.holes.push(rectangle(-3.92, -.015, 1.77, 1.44, .035, true))
  rear.holes.push(rectangle(1.95, -.035, 3.78, 3.26, .035, true))
  rear.holes.push(rectangle(4.32, -.04, 6.61, 2.49, .04, true))
  rear.holes.push(circleHole(-2.25, 2.68, .85))
  solid(p, chassis, rear, .09, '#78868d', .65, null, [back + .03, 0, 0], [0, -Math.PI / 2, 0])
  for (const r of [.38, .62, .82]) ring(p, chassis, [back - .075, 2.68, -2.25], r, .023, '#a1acb0', 'x')
  for (const a of [-.8, .8]) {
    const brace = box(chassis, back - .05, 2.68, -2.25, .05, 1.83, .065, '#6c787b', null, .55, .02)
    brace.rotation.x = a
  }
  for (const z of [3.99, 4.16]) {
    box(chassis, back - .07, 1.64, z, .045, 2.94, .1, '#58656b', null, .6)
  }

  // A sealed power supply fills the lower rear bay. Its inlet faces outside.
  box(chassis, -2.46, 1.16, 5.51, 3.57, 2.84, 2.5, trim, null, .48, .07)
  box(chassis, back - .04, 1.19, 5.47, .10, 2.65, 2.47, '#46535a', null, .5)
  box(chassis, back - .10, 1.63, 5.45, .07, .81, 1.07, dark, null, .15, .08)
  const prongs = [[1.63, 5.16], [1.82, 5.45], [1.63, 5.74]]
  for (const [y, z] of prongs) box(chassis, back - .145, y, z, .11, .22, .055, steel, null, .7, .012)
  box(chassis, back - .11, .73, 5.06, .09, .4, .57, dark, null, .15)
  const rocker = box(chassis, back - .17, .73, 5.06, .09, .32, .45, '#465158', null, .12)
  rocker.rotation.z = -.13
  for (let i = 0; i < 6; i++) box(chassis, back - .105, .55 + i * .19, 6.12, .02, .07, .45, dark, null, 0)
  text(chassis, 'PSU  /  DC OUTPUT', -2.49, 2.59, 5.56, 2.34, .42, '#b8c3c5')

  // Front panel is pierced sheet steel with a vertical control strip.
  const face = rectangle(top - .035, floor - .035, bottom + .035, lip + .035, .1)
  for (let i = 0; i < 19; i++) {
    const z = top + 2.43 + i * .46
    face.holes.push(rectangle(z, .20, z + .17, 3.45, .075, true))
  }
  solid(p, chassis, face, .13, '#46545e', .42, null, [front + .17, 0, 0], [0, -Math.PI / 2, 0])
  box(chassis, front - .04, 1.83, 1.68, .05, 3.40, 8.9, dark, null, .15)
  const switchZ = top + .70
  const power = cylinder(chassis, front + .205, 2.85, switchZ, .29, .08, '#253238', null, .55)
  power.rotation.z = -Math.PI / 2
  ring(p, chassis, [front + .25, 2.85, switchZ], .224, .024, '#b0b9ba', 'x')
  box(chassis, front + .278, 3.02, switchZ, .024, .19, .039, '#dce4de', null, .35, .008)
  for (const y of [.91, 1.47]) {
    box(chassis, front + .185, y, switchZ, .03, .27, .68, '#8f9a9e', null, .7)
    box(chassis, front + .21, y, switchZ, .036, .19, .55, dark, null, 0)
    box(chassis, front + .236, y - .035, switchZ, .026, .042, .45, '#7294a2', null, .2, .005)
  }

  // Removable service panel. Its rolled seams and two rear thumbscrews travel
  // with this group. Slotted vents reveal the dark interior through real holes.
  const skin = rectangle(back - .025, -bottom - .035, front + .06, -top + .035, .095)
  for (let column = 0; column < 2; column++) for (let row = 0; row < 12; row++) {
    const x = back + .85 + column * 2.24, z = -.76 - row * .23
    skin.holes.push(rectangle(x, -z, x + 1.92, -z + .085, .035, true))
  }
  solid(p, panel, skin, .085, '#46535e', .48, null, [0, lip + .067, 0], [-Math.PI / 2, 0, 0])
  for (const z of [top + .15, bottom - .15]) {
    box(panel, midX, lip + .023, z, width - .46, .115, .09, '#53626d', null, .48, .017)
  }
  for (const z of [top + .45, bottom - .45]) {
    const fastener = cylinder(panel, back - .15, lip + .005, z, .14, .23, '#596870', null, .68)
    fastener.rotation.z = Math.PI / 2
    ring(p, panel, [back - .26, lip + .005, z], .10, .017, '#99a4a7', 'x')
    box(panel, back - .269, lip + .005, z, .008, .022, .13, dark, null, 0, 0)
  }
  // A recessed handle and a small badge break up the large side panel.
  box(panel, back + .51, lip + .158, 3.64, .32, .018, 2.2, '#2e3a43', null, .30, .06)
  box(panel, back + .43, lip + .179, 3.64, .13, .04, 2.0, '#637078', null, .45, .04)
  box(panel, front - 1.53, lip + .163, bottom - 1.07, 2.02, .024, .48, '#34424a', null, .58)
  text(panel, 'PLACA  /  LAB', front - 1.53, lip + .182, bottom - 1.07, 1.74, .28, '#d4d9d5')
}

function buildGraphicsCard(p, graphics) {
  const { box, cylinder, tube, text } = p
  const b = (...args) => box(graphics, ...args)
  const positions = [-2.53, -.20]
  const fanY = 1.92

  // PCB and fingers. The short and long finger groups leave the PCIe key open.
  b(-1.28, 1.82, 2.50, 5.91, 2.41, .094, '#254d43', gpuId, .15)
  const banks = [[-3.445, .48, 6], [-2.84, 2.80, 33]]
  const fingers = []
  for (const [start, width, count] of banks) {
    b(start + width / 2, .417, 2.5, width, .398, .078, '#376451', gpuId, .1, .005)
    for (const z of [2.455, 2.545]) for (let i = 0; i < count; i++) {
      fingers.push([start + (i + .5) * width / count, .349, z])
    }
  }
  instances(p, graphics, new THREE.BoxGeometry(.052, .217, .009), '#c9ae65', .72, fingers, gpuId)

  // Rear stiffener, cooler core, exposed transverse fins and two heat pipes.
  b(-1.32, 1.94, 2.38, 5.72, 2.08, .094, '#515d64', gpuId, .7, .055)
  b(-1.37, 1.92, 2.68, 5.67, 2.21, .24, '#39454a', gpuId, .58)
  const fins = Array.from({ length: 45 }, (_, i) => [-4.05 + i * .123, 1.91, 2.92])
  instances(p, graphics, new THREE.BoxGeometry(.035, 2.28, .52), '#a1aaac', .72, fins, gpuId)
  for (const z of [2.76, 2.98]) {
    tube(graphics, [[-3.96, 2.77, z], [-3.77, 2.96, z], [-3.4, 3.055, z],
      [.67, 3.055, z], [1.05, 2.91, z], [1.22, 2.71, z]], .048, copper, gpuId)
  }

  // Two true apertures in the shroud frame a pair of swept impellers.
  const outline = [
    [-4.2, .91], [-4.01, .71], [1.31, .71], [1.65, .98],
    [1.71, 2.63], [1.37, 3.13], [-3.95, 3.13], [-4.20, 2.88],
  ]
  const shroud = polygon(outline)
  for (const x of positions) shroud.holes.push(circleHole(x, fanY, .973))
  solid(p, graphics, shroud, .15, '#35424a', .38, gpuId, [0, 0, 3.18])
  for (const x of positions) {
    ring(p, graphics, [x, fanY, 3.335], .997, .035, '#738189', 'z', gpuId)
    const hub = cylinder(graphics, x, fanY, 3.31, .32, .20, '#26343c', gpuId, .3)
    hub.rotation.x = Math.PI / 2
    const cap = cylinder(graphics, x, fanY, 3.42, .20, .03, '#7d8b8e', gpuId, .72)
    cap.rotation.x = Math.PI / 2
  }
  const blade = new THREE.Shape()
  blade.moveTo(.215, -.11)
  blade.quadraticCurveTo(.51, -.23, .85, -.13)
  blade.quadraticCurveTo(.985, .02, .884, .19)
  blade.quadraticCurveTo(.57, .060, .245, .13)
  blade.closePath()
  const blades = positions.flatMap(x => Array.from({ length: 9 }, (_, i) => [x, fanY, 3.205, i * Math.PI * 2 / 9]))
  instances(p, graphics, new THREE.ExtrudeGeometry(blade, { depth: .092, bevelEnabled: false, curveSegments: 7 }),
    '#222e34', .18, blades, gpuId)

  // Readable brushed-metal side spine and a chamfered end accent.
  b(-1.45, 3.12, 2.89, 4.99, .10, .57, '#69767b', gpuId, .6, .025)
  text(graphics, 'GRAPHICS   /   PCIe', -1.43, 3.177, 2.89, 2.94, .33, '#e7e7d6', null, gpuId)
  const inset = polygon([[.88, 2.83], [1.52, 2.29], [1.53, 2.53], [1.15, 2.89]])
  solid(p, graphics, inset, .03, '#aa7956', .57, gpuId, [0, 0, 3.34])
  for (const [x, y] of [[-3.96,.94], [-3.96,2.90], [1.35,.96], [1.31,2.85]]) {
    const bolt = cylinder(graphics, x, y, 3.352, .057, .034, steel, gpuId, .8)
    bolt.rotation.x = Math.PI / 2
  }

  // Double-slot bracket, mounted against the case opening. The HDMI socket
  // has two clipped corners; the adjacent DisplayPort sockets have one each.
  const bracket = rectangle(2.08, .07, 3.69, 3.35, .045)
  const socketY = [.70, 1.56, 2.42]
  socketY.forEach((y, i) => {
    const points = [[2.37, y - .32], [2.57, y - .32], [2.66, y - .22], [2.66, y + .22],
      [i ? 2.66 : 2.57, y + .32], [2.37, y + .32]]
    const hole = new THREE.Path()
    points.forEach(([u,v], j) => j ? hole.lineTo(u,v) : hole.moveTo(u,v))
    hole.closePath()
    bracket.holes.push(hole)
    b(-4.28, y, 2.51, .22, .73, .36, dark, gpuId, .1)
    b(-4.397, y, 2.51, .015, .48, .05, '#a8a392', gpuId, .45, .005)
  })
  for (let i = 0; i < 7; i++) bracket.holes.push(rectangle(2.93, .38 + i*.37, 3.48, .51 + i*.37, .05, true))
  solid(p, graphics, bracket, .072, '#b0b8b9', .78, gpuId, [-4.402, 0, 0], [0, -Math.PI/2, 0])
  b(-4.44, 3.32, 2.87, .30, .06, 1.58, steel, gpuId, .75, .018)
  for (const z of [2.29, 3.45]) p.screw(graphics, -4.50, 3.36, z, gpuId, .064)
}

export function buildDesktopHardware({ p, chassis, panel, graphics }) {
  buildChassis(p, chassis, panel)
  buildGraphicsCard(p, graphics)
}
