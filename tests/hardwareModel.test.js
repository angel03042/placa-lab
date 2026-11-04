import test from 'node:test'
import assert from 'node:assert/strict'
import { Box3, Raycaster, Vector3 } from 'three'
import { createModel } from '../src/three/model.js'
import { applyModelPose, isPartVisible } from '../src/three/modelPose.js'
import { getComponents } from '../src/data.js'
import { recognitionFor } from '../src/recognition.js'

// Only the printed labels need a canvas. All geometry and ray intersections are real.
function assemble(t, device) {
  const original = globalThis.document
  globalThis.document = { createElement: () => ({ getContext: () => ({ fillText() {}, fillRect() {} }) }) }
  try {
    const model = createModel(device)
    t.after(() => model.dispose())
    return model
  } finally {
    if (original === undefined) delete globalThis.document
    else globalThis.document = original
  }
}

function setPose(model, device, mode) {
  applyModelPose(model.groups, device, mode)
  model.root.updateMatrixWorld(true)
}

for (const device of ['laptop', 'desktop']) {
  test(device + ': cada ficha corresponde a una pieza física seleccionable', t => {
    const model = assemble(t, device)
    const ids = getComponents(device).map(part => part.id)
    assert.deepEqual(Object.keys(model.parts).sort(), [...ids].sort())
    for (const id of ids) {
      assert.ok(!new Box3().setFromObject(model.parts[id]).isEmpty(), id)
      assert.ok(model.selectables.some(mesh => mesh.userData.id === id), id)
      assert.ok(recognitionFor(id, device).length > 0, id)
    }
  })
}

test('el despiece de laptop levanta el módulo WLAN plano y conserva el zócalo en la placa', t => {
  const model = assemble(t, 'laptop')
  setPose(model, 'laptop', 'interior')
  const wifi = model.parts.wifi
  const size = new Box3().setFromObject(wifi).getSize(new Vector3())
  assert.ok(size.y < size.x / 3 && size.y < size.z / 3)
  const socket = model.groups.pcb.children.find(mesh => mesh.userData.id === 'wifi' && mesh.isMesh)
  assert.ok(socket)
  const separation = () => wifi.getWorldPosition(new Vector3()).y - socket.getWorldPosition(new Vector3()).y
  const seated = separation()
  setPose(model, 'laptop', 'exploded')
  assert.ok(separation() > seated + 1)
  assert.equal(model.parts.gpu, undefined)
})

test('quitar el panel y extraer la gráfica deja el PCIe fijo; volver a montar recupera el encaje', t => {
  const model = assemble(t, 'desktop')
  const { chassis, exterior } = model.groups
  const { gpu, pcie } = model.parts
  const bounds = object => new Box3().setFromObject(object)
  const probe = new Raycaster(new Vector3(-2.53, 1.92, 8), new Vector3(0, 0, -1))
  setPose(model, 'desktop', 'equipment')
  assert.ok(chassis.visible && exterior.visible)
  assert.ok(bounds(exterior).max.y > bounds(gpu).max.y)
  setPose(model, 'desktop', 'interior')
  assert.equal(exterior.visible, false)
  const installed = bounds(gpu)
  const slot = bounds(pcie)
  assert.ok(installed.intersectsBox(slot))
  assert.equal(probe.intersectObject(gpu)[0].object.userData.id, 'gpu')
  setPose(model, 'desktop', 'released')
  assert.ok(isPartVisible(gpu) && bounds(gpu).min.y > slot.max.y)
  assert.ok(bounds(pcie).equals(slot))
  setPose(model, 'desktop', 'board')
  assert.ok(!isPartVisible(gpu) && !chassis.visible && isPartVisible(pcie))
  setPose(model, 'desktop', 'exploded')
  assert.ok(isPartVisible(gpu) && isPartVisible(model.parts.cpu))
  setPose(model, 'desktop', 'equipment')
  assert.ok(exterior.visible && bounds(gpu).equals(installed))
  assert.equal(model.parts.wifi, undefined)
})
