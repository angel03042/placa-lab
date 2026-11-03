import * as THREE from 'three'
import { laptopLayout } from './layout.js'

// The ribbons describe functional connections. A break between two ribbons
// separates voltage domains where the teaching model omits the converter.
const COLORS = {
  power: '#FFD15A',
  signal: '#C59EFF',
  heat: '#FF7958',
  air: '#55DEEE',
  outline: '#102334',
}

const UP = new THREE.Vector3(0, 1, 0)

function makeRoutes(device, anchor, origin) {
  const laptop = device === 'laptop'
  const [cpuX, cpuZ] = laptop ? laptopLayout.cpu : [-.6, -1.6]
  // Centre of the installed processor group (substrate plus die or IHS).
  const cpuY = laptop ? .2225 : .2825
  const point = (x, y, z) => new THREE.Vector3(x - cpuX, y - cpuY, z - cpuZ)
  const on = (id, y, dx = 0, dz = 0) => {
    const part = anchor(id)
    return part && new THREE.Vector3(part.x - origin.x + dx, y - cpuY, part.z - origin.z + dz)
  }
  const p = point
  const specs = []
  const add = (stage, role, name, points, options = {}) => {
    // Skip routes that require a part absent from this version of the model.
    if (points.every(Boolean)) specs.push({ stage, role, name, points, ...options })
  }
  const cpu = on('cpu', laptop ? .38 : .46)
  const regulator = on('vrm', .37)
  const coil = on('inductor', .53)
  const spi = on('bios', .36)

  if (laptop) {
    const input = on('input', .40)
    const fuse = on('fuse', .29)
    const mosfet = on('mosfet', .36)
    const systemRail = p(4.04, .45, -3.75)
    add(0, 'power', 'Adaptador a entrada DC', [p(5.95, .4, -5.23), input], { milestone: true })
    add(1, 'power', 'Entrada a protección', [input, p(5.95, .39, -3.2), fuse, p(5.19, .33, -3.12), mosfet], { milestone: true })
    add(2, 'power', 'Salida protegida a distribución', [mosfet, systemRail])
    add(2, 'power', 'Alimentación de espera al EC', [p(-3.4, .36, 1.28), p(-3.08, .36, 1.14), on('ec', .37)], { milestone: true })
    add(3, 'power', 'Línea principal a la etapa de regulación', [
      systemRail, p(3.35, .47, -4.04), p(-3.48, .45, -4.04),
      p(-4.03, .44, -3.48), p(-4.03, .44, -1.55), regulator,
    ])
    add(3, 'power', 'Etapa conmutada a bobina', [regulator, coil])
    add(3, 'power', 'VCORE al procesador', [coil, p(-2.62, .54, -.56), p(-1.93, .55, -1.02), cpu], { milestone: true })
    add(4, 'power', 'Rama independiente para la memoria', [systemRail, p(4.12, .44, -2.97), p(4.12, .44, -.74)])
    add(4, 'power', 'VDD de memoria a SO-DIMM', [p(3.97, .45, -.46), p(3.74, .44, -.46), on('ram', .47, .10, .1)], { milestone: true })
  } else {
    const atx = on('input', .86)
    const eps = on('cpu-input', .72)
    const standby = on('standby-control', .41)
    const button = on('power-switch', .45)
    add(0, 'power', 'ATX de espera al control de encendido', [atx, p(3.57, .85, 2.43), p(1.76, .52, 1.68), standby], { milestone: true })
    add(1, 'signal', 'Petición del botón frontal', [button, p(-.28, .53, 3.78), p(1.64, .46, 3.18), standby])
    add(1, 'signal', 'Orden PS_ON# hacia la fuente', [standby, p(1.92, .58, 1.58), p(3.85, .92, 2.65), on('input', .89, .08, -.28)], { milestone: true })
    add(2, 'power', 'Líneas principales desde ATX', [atx, p(3.46, .78, 3.61), p(1.78, .53, 3.61)], { milestone: true })
    add(3, 'power', 'EPS12V a la etapa de CPU', [eps, p(-2.54, .58, -3.8), p(-3.18, .54, -3.27), regulator])
    add(3, 'power', 'Etapa conmutada a bobina', [regulator, coil])
    add(3, 'power', 'VCORE al procesador', [coil, p(-2.24, .51, -1.85), cpu], { milestone: true })
    add(4, 'power', 'Rama independiente para la memoria', [p(1.78, .53, 3.61), p(1.9, .51, 2.68)])
    add(4, 'power', 'VDD al zócalo DIMM', [p(1.98, .50, 2.36), p(2.22, .49, 1.85), on('ram', .48, -.32, 1.35)], { milestone: true })
  }

  // The boot read is a data path through the platform controller. It is
  // highlighted at the end of the lesson, independently of the power branches.
  const controller = on('chipset', .44)
  if (laptop) {
    add(5, 'signal', 'Lectura del firmware', [spi, p(-.06, .44, .49), p(-.06, .44, -2.39), controller, cpu], { milestone: true })
  } else {
    add(5, 'signal', 'Lectura del firmware', [spi, controller, p(.32, .51, .05), p(.32, .51, -.84), cpu], { milestone: true })
  }

  const thermal = (stage, role, name, points, options = {}) =>
    add(stage, role, name, points, { kind: 'thermal', ...options })

  if (laptop) {
    thermal(0, 'heat', 'Die a placa de contacto', [p(cpuX, .26, cpuZ), p(cpuX, .52, cpuZ)], { milestone: true, markerRadius: .4 })
    // Centreline of the front flattened pipe in the installed cooling assembly.
    thermal(1, 'heat', 'Transporte por tubo de cobre', [
      p(cpuX - .15, .7, cpuZ), p(cpuX - 1.3, .7, cpuZ),
      p(cpuX - 2.2, .7, cpuZ - .6), p(-4.3, .7, -3.91), p(-6.3, .7, -3.91),
    ], { milestone: true })
    for (const x of [-6.15, -5.55, -4.95]) {
      thermal(2, 'heat', 'Tubo a aletas', [p(x, .66, -3.91), p(x, .50, -4.10), p(x, .40, -4.34)], {
        milestone: x === -5.55, markerRadius: .27,
      })
    }
    thermal(3, 'air', 'Entrada axial y salida lateral de la turbina', [
      p(-5.96, 1.73, -2.39), p(-5.96, .61, -2.39),
      p(-6.25, .51, -2.79), p(-6.18, .47, -3.40), p(-5.93, .44, -3.78),
      p(-5.93, .44, -4.36), p(-5.93, .43, -5.67),
    ], { milestone: true })
  } else {
    thermal(0, 'heat', 'IHS a interfaz y base', [p(cpuX, .34, cpuZ), p(cpuX, .62, cpuZ)], { milestone: true, markerRadius: .38 })
    thermal(1, 'heat', 'Distribución por la base metálica', [p(cpuX, .63, cpuZ), p(cpuX - .5, .63, cpuZ - .37)], { milestone: true })
    for (const dx of [-.5, .05, .60]) {
      thermal(2, 'heat', 'Base a aleta', [p(cpuX + dx, .64, cpuZ - .36), p(cpuX + dx, 1.57, cpuZ - .36)], {
        milestone: dx === .05, markerRadius: .26,
      })
    }
    // Desk fan blows down between parallel fins. Air exits the open ends
    // of their channels along Z after approaching the base of the heatsink.
    for (const side of [-1, 1]) {
      thermal(3, 'air', 'Ventilador axial hacia la placa y salida lateral', [
        p(cpuX + side * .32, 2.87, cpuZ + side * .41), p(cpuX + side * .32, 1.77, cpuZ + side * .41),
        p(cpuX + side * .32, .84, cpuZ + side * .47), p(cpuX + side * .32, .74, cpuZ + side * .78),
        p(cpuX + side * .32, .73, cpuZ + side * 1.18), p(cpuX + side * .32, .60, cpuZ + side * 1.78),
      ], { milestone: side === 1 })
    }
  }
  return specs
}

function roundedPath(points) {
  const curve = new THREE.CurvePath()
  let start = points[0]
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1]
    const corner = points[i]
    const next = points[i + 1]
    const before = previous.distanceTo(corner)
    const after = corner.distanceTo(next)
    const radius = Math.min(.40, before * .28, after * .28)
    const entry = corner.clone().lerp(previous, radius / before)
    const exit = corner.clone().lerp(next, radius / after)
    curve.add(new THREE.LineCurve3(start, entry))
    curve.add(new THREE.QuadraticBezierCurve3(entry, corner, exit))
    start = exit
  }
  curve.add(new THREE.LineCurve3(start, points.at(-1)))
  return curve
}

export function createFlowOverlay(scene) {
  const root = new THREE.Group()
  root.name = 'Flujos funcionales'
  root.visible = false
  scene.add(root)

  const shared = new Set()
  function retain(resource) { shared.add(resource); return resource }
  function ink(color, opacity = 1) {
    return retain(new THREE.MeshBasicMaterial({
      color, opacity, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    }))
  }
  const outline = ink(COLORS.outline, .93)
  const faintOutline = ink(COLORS.outline, .56)
  const palette = Object.fromEntries(['power', 'signal', 'heat', 'air'].map(role => [
    role, { active: ink(COLORS[role]), previous: ink(COLORS[role], .46) },
  ]))
  const cone = retain(new THREE.ConeGeometry(1, 1, 10))
  const haloRing = retain(new THREE.TorusGeometry(1, .16, 8, 48))
  const ring = retain(new THREE.TorusGeometry(1, .085, 8, 48))
  const sphere = retain(new THREE.SphereGeometry(1, 12, 9))
  const point = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const geometries = new Set()
  let tracks = []
  let modelDevice
  let previousKey
  let previousTime
  let phase = 0

  function mesh(parent, geometry, material, order) {
    const object = new THREE.Mesh(geometry, material)
    object.renderOrder = order
    parent.add(object)
    return object
  }

  function buildTrack(spec) {
    const group = new THREE.Group()
    group.name = spec.name
    group.visible = false
    root.add(group)
    const points = spec.points.filter((value, i, all) => i === 0 || value.distanceToSquared(all[i - 1]) > .000001)
    if (points.length < 2) return null
    const curve = roundedPath(points)
    const length = curve.getLength()
    const segments = Math.max(4, Math.min(96, Math.ceil(length * 8)))
    const color = palette[spec.role]

    function tube(radius, material, order) {
      const geometry = new THREE.TubeGeometry(curve, segments, radius, 8, false)
      geometries.add(geometry)
      return mesh(group, geometry, material, order)
    }
    const width = Math.min(.052, length * .12)
    const casing = tube(width * 1.62, outline, 20)
    const ribbon = tube(width, color.active, 21)
    const arrows = []
    const arrowCount = Math.max(1, Math.min(5, Math.ceil(length / 2.05)))
    const arrowLength = Math.min(.39, length * .48)
    for (let i = 0; i < arrowCount; i++) {
      const head = new THREE.Group()
      group.add(head)
      const shell = mesh(head, cone, outline, 22)
      const face = mesh(head, cone, color.active, 23)
      shell.scale.set(arrowLength * .49, arrowLength * 1.12, arrowLength * .49)
      face.scale.set(arrowLength * .35, arrowLength, arrowLength * .35)
      arrows.push({ head, face, shell })
    }
    let marker
    if (spec.milestone) {
      marker = new THREE.Group()
      marker.position.copy(points.at(-1))
      marker.position.y += .025
      group.add(marker)
      const radius = spec.markerRadius || .32
      for (const [geometry, material, order] of [[haloRing, outline, 24], [ring, color.active, 25]]) {
        const mark = mesh(marker, geometry, material, order)
        mark.rotation.x = -Math.PI / 2
        mark.scale.setScalar(radius)
      }
      mesh(marker, sphere, outline, 24).scale.setScalar(.084)
      mesh(marker, sphere, color.active, 25).scale.setScalar(.064)
    }
    return { spec, group, curve, length, casing, ribbon, arrows, marker, active: false }
  }

  function clearTracks() {
    root.clear()
    for (const geometry of geometries) geometry.dispose()
    geometries.clear()
    tracks = []
    previousKey = undefined
  }

  function styleTrack(track, active) {
    track.active = active
    const material = palette[track.spec.role][active ? 'active' : 'previous']
    const border = active ? outline : faintOutline
    track.casing.material = border
    track.ribbon.material = material
    if (track.marker) track.marker.visible = active
    for (const { head, face, shell } of track.arrows) {
      head.visible = active
      face.material = material
      shell.material = border
    }
  }

  // time is the visible scene clock in seconds. The caller owns RAF and
  // visibility. No path, material or geometry is allocated on a phase change.
  function update({ device, mode, kind = 'energy', step = -1, thermalStep = 0, anchor, time = 0, reducedMotion = false, running = false }) {
    const dt = previousTime === undefined ? 0 : Math.min(.2, Math.max(0, time - previousTime))
    previousTime = time
    const thermal = kind === 'thermal'
    root.visible = Number.isInteger(step) && step >= 0 && step <= 5 &&
      (mode === 'interior' || (mode === 'board' && !thermal)) && (!thermal || step >= 3)
    if (!root.visible) return
    const origin = anchor('cpu')
    if (!origin) { root.visible = false; return }
    root.position.copy(origin)
    if (device !== modelDevice) {
      clearTracks()
      tracks = makeRoutes(device, anchor, origin).map(buildTrack).filter(Boolean)
      modelDevice = device
    }
    const stage = thermal ? THREE.MathUtils.clamp(thermalStep, 0, 3) : step
    const key = [mode, kind, stage].join('/')
    const changed = key !== previousKey
    if (changed) {
      previousKey = key
      phase = 0
      for (const track of tracks) {
        const { spec } = track
        track.group.visible = (spec.kind || 'energy') === kind && spec.stage <= stage
        styleTrack(track, spec.stage === stage)
      }
    }
    if (running && !reducedMotion) phase += dt * 1.08
    for (const track of tracks) {
      if (!track.group.visible || !track.active) continue
      track.arrows.forEach(({ head }, i, all) => {
        const still = (i + .54) / all.length
        const travel = reducedMotion ? still : (still + phase / track.length) % 1
        const t = .09 + .82 * travel
        track.curve.getPointAt(t, point)
        track.curve.getTangentAt(t, tangent)
        head.position.copy(point)
        head.quaternion.setFromUnitVectors(UP, tangent)
      })
    }
  }

  function dispose() {
    root.removeFromParent()
    clearTracks()
    for (const resource of shared) resource.dispose()
    shared.clear()
  }
  return { update, dispose }
}
