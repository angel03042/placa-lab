// Positions are teaching stages. The case is laid on its side, so cards lift along Y.
export const desktopStages = [
  { mode: 'equipment', label: 'Gabinete', title: 'Gabinete cerrado', action: 'Quitar panel',
    detail: 'La torre está acostada en el banco. Con el equipo apagado y desenchufado, libera los tornillos del panel lateral.' },
  { mode: 'interior', label: 'Interior', title: 'Panel retirado', action: 'Extraer gráfica',
    detail: 'La gráfica sigue en la ranura larga. Libera su fijación trasera y la pestaña PCIe antes de levantarla. Esta tarjeta se alimenta por la ranura.' },
  { mode: 'released', label: 'Sin gráfica', title: 'Gráfica fuera de la ranura', action: 'Aislar placa',
    detail: 'La tarjeta queda suspendida para que compares su borde dorado con el zócalo PCIe x16 vacío. La ranura sigue soldada a la placa.' },
  { mode: 'board', label: 'Placa', title: 'Placa en el banco', action: 'Ver despiece',
    detail: 'Se muestra la placa fuera del gabinete y sin disipadores para examinar sus circuitos. En el equipo real se desconectan los cables y se retiran las fijaciones antes de sacarla.' },
  { mode: 'exploded', label: 'Despiece', title: 'Conjuntos separados', action: 'Montar gabinete',
    detail: 'Compara módulos, anclajes y conectores con su posición de montaje. Vuelve al gabinete para empezar otra vez.' },
]

export const desktopPose = {
  equipment: { panelLift: 0, gpuLift: 0, caseVisible: true, gpuVisible: true },
  interior: { panelLift: 4.6, gpuLift: 0, caseVisible: true, gpuVisible: true },
  released: { panelLift: 4.6, gpuLift: 4.4, caseVisible: true, gpuVisible: true },
  board: { panelLift: 4.6, gpuLift: 0, caseVisible: false, gpuVisible: false },
  exploded: { panelLift: 4.6, gpuLift: 3.4, caseVisible: false, gpuVisible: true },
}
