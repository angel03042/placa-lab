// One world unit represents about 20 mm in the generic laptop.
export const ramSize = device => device === 'laptop' ? [3.48, .075, 1.5] : [.075, 1.5, 6.67]
export const fanActive = (step, mode) => step >= 3 && mode === 'interior'
export const externalParts = ['fan', 'heatsink', 'battery-pack', 'gpu', 'vrm-heatsink']
export const explodedOffsets = { pcb: .65, ram: 1.45, ssd: 1.05, thermal: 3.1, battery: 1.15 }
export const laptopLayout = {
  cpu: [-1.7, -2.15], ram: [2, -.8], ssd: [5, -.25], fan: [-5.7, -2.75],
  input: [5.95, -3.9], mosfet: [4.7, -3.45], charger: [3.65, -3.45],
  bios: [-.45, .75], ec: [-2.65, .75], chipset: [.45, -2.75],
  resistor: [-.5, -.35], capacitor: [-1.25, -.45], inductor: [-2.35, -.55],
  fuse: [5.55, -2.95], diode: [4.75, -2.95], 'battery-pack': [0, 3.5],
}
