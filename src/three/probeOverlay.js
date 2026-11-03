import * as THREE from 'three'
import { testPoints } from '../simulation.js'

// PCB-local coordinates. The core contact is on the output side of the inductor.
// GND lands on the exposed annulus around the rear left mounting screw.
const positions = {
  input: [5.99, .131, -3.15],
  protected: [4.12, .131, -2.99],
  standby: [-1.9, .131, .8],
  core: [-1.87, .131, -.55],
  memory: [3.92, .131, -.36],
  gnd: [-3.973, .123, -4],
}

const traceEnds = {
  input: [5.95,-3.56], protected: [4.52,-3.19], standby: [-2.13,.85],
  core: [-2.14,-.55], memory: [3.74,-.49],
}

export const probePoints = [...testPoints, { id: 'gnd', name: 'GND · Masa en el anillo del tornillo' }]
  .map(point => ({ ...point, code: point.name.split(' · ')[0] }))

export function createProbeOverlay(pcb) {
  const root = new THREE.Group()
  root.name = 'Multímetro'
  pcb.add(root)
  const materials = [], geometries = []
  const targets = [], contacts = new Map(), cables = new Map()
  function material(color, metalness = 0, roughness = .6) {
    const mat = new THREE.MeshStandardMaterial({ color, metalness, roughness })
    materials.push(mat)
    return mat
  }
  function geometry(g) { geometries.push(g); return g }
  function mesh(parent, shape, mat) {
    const part = new THREE.Mesh(shape, mat)
    parent.add(part)
    return part
  }
  function turn(profile) {
    return geometry(new THREE.LatheGeometry(profile.map(([height, radius]) => new THREE.Vector2(radius, height)), 24))
  }

  const gold = material('#e4bd67', .68, .38), mask = material('#394d3e')
  const trace = material('#4a8169', .22)
  const traceStrip = geometry(new THREE.BoxGeometry(1,.005,.034))
  const disc = geometry(new THREE.CylinderGeometry(.102, .102, .012, 32))
  const opening = geometry(new THREE.CylinderGeometry(.127, .127, .008, 32))
  const hitArea = geometry(new THREE.CylinderGeometry(.17, .17, .03, 16))
  const hitMaterial = new THREE.MeshBasicMaterial({ colorWrite:false, depthWrite:false })
  materials.push(hitMaterial)
  for (const { id } of probePoints) {
    const contact = new THREE.Vector3(...positions[id])
    contacts.set(id, contact)
    if (id !== 'gnd') {
      const [x,z] = traceEnds[id]
      const strip = mesh(root,traceStrip,trace)
      strip.position.set((contact.x+x)/2,.118,(contact.z+z)/2)
      strip.scale.x = Math.hypot(x-contact.x,z-contact.z)
      strip.rotation.y = -Math.atan2(z-contact.z,x-contact.x)
      mesh(root, opening, mask).position.copy(contact).y -= .012
      mesh(root, disc, gold).position.copy(contact).y -= .006
    } else {
      const annulus = mesh(root,geometry(new THREE.RingGeometry(.086,.17,40)),gold)
      annulus.position.set(-3.85,contact.y,-4)
      annulus.rotation.x = -Math.PI/2
    }
    const hit = mesh(root, hitArea, hitMaterial)
    hit.position.copy(contact)
    if (id === 'gnd') hit.position.set(-3.85, .17, -4)
    hit.userData.probe = id
    targets.push(hit)
  }

  const tip = turn([[0,0],[.18,.033],[.49,.034],[.51,.045],[.56,.045],[.56,0]])
  const grip = turn([[.54,0],[.54,.058],[.64,.078],[.93,.11],[.98,.20],[1.04,.20],[1.07,.135],
    [1.14,.13],[1.19,.148],[1.62,.171],[1.87,.159],[1.94,.141],[1.99,.09],[1.99,0]])
  const relief = turn([[1.97,0],[1.97,.09],[2.04,.09],[2.06,.073],[2.10,.08],[2.13,.066],
    [2.17,.071],[2.19,.057],[2.23,.06],[2.27,.044],[2.27,0]])
  const rib = geometry(new THREE.TorusGeometry(.158,.012,6,24))
  const chrome = material('#d8e0de', .82, .23), boot = material('#2b3034')
  function makeProbe(isGround) {
    const probe = new THREE.Group()
    root.add(probe)
    probe.visible = false
    const body = material(isGround ? '#30383d' : '#c63627', .05, .49)
    const rubber = material(isGround ? '#1d242b' : '#98281d')
    mesh(probe, tip, chrome)
    mesh(probe, grip, body)
    mesh(probe, relief, boot)
    for (const y of [1.42,1.49,1.56,1.63]) {
      const ring = mesh(probe, rib, rubber)
      ring.position.y = y
      ring.rotation.x = Math.PI / 2
    }
    const side = isGround ? -1 : 1
    const axis = new THREE.Vector3(side * .78, 1, isGround ? -.46 : .55).normalize()
    probe.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), axis)
    for (const [id, contact] of contacts) {
      if ((id === 'gnd') !== isGround) continue
      const socket = contact.clone().addScaledVector(axis, 2.26)
      const bend = socket.clone().addScaledVector(axis, .65)
      const edge = side * Math.max(9, Math.abs(bend.x)+1.5)
      const path = new THREE.CurvePath()
      const landing = new THREE.Vector3(edge+side, -.435, bend.z+1)
      path.add(new THREE.CubicBezierCurve3(socket, bend,
        new THREE.Vector3(edge,-.435,landing.z-.25),landing))
      path.add(new THREE.LineCurve3(landing,landing.clone().add(new THREE.Vector3(side*18,0,4.5))))
      const cable = mesh(root, geometry(new THREE.TubeGeometry(path, 70, .043, 8, false)), rubber)
      cable.visible = false
      cables.set(id, cable)
    }
    return probe
  }
  const black = makeProbe(true), red = makeProbe(false)
  function update(redPoint, grounded) {
    red.visible = redPoint !== 'gnd' && contacts.has(redPoint)
    if (red.visible) red.position.copy(contacts.get(redPoint))
    black.visible = grounded
    black.position.copy(contacts.get('gnd'))
    for (const [id,cable] of cables) cable.visible = id === 'gnd' ? grounded : red.visible && id === redPoint
  }
  return {
    targets, update,
    worldPoint(id, vector) { return vector.copy(contacts.get(id)).applyMatrix4(root.matrixWorld) },
    dispose() {
      root.removeFromParent()
      for (const resource of [...materials,...geometries]) resource.dispose()
    },
  }
}

// Place identical touch targets near their projected contacts. Try the outward
// direction first and move crowded labels to wider rings without moving the dots.
export function layoutProbeLabels(points, width, height) {
  const w = 48, h = 40, gap = 3
  const top = Math.min(35, height * .13), bottom = Math.min(41, height * .15)
  const centerX = points.reduce((sum,p) => sum+p.x,0) / points.length
  const centerY = points.reduce((sum,p) => sum+p.y,0) / points.length
  const placed = []
  const clamp = (n,min,max) => Math.max(min,Math.min(n,max))
  for (const p of points) {
    const angle = Math.atan2(p.y-centerY,p.x-centerX)
    let best = null
    for (const radius of [37,52,72,100,134,174]) {
      for (const direction of [0,1,-1,2,-2,3,-3,4]) {
        const theta = angle + direction*Math.PI/4
        const x = clamp(p.x+Math.cos(theta)*radius-w/2,4,width-w-4)
        const y = clamp(p.y+Math.sin(theta)*radius-h/2,top,height-h-bottom)
        if (placed.some(r => x<r.x+w+gap && x+w+gap>r.x && y<r.y+h+gap && y+h+gap>r.y)) continue
        const covered = points.filter(a=>a.x>x-4 && a.x<x+w+4 && a.y>y-4 && a.y<y+h+4).length
        const score = Math.hypot(x+w/2-p.x,y+h/2-p.y) + 8*Math.abs(direction) + covered*100
        if (!best || score < best.score) best = {...p, x, y, px:p.x, py:p.y, score,
          endX:clamp(p.x,x+2,x+w-2), endY:clamp(p.y,y+2,y+h-2)}
      }
      if (best && best.score < radius+8) break
    }
    if (best) placed.push(best)
  }
  return placed
}
