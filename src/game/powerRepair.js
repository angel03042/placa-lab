export const stationStages = [
  ['Sigue la señal de mando', 'Con el voltímetro, toca los puntos A y B. La punta de referencia está en la fuente común de los MOSFET.'],
  ['Aísla la placa', 'Desconecta el adaptador y descarga la placa en el banco. La batería ya estaba desconectada.'],
  ['Mide la resistencia', 'Con el equipo sin tensión, mide entre los extremos de PR1. El plano de esta placa especifica 4,02 kΩ.'],
  ['Retira el componente', 'Elige la pinza térmica y toca PR1 para calentar ambos extremos y levantar la pieza.'],
  ['Comprueba la pieza retirada', 'Mide PR1 en la bandeja para confirmar la avería fuera del circuito. Limpia las dos islas de cobre con la malla.'],
  ['Elige y coloca el repuesto', 'Consulta la ficha de PR1. Selecciona un repuesto del cajón y colócalo sobre la huella vacía.'],
  ['Fija el primer extremo', 'Selecciona el cautín y toca el pad A. El repuesto sigue alineado con las dos islas.'],
  ['Suelda el segundo extremo', 'Aplica el cautín en el pad B para completar la unión con la compuerta.'],
  ['Inspecciona la reparación', 'Revisa PR1 con la lupa. El banco comprueba ambas uniones y el aislamiento antes de aplicar tensión.'],
  ['Alimenta el circuito', 'Reconecta el adaptador con la placa ya inspeccionada.'],
  ['Repite la medición inicial', 'Mide TP2 con el voltímetro. Compara la salida de protección con los 0,00 V del informe.'],
  ['Prueba el encendido', 'Pulsa el botón de encendido del equipo y observa la autoprueba de arranque.'],
  ['Arranque comprobado', 'La reparación recuperó el mando de entrada. La laptop completó la autoprueba y entró al firmware.'],
]
const actions = [
  null, 'isolate', 'meter:pr1', 'tweezers:pr1', null, 'place:pr1', 'iron:a', 'iron:b',
  'scope:pr1', 'power', 'meter:tp2', 'boot',
]
const messages = {
  'meter:a':'A respecto a fuente común · +6,0 V. El controlador entrega la señal de mando.',
  'meter:b':'B respecto a fuente común · 0,0 V. La señal de mando no llega a la compuerta.',
  isolate:'Adaptador retirado. La batería está desconectada y el banco confirma 0 V.',
  'meter:pr1':'PR1 · OL entre extremos. El valor nominal de la ficha es 4,02 kΩ. Compruébalo fuera de la placa.',
  'tweezers:pr1':'PR1 quedó en la bandeja. Ahora puedes medirla por separado.',
  'meter:removed':'PR1 fuera de circuito · OL. La resistencia está abierta.',
  'wick:pr1':'Dos islas limpias. Ya puedes colocar un repuesto del mismo valor y encapsulado.',
  'place:pr1':'Repuesto de 4,02 kΩ colocado sobre la huella 0603.',
  'iron:a':'Unión A terminada. Falta el extremo que llega a la compuerta.',
  'iron:b':'Unión B terminada. Los dos extremos han quedado soldados.',
  'scope:pr1':'Inspección correcta. Dos uniones continuas sin puentes. El banco confirma que no hay corto de la línea de entrada a masa.',
  power:'Adaptador conectado. La línea de mando vuelve a habilitar los MOSFET.',
  'meter:tp2':'TP2 · 19,00 V. Antes de la reparación medía 0,00 V con el mismo adaptador.',
  boot:'Encendido correcto. La pantalla muestra la autoprueba completada.',
}
const firstState = () => ({step:0, events:[], powered:true, booted:false})
export function operateRepair(state, action) {
  const i = state.step
  const pair = ['meter:a','meter:b']
  const accepts = i === 0 ? pair.includes(action)
    : i === 4 ? action === 'meter:removed' || action === 'wick:pr1' && state.events.includes('meter:removed')
    : actions[i] === action
  if (!accepts || state.events.includes(action)) {
    let message = 'Ese gesto no cambia el circuito. ' + stationStages[i][1]
    if (state.events.includes(action) && messages[action]) message = messages[action]
    else if (action === 'boot' && !state.booted) message = state.powered ? 'El encendido aún no está verificado. ' + stationStages[i][1] : 'Placa aislada. El equipo no recibe alimentación.'
    else if (state.powered && /^(iron|wick|tweezers|place):/.test(action)) message = 'Hay tensión en la placa. El banco bloquea la herramienta térmica y la manipulación de componentes.'
    else if (i === 4 && action === 'wick:pr1') message = 'Antes de limpiar, mide la pieza que retiraste. Así sabrás si realmente estaba abierta.'
    else if (action.startsWith('jumper:')) message = 'Un puente de 0 Ω elimina la resistencia que limita la corriente de mando. Busca el valor del plano.'
    else if (action.startsWith('wrongpart:')) message = 'El tamaño coincide, pero el valor no coincide con PR1 en la ficha de esta placa.'
    else if (action.endsWith(':pq1')) message = 'PQ1 es el MOSFET. Comprueba primero si la señal llega desde PU1 a través de PR1.'
    return {state, message}
  }
  const events = [...state.events,action]
  const step = i === 0 && !pair.every(key => events.includes(key)) || i === 4 && action === 'meter:removed' ? i : i + 1
  return {
    state:{step, events, powered:step < 2 || step >= 10, booted:step === 12},
    message:messages[action],
  }
}
export function restoreRepair(events) {
  return (Array.isArray(events) ? events.slice(0,24) : []).reduce((state,action) =>
    typeof action === 'string' ? operateRepair(state,action).state : state, firstState())
}
export const repairLog = events => events.map(action => messages[action])

