export const cases = [
  { id: 'healthy', name: 'Funcionamiento normal', level: 'Referencia', description: 'Compara las mediciones de una placa que completa la secuencia de encendido.', result: 'Las líneas del ejemplo están presentes y el arranque se completa.', answer: 'healthy' },
  { id: 'no-power', name: 'No enciende', level: 'Caso 01 · Básico', description: 'El equipo no responde al botón. El adaptador del ejemplo entrega su tensión nominal. Sigue la energía para encontrar dónde se interrumpe.', result: 'La tensión llega a la entrada, pero no atraviesa la etapa de protección. El siguiente paso real sería comprobar el control de compuerta y los MOSFET; esta medición no identifica por sí sola la pieza dañada.', answer: 'protection' },
  { id: 'no-display', name: 'Enciende sin imagen', level: 'Caso 02 · Intermedio', description: 'El equipo inicia su secuencia, pero no completa la inicialización de memoria. Compara las líneas principales con la alimentación de RAM.', result: 'La alimentación de RAM está ausente aunque las etapas anteriores están activas. Revisa el regulador de memoria, su habilitación y su carga antes de cambiar el módulo.', answer: 'ram' },
]

export const diagnoses = [
  { id: 'protection', text: 'La energía se interrumpe en la protección de entrada' },
  { id: 'ram', text: 'Falta alimentación en la etapa de memoria' },
  { id: 'bios', text: 'El firmware está corrupto' },
  { id: 'healthy', text: 'Las alimentaciones medidas son correctas' },
]

export { sequenceFor } from './flows.js'

export const testPoints = [
  { id: 'input', name: 'TP1 · Entrada', component: 'input', line: 'VIN' },
  { id: 'protected', name: 'TP2 · Salida de protección', component: 'mosfet', line: 'VSYS' },
  { id: 'standby', name: 'TP3 · Línea de espera', component: 'ec', line: '+3V_ALW' },
  { id: 'core', name: 'TP4 · Núcleo del procesador', component: 'vrm', line: 'VCORE' },
  { id: 'memory', name: 'TP5 · Alimentación RAM', component: 'ram', line: 'VDD_DDR' },
]

export function measure({ device, scenario, point, mode, powered }) {
  if (mode === 'resistance' && powered) return { blocked: true, display: '— — —', unit: 'Ω', note: 'Desconecta la alimentación antes de medir resistencia.' }
  if (mode === 'voltage' && !powered) return { display: '0.00', unit: 'V', note: 'La placa está desconectada. Activa la alimentación para medir tensión.' }
  if (mode === 'resistance') {
    const values = { input: '150.0k', protected: '48.0k', standby: '2.40k', core: '8.50', memory: '240.0' }
    return { display: values[point] || 'OL', unit: 'Ω', note: point === 'core' ? 'Una resistencia baja en VCORE puede ser normal. Este valor no demuestra un corto.' : 'Valor simulado con la placa desconectada; no es una referencia universal.' }
  }
  const nominal = { input: device === 'laptop' ? 19 : 12, protected: device === 'laptop' ? 19 : 12, standby: 3.3, core: 1.05, memory: 1.2 }
  let value = nominal[point] ?? 0
  if (scenario === 'no-power' && point !== 'input') value = 0
  if (scenario === 'no-display' && point === 'memory') value = 0
  return { display: value.toFixed(2), unit: 'V', note: value === 0 ? 'Sin tensión en este punto. Compara con la etapa anterior y revisa sus condiciones de habilitación.' : 'Tensión presente en este punto del modelo didáctico.' }
}

export function canDiagnose(scenario, readings) {
  const points = new Set(readings.filter(r => r.scenario === scenario && r.mode === 'voltage' && r.powered).map(r => r.point))
  if (scenario === 'no-power') return points.has('input') && points.has('protected')
  if (scenario === 'no-display') return points.has('standby') && points.has('memory')
  return points.has('input') && points.has('memory')
}
