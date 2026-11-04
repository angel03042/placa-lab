const probes = ['pin','pad']
const positions = [-1,0,1]
export const sweepPositions = [0,1,0]
export const probeNames = {pin:'P1 · Terminal del jack', pad:'P2 · Pista de la placa'}
export const positionNames = {'-1':'Abajo',0:'Centro',1:'Arriba'}
export const jackProcedure = [
  {action:'isolate',label:'Apagar y aislar la alimentación',instruction:'Retira el adaptador, aísla la batería y comprueba que no queda tensión.',result:'Equipo apagado, batería aislada y 0 V en la entrada.'},
  {action:'inspect',label:'Examinar la unión con la lupa',instruction:'Observa dónde se une el terminal positivo a la placa y cómo está sujeto el conector.',result:'La lupa revela una fisura alrededor del terminal positivo. El pad está íntegro y el tornillo del soporte tiene holgura.'},
  {action:'solder',label:'Resoldar el terminal positivo',instruction:'Con el pad inspeccionado y la placa aislada, rehace la unión del terminal positivo.',result:'El estaño forma una unión continua entre el terminal y su pad.'},
  {action:'secure',label:'Fijar el soporte del jack',instruction:'Sujeta el soporte al chasis para que la clavija no cargue el peso sobre la soldadura.',result:'El soporte queda firme. El banco confirma que no hay puente entre positivo y masa.'},
  {action:'rebuild',label:'Cerrar y reconectar el equipo',instruction:'Con la unión y el anclaje revisados, prepara la laptop para repetir la prueba.',result:'Batería y adaptador reconectados.'},
]

export function newJackJob() {
  return {id:'jack',phase:'intake',position:0,probe:'pad',sweep:'idle',captures:[],stage:0,verified:false}
}

export function jackVoltage(probe,position,repaired) {
  return probe === 'pad' && position === 1 && !repaired ? 0 : 19.2
}

export function restoreJackJob(raw) {
  const job = newJackJob()
  if (raw?.id !== 'jack' || !['diagnosis','repair','verify','delivered'].includes(raw.phase)) return job
  job.captures = probes.filter(id => Array.isArray(raw.captures) && raw.captures.includes(id))
  job.phase = 'diagnosis'
  if (raw.phase !== 'diagnosis' && job.captures.length === 2) {
    job.stage = Number.isInteger(raw.stage) ? Math.max(0,Math.min(raw.stage,jackProcedure.length)) : 0
    job.phase = job.stage < jackProcedure.length ? 'repair' : 'verify'
    job.verified = job.phase === 'verify' && raw.verified === true
    if (job.verified && raw.phase === 'delivered') job.phase = 'delivered'
  }
  if (['diagnosis','verify'].includes(job.phase)) {
    job.probe = probes.includes(raw.probe) ? raw.probe : 'pad'
    job.position = positions.includes(raw.position) ? raw.position : 0
    const canRecord = job.phase === 'diagnosis' || job.probe === 'pad'
    if (canRecord && (raw.sweep === 'center' && job.position === 0 || raw.sweep === 'raised' && job.position === 1)) job.sweep = raw.sweep
  }
  return job
}

// One recording reproduces the customer's movement at one fixed electrical point.
export function actOnJack(job, action, value) {
  const result = (message, changes) => ({job:changes ? {...job,...changes} : job, message})
  if (job.phase === 'intake' && action === 'accept') return result('',{phase:'diagnosis'})
  if (job.phase === 'repair') {
    const current = jackProcedure[job.stage]
    if (action !== current.action) return result(job.stage === 0 ? 'Aísla la alimentación antes de tocar la placa.' : current.instruction)
    const stage = job.stage + 1
    return result(current.result,{stage,phase:stage === jackProcedure.length ? 'verify' : 'repair'})
  }
  if (!['diagnosis','verify'].includes(job.phase)) return result('')
  const verifying = job.phase === 'verify'
  if (action === 'probe' && probes.includes(value)) {
    if (job.probe === value) return result('')
    return result(job.sweep === 'idle' ? '' : 'Cambiaste de punto. Empieza una nueva captura en el centro.',{probe:value,sweep:'idle'})
  }
  if (action === 'record') {
    if (verifying && job.probe !== 'pad') return result('Repite la medición en P2, la pista donde se perdió la alimentación.')
    if (job.position !== 0) return result('Vuelve al centro para tomar la lectura inicial.')
    return result('Captura iniciada. Sube la clavija y devuélvela al centro.',{sweep:'center'})
  }
  if (action === 'position' && positions.includes(value)) {
    if (value === job.position) return result('')
    if (job.sweep === 'center' && value === 1) return result('Posición alta registrada. Vuelve al centro para guardar.',{position:value,sweep:'raised'})
    if (job.sweep === 'raised' && value === 0) {
      const capture = verifying ? {verified:true} : {captures:[...new Set([...job.captures,job.probe])]}
      return result('Recorrido guardado en la bitácora.',{position:0,sweep:'idle',...capture})
    }
    return result(job.sweep === 'idle' ? '' : 'El recorrido cambió. Vuelve al centro y empieza otra captura.',{position:value,sweep:'idle'})
  }
  if (action === 'diagnose' && !verifying) {
    if (job.captures.length < 2) return result('Registra el mismo movimiento en P1 y P2 para saber entre qué puntos ocurre el corte.')
    if (value === 'adapter') return result('P1 mantiene la tensión cuando se pierde en P2. La alimentación sí llega al terminal del jack.')
    if (value === 'battery') return result('La tensión desaparece en la entrada de la placa al mover la clavija. Comprueba esa unión antes de investigar la batería.')
    if (value === 'joint') return result('',{phase:'repair',position:0,probe:'pad',sweep:'idle'})
  }
  if (action === 'deliver' && verifying) {
    if (!job.verified) return result('Una lectura en reposo no reproduce el síntoma. Guarda un recorrido en P2 después de reparar.')
    return result('',{phase:'delivered',position:0,probe:'pad',sweep:'idle'})
  }
  return result('')
}

