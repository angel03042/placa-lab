import { desktopPose } from './assembly.js'
import { explodedOffsets } from './layout.js'

function approach(current, target, blend) {
  return Math.abs(current - target) < .008 ? target : current + (target - current) * blend
}

// All helpers, picking and projected labels use these same group transforms.
export function applyModelPose(groups, device, mode, blend = 1, guided = false) {
  const desktop = device === 'desktop'
  const equipment = mode === 'equipment'
  const board = mode === 'board'
  const exploded = mode === 'exploded'
  groups.pcb.visible = desktop || !equipment
  groups.battery.visible = !equipment && !board
  groups.thermal.visible = !board
  for (const [name, height] of Object.entries(explodedOffsets)) {
    groups[name].position.y = approach(groups[name].position.y, exploded ? height : 0, blend)
  }
  if (!desktop) {
    groups.chassis.visible = !board
    groups.exterior.visible = equipment
    groups.wifiCarrier.position.y = approach(groups.wifiCarrier.position.y, exploded ? 1.15 : 0, blend)
    return
  }

  const pose = desktopPose[mode] ?? desktopPose.interior
  groups.chassis.visible = pose.caseVisible && !guided
  const panel = groups.exterior
  panel.position.y = approach(panel.position.y, pose.panelLift, blend)
  panel.position.z = -panel.position.y * 1.65
  panel.visible = !guided && pose.caseVisible && (equipment || panel.position.y < pose.panelLift - .02)
  // Keep the rear I/O and the GPU bracket installed behind the closed cover.
  groups.graphics.visible = pose.gpuVisible
  groups.graphics.position.y = approach(groups.graphics.position.y, pose.gpuLift, blend)
  groups.cpuCarrier.position.y = approach(groups.cpuCarrier.position.y, exploded ? 1.3 : 0, blend)
}

export function isPartVisible(part) {
  for (let object = part; object; object = object.parent) if (!object.visible) return false
  return Boolean(part)
}
