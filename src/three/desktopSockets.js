import * as THREE from 'three'

// The CPU package lifts with its carrier. The contacts, frame and lever stay on the motherboard.
export function buildDesktopSocket(p, pcb, cpu, x, z) {
  const id = 'cpu'
  const steel = '#9da8ae'
  p.box(pcb, x, .18, z, 2.03, .14, 1.96, '#373c40', id)
  p.box(pcb, x, .255, z, 1.58, .02, 1.48, '#635942', id, .4)
  // A sample of the spring contacts, batched into one draw call.
  const geometry = new THREE.BoxGeometry(.041, .033, .076)
  p.resources.add(geometry)
  const contacts = new THREE.InstancedMesh(geometry, p.material('#d4b366', .72), 14 * 14)
  const pose = new THREE.Object3D()
  pose.rotation.z = .29
  let i = 0
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 14; col++) {
      if (row >= 5 && row <= 8 && col >= 5 && col <= 8) continue
      pose.position.set(x - .70 + col * .108, .283, z - .64 + row * .098)
      pose.updateMatrix()
      contacts.setMatrixAt(i++, pose.matrix)
    }
  }
  contacts.count = i
  contacts.userData.id = id
  pcb.add(contacts)
  p.resources.add(contacts)
  p.selectables.push(contacts)

  p.box(cpu, x, .335, z, 1.63, .084, 1.54, '#28664d', id)
  p.box(cpu, x, .415, z, 1.39, .10, 1.28, '#bfc3c1', id, .86)
  p.text(cpu, 'PROCESSOR', x, .471, z, .95, .18, '#4c5358', null, id)
  for (const side of [-1, 1]) {
    p.box(pcb, x + side * .87, .38, z, .14, .065, 1.73, steel, id, .8)
    p.box(pcb, x, .38, z + side * .835, 1.66, .065, .14, steel, id, .8)
  }
  p.cylinder(pcb, x - .92, .32, z, .067, 1.12, steel, id, .8).rotation.x = Math.PI / 2
  p.tube(pcb, [[x + .96, .27, z - .85], [x + 1.01, .30, z - .71], [x + 1.01, .32, z + .77], [x + .78, .34, z + .92]], .034, steel, id)
}

export function buildExpansionSlots(p, slots) {
  const id = 'pcie'
  function slot(x, z, length, reinforced) {
    // Two socket walls and a physical key leave a channel for the card edge.
    for (const side of [-1, 1]) {
      p.box(slots, x, .245, z + side * .096, length, .27, .067, '#343a40', id, .12)
      if (reinforced) p.box(slots, x, .37, z + side * .116, length, .05, .034, '#a6b0b4', id, .8)
      for (let n = 0; n < (reinforced ? 18 : 6); n++) {
        p.box(slots, x - length / 2 + .12 + n * (length - .24) / (reinforced ? 17 : 5),
          .144, z + side * .15, .032, .04, .12, '#aab1aa', id, .68, 0)
      }
    }
    for (const edge of [-1, 1]) p.box(slots, x + edge * (length / 2 - .035), .245, z, .07, .27, .24, '#41484a', id)
    p.box(slots, x - length / 2 + .69, .25, z, .068, .25, .18, '#5a6263', id)
    if (reinforced) {
      const lever = p.box(slots, x + length / 2 + .085, .30, z, .27, .20, .32, '#959fa0', id)
      lever.rotation.z = .17
    }
  }
  slot(-1.7, 2.5, 3.8, true)
  slot(-3.03, 3.26, 1.16, false)
  p.text(slots, 'PCIEX16', -3.02, .12, 2.2, .85, .14)
  p.text(slots, 'PCIEX1', -3.02, .12, 3.54, .66, .13)
}
