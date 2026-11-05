export const serviceOrders = {
  memory: {
    number: '002', title: 'Enciende, pero la pantalla queda negra.', part: 'ram', specialty: 'Memoria',
    quote: 'Le puse una memoria de 8 GB. Desde entonces se enciende el indicador, pero nunca aparece el logo.',
    goal: 'Recupera el arranque y comprueba que los 8 GB funcionan.',
    observations: [
      { id:'post', label:'Leer el indicador de diagnóstico', result:'El patrón de este modelo corresponde a un fallo al inicializar la memoria. El equipo se detiene antes de mostrar el logo.' },
      { id:'part', label:'Contrastar la etiqueta con el manual', result:'El número de parte del módulo de 8 GB aparece en la lista de SO-DIMM compatibles con este equipo.' },
      { id:'display', label:'Probar una pantalla externa', result:'La salida externa tampoco da imagen. Esta prueba por sí sola no distingue una avería de pantalla de un arranque incompleto.' },
    ],
    evidence: ['post','part'],
    suspects: [
      { id:'panel', label:'Sustituir el panel de la laptop', feedback:'El autodiagnóstico se detiene antes de inicializar el video. Investiga primero la etapa que señala el indicador.' },
      { id:'seating', label:'Inspeccionar el asiento del módulo', correct:true },
      { id:'bios', label:'Reprogramar el firmware', feedback:'La falla empezó después de instalar la RAM. Ya puedes inspeccionar el montaje antes de modificar el firmware.' },
    ],
    benchTitle:'Zócalo de memoria', targets: { module:'A · Módulo SO-DIMM', clips:'B · Clips laterales', socket:'C · Llave del zócalo' },
    procedure: [
      { action:'isolate', instruction:'Prepara el equipo para abrirlo.', result:'Equipo apagado, adaptador retirado y batería aislada según el manual. Al abrirlo se ve un extremo levantado y un clip fuera de su muesca.' },
      { action:'clips', instruction:'Libera la retención para poder retirar la memoria sin doblarla.', result:'Los clips están abiertos y el módulo se ha elevado.' },
      { action:'module', instruction:'Retira el módulo por los bordes siguiendo el ángulo del conector.', result:'La memoria está fuera. La llave del zócalo y la muesca del módulo quedan a la vista.' },
      { action:'socket', instruction:'Alinea la muesca e introduce los contactos en el zócalo.', result:'El borde de contactos ha entrado por completo. El módulo sigue inclinado.' },
      { action:'module', instruction:'Baja el borde libre hasta que los dos seguros enganchen.', result:'La memoria queda paralela a la placa y ambos clips sujetan sus muescas.' },
      { action:'rebuild', instruction:'Prepara la laptop para el encendido de prueba.', result:'Batería reconectada, tapa cerrada y adaptador conectado.' },
    ],
    beforeTest:'Antes del servicio, la inicialización de memoria se detenía antes del logo.',
    bootLines:['POST completado','Memoria detectada · 8192 MB'],
    testAction:'Ejecutar prueba de memoria',
    testLines:['Memoria probada · 8192 MB','Patrones completados · 0 errores'],
    delivery:'El equipo completa el arranque, reconoce los 8 GB instalados y termina la prueba de memoria sin errores.',
  },
  cooling: {
    number:'003', title:'Se apaga bajo carga.', part:'fan', specialty:'Refrigeración',
    quote:'Después de una limpieza funciona en el escritorio. Cuando vuelvo a exportar un video, se apaga.',
    goal:'Recupera la ventilación y repite la carga que provocaba el apagado.',
    observations:[
      { id:'log', label:'Recuperar la última curva térmica', result:'Durante la exportación anterior, la CPU pasó de 44 a 92 °C y el registro terminó con un apagado térmico.' },
      { id:'tach', label:'Leer el registro del ventilador', result:'En esa misma exportación el controlador pidió ventilación alta. El tacómetro siguió en 0 RPM y no se detectó flujo de aire.' },
      { id:'vents', label:'Inspeccionar las rejillas', result:'Las rejillas exteriores están libres. Todavía falta comprobar si la turbina recibe la orden de giro.' },
    ],
    evidence:['log','tach'],
    suspects:[
      { id:'paste', label:'Cambiar la pasta térmica', feedback:'La pasta modifica el contacto con el disipador. Las 0 RPM con una orden de giro alta justifican revisar primero el ventilador.' },
      { id:'fan', label:'Inspeccionar la conexión del ventilador', correct:true },
      { id:'ssd', label:'Cambiar la unidad de almacenamiento', feedback:'El evento registrado es térmico. Comprueba la refrigeración que debía responder a la carga.' },
    ],
    benchTitle:'Turbina y conector FAN1', targets:{ lead:'A · Ficha del cable', header:'B · Conector FAN1', guide:'C · Guía del mazo' },
    procedure:[
      { action:'isolate', instruction:'Espera a que el equipo se enfríe y aísla la alimentación antes de abrirlo.', result:'Equipo frío y apagado, adaptador y batería aislados según el manual. Se puede inspeccionar el mazo de la turbina.' },
      { action:'lead', instruction:'Sigue los hilos desde la turbina e inspecciona la ficha por su carcasa.', result:'La ficha de la turbina está fuera del conector. Los terminales y el alojamiento se ven íntegros.' },
      { action:'header', instruction:'Alinea la ficha con la guía del conector y asiéntala por su carcasa.', result:'La ficha queda asentada en FAN1 hasta el tope.' },
      { action:'guide', instruction:'Recoge el mazo en su guía para dejar libres las aspas y el borde de la tapa.', result:'El cable está sujeto. El paso de aire y las aspas quedan libres.' },
      { action:'rebuild', instruction:'Prepara el equipo cerrado para repetir la prueba.', result:'Batería reconectada, tapa cerrada y adaptador conectado.' },
    ],
    beforeTest:'Antes del servicio la turbina registró 0 RPM durante la exportación.',
    bootLines:['POST completado','Sistema listo · carga en reposo'],
    testAction:'Repetir la exportación de prueba',
    testLines:['Exportación completada','CPU estabilizada · 71 °C','Ventilador · 3600 RPM'],
    delivery:'La laptop completó la misma exportación. La turbina respondió al aumento de carga y la temperatura se estabilizó durante la prueba.',
  },
}

export function newServiceJob(id) {
  return { id, phase:'intake', observations:[], stage:0, booted:false, tested:false, history:[] }
}

export function applyServiceAction(job, action) {
  const order = serviceOrders[job.id]
  let change
  let message = ''
  if (job.phase === 'intake' && action === 'accept') {
    change = { phase:'diagnosis' }
  } else if (job.phase === 'diagnosis') {
    const obs = order.observations.find(item => action === 'observe/' + item.id)
    const suspect = order.suspects.find(item => action === 'diagnose/' + item.id)
    if (job.id === 'cooling' && action === 'observe/thermal') {
      const observations = [...new Set([...job.observations, 'log', 'tach'])]
      if (observations.length !== job.observations.length) change = { observations }
      message = 'Registro completo: temperatura, orden de giro y RPM guardadas bajo la misma carga.'
    } else if (obs) {
      message = obs.result
      if (!job.observations.includes(obs.id)) change = { observations:[...job.observations,obs.id] }
    } else if (suspect) {
      if (!order.evidence.every(id => job.observations.includes(id))) message = 'Reúne indicios de las dos comprobaciones que relacionan el síntoma con una etapa del equipo.'
      else if (!suspect.correct) message = suspect.feedback
      else change = { phase:'repair' }
    }
  } else if (job.phase === 'repair') {
    const current = order.procedure[job.stage]
    if (action === current.action) {
      const stage = job.stage + 1
      change = { stage, phase:stage === order.procedure.length ? 'verify' : 'repair' }
      message = current.result
    } else if (!job.stage) message = 'La alimentación sigue conectada. Apaga y aísla el equipo antes de tocar la pieza.'
    else if (action === 'rebuild') message = 'La intervención sigue pendiente. Completa el montaje antes de reconectar la batería.'
    else message = current.instruction
  } else if (job.phase === 'verify') {
    if (action === 'power' && !job.booted) change = { booted:true }
    if (action === 'test' && !job.tested) {
      if (job.booted) change = { tested:true }
      else message = 'Enciende primero el equipo para ejecutar el diagnóstico.'
    }
    if (action === 'deliver') {
      if (job.booted && job.tested) change = { phase:'delivered' }
      else message = 'Antes de entregar, comprueba el arranque y completa la prueba de funcionamiento.'
    }
  }
  return { job:change ? { ...job,...change,history:[...job.history,action] } : job, message }
}

export function restoreServiceJob(id, raw) {
  let job = newServiceJob(id)
  if (raw?.id !== id || !Array.isArray(raw.history)) return job
  // Replaying accepted actions keeps the physical assembly and delivery status in agreement.
  for (const action of raw.history.slice(0,32)) {
    if (typeof action === 'string') job = applyServiceAction(job,action).job
  }
  return job
}
