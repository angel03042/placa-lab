import { measure, canDiagnose, testPoints } from '../simulation.js'

export const interview = [
  { id: 'change', question: '¿Cuándo dejó de encender?', reply: 'Ayer trabajé con ella y la apagué como siempre. Esta mañana ya no reaccionó.' },
  { id: 'led', question: '¿Qué pasa al conectar el cargador?', reply: 'El indicador de la laptop sigue apagado. Tampoco oigo el ventilador cuando pulso el botón.' },
  { id: 'damage', question: '¿Hubo una caída o un derrame?', reply: 'Que yo sepa, no. La traje con el cargador que uso todos los días.' },
]
export const inspections = [
  { id:'jack', action:'Inspeccionar el conector', observation:'El conector está firme y los contactos visibles están limpios. Falta comprobar si la tensión llega a la placa.' },
  { id:'adapter', action:'Probar el adaptador', observation:'El adaptador indica 19 V nominales y entrega 19,00 V en vacío. La siguiente medición puede comprobar la entrada con la placa conectada.' },
]
export const conclusions = [
  { id:'adapter', label:'El adaptador deja de entregar tensión al conectar la placa.' },
  { id:'protection', label:'La alimentación se interrumpe entre la entrada y la salida de protección.' },
  { id:'mosfet', label:'El MOSFET de entrada está dañado y hay que sustituirlo.' },
  { id:'bios', label:'La memoria de firmware impide el encendido.' },
]
export const followUps = [
  { id:'firmware', label:'Reprogramar la memoria de firmware.' },
  { id:'ram', label:'Cambiar la RAM y volver a encender.' },
  { id:'gate', label:'Consultar el esquema y comprobar el mando de los MOSFET de entrada.' },
]

export function newTicket() {
  return { phase:'intake', asked:[], inspected:[], readings:[], grounded:false, powered:false, redPoint:'', evidence:[], conclusion:'', followUp:'', note:'' }
}
const hasPoint = id => testPoints.some(point => point.id === id)
export const pointName = id => testPoints.find(point => point.id === id)?.name || ''
export const readingKey = reading => reading.point + (reading.powered ? '-on' : '-off')
export function benchReading(point, powered) {
  const conditions = { device:'laptop', scenario:'no-power', mode:'voltage', point, powered }
  return { ...conditions, ...measure(conditions) }
}
export function reportFeedback(ticket) {
  const chosen = ticket.readings.filter(reading => ticket.evidence.includes(readingKey(reading)))
  if (!canDiagnose('no-power', chosen)) return 'Elige dos lecturas con el adaptador conectado que delimiten el corte. Compara la entrada con el otro lado de la protección.'
  if (ticket.conclusion === 'mosfet') return 'Has localizado la etapa. Un MOSFET sano también puede quedar bloqueado si falta su señal de mando. Ajusta la conclusión a lo que mediste.'
  if (ticket.conclusion === 'adapter') return 'Tu lectura de entrada muestra tensión con la placa conectada. Busca en qué lado de la protección desaparece.'
  if (ticket.conclusion !== 'protection') return 'Revisa dónde cambia la tensión entre tus dos lecturas. Esa diferencia permite localizar una etapa antes de investigar el firmware.'
  if (ticket.followUp !== 'gate') return 'Ya localizaste la interrupción. Elige una comprobación que distinga un problema de mando de una avería en el camino de entrada.'
  return ''
}
export function restoreTicket(raw) {
  const ticket = newTicket()
  if (!raw || !['intake','bench','report','closed'].includes(raw.phase)) return ticket
  const known = (items, options) => options.filter(option => Array.isArray(items) && items.includes(option.id)).map(option => option.id)
  ticket.phase = raw.phase
  ticket.asked = known(raw.asked, interview)
  ticket.inspected = known(raw.inspected, inspections)
  const readings = new Map()
  for (const item of Array.isArray(raw.readings) ? raw.readings : []) {
    if (hasPoint(item?.point) && typeof item.powered === 'boolean') {
      const reading = benchReading(item.point, item.powered)
      readings.set(readingKey(reading), reading)
    }
  }
  ticket.readings = [...readings.values()]
  ticket.redPoint = hasPoint(raw.redPoint) ? raw.redPoint : ''
  ticket.powered = raw.powered === true
  ticket.grounded = raw.grounded === true
  ticket.evidence = [...readings.keys()].filter(key => Array.isArray(raw.evidence) && raw.evidence.includes(key)).slice(0,2)
  ticket.conclusion = conclusions.some(option => option.id === raw.conclusion) ? raw.conclusion : ''
  ticket.followUp = followUps.some(option => option.id === raw.followUp) ? raw.followUp : ''
  ticket.note = typeof raw.note === 'string' ? raw.note.slice(0,400) : ''
  if (ticket.phase === 'closed' && reportFeedback(ticket)) ticket.phase = 'report'
  return ticket
}

