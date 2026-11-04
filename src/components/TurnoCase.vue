<script setup>
import OrderProgress from './OrderProgress.vue'
import { computed, ref, watch, nextTick } from 'vue'
import BoardScene from './BoardScene.vue'
import CaseReplay from './CaseReplay.vue'
import PowerStation from './PowerStation.vue'
import BootDisplay from './BootDisplay.vue'
import Icon from './Icon.vue'
import { testPoints } from '../simulation.js'
import { interview, inspections, conclusions, followUps, newTicket, benchReading, pointName, readingKey, reportFeedback } from '../game/turno.js'

defineProps({ reducedMotion:Boolean })
const ticket = defineModel({ required:true })
const emit = defineEmits(['solve','reference','menu'])
const phases = ['intake','bench','report','repair','closed']
const phaseLabels = ['Recepción','Medición','Diagnóstico','Reparación','Entrega']
const section = ref(null)
const scene = ref(null)
const hints = ref(0)
const message = ref('')
const lastReply = ref('')
const feedback = ref('')
const inspection = ref('')
const stageNumber = computed(() => phases.indexOf(ticket.value.phase))
const display = computed(() => ticket.value.grounded && ticket.value.redPoint ? benchReading(ticket.value.redPoint, ticket.value.powered).display.replace('.', ',') : '— —')
const hintsText = [
  'Empieza por el conector de entrada. Una lectura en el núcleo por sí sola dice poco sobre el lugar donde se corta la alimentación.',
  'Fija la punta negra en GND. Conecta el adaptador simulado y mide con la roja en los dos lados de la protección.',
  'Guarda las lecturas de TP1 y TP2 con el adaptador conectado. Compáralas en tu informe.',
]
const patch = values => { ticket.value = { ...ticket.value, ...values } }
function changePhase(phase) { patch({ phase }) }
watch(() => ticket.value.phase, async () => {
  message.value = ''; feedback.value = ''
  await nextTick()
  section.value?.focus({ preventScroll:true })
  section.value?.scrollIntoView({ block:'start' })
})
function ask(item) {
  if (!ticket.value.asked.includes(item.id)) patch({ asked:[...ticket.value.asked,item.id] })
  lastReply.value = item.reply
}
function examine(item) {
  if (!ticket.value.inspected.includes(item.id)) patch({ inspected:[...ticket.value.inspected,item.id] })
  inspection.value = item.observation
}
function probe(id) {
  if (id === 'gnd') patch({ grounded:true })
  else if (testPoints.some(point => point.id === id)) patch({ redPoint:id })
  message.value = ''
}
function record() {
  if (!ticket.value.grounded || !ticket.value.redPoint) {
    message.value = 'Coloca la punta negra en GND y elige un punto para la roja.'
    return
  }
  const reading = benchReading(ticket.value.redPoint, ticket.value.powered)
  const key = readingKey(reading)
  if (!ticket.value.readings.some(item => readingKey(item) === key)) patch({ readings:[...ticket.value.readings,reading] })
  message.value = pointName(reading.point) + ' · ' + display.value + ' V. Lectura guardada' + (reading.powered ? '.' : ' con el adaptador desconectado.')
}
function evidence(key) {
  const selected = ticket.value.evidence
  if (selected.includes(key)) patch({ evidence:selected.filter(id => id!==key) })
  else if (selected.length<2) patch({ evidence:[...selected,key] })
  feedback.value = ''
}
function submit() {
  feedback.value = reportFeedback(ticket.value)
  if (!feedback.value) patch({ phase:'repair' })
}
function deliver() { patch({ phase:'closed' }); emit('solve','no-power') }
function restart() {
  ticket.value = newTicket()
  lastReply.value = ''; inspection.value = ''; hints.value = 0
}
</script>
<template>
  <section ref="section" tabindex="-1" class="turno" aria-label="Turno de taller">
    <button class="case-link" @click="emit('menu')">← Órdenes del taller</button>
    <header class="order-header">
      <div><span class="ticket-kicker"><i></i> TURNO DE TALLER / NIVEL INICIAL</span><h1>Una laptop <em>sin señales.</em></h1></div>
      <div class="order-tag"><small>ORDEN DE SERVICIO</small><strong>№ 001</strong><span>{{ ticket.phase==='closed'?'EQUIPO ENTREGADO':ticket.phase==='repair'?'EN REPARACIÓN':'DIAGNÓSTICO' }}</span></div>
    </header>
    <OrderProgress :labels="phaseLabels" :step="stageNumber" :digits="2"/>

    <div v-if="ticket.phase==='intake'" class="order-intake">
      <article class="intake-card"><span class="ticket-kicker">RECEPCIÓN · LAPTOP CON ENTRADA DC</span>
        <h2>Escucha al cliente.</h2>
        <blockquote>«Ayer funcionaba. Hoy conecto el cargador y ni siquiera prende la luz».</blockquote>
        <p>Localiza el corte con el multímetro, confirma la pieza averiada bajo el microscopio y devuelve la laptop encendida. Puedes empezar haciendo una pregunta.</p>
        <div class="interview-list"><button v-for="item in interview" :key="item.id" @click="ask(item)"><span aria-hidden="true">{{ ticket.asked.includes(item.id)?'✓':'?' }}</span>{{ item.question }}</button></div>
        <p v-if="lastReply" class="case-answer" role="status">«{{ lastReply }}»</p>
        <button class="ticket-btn primary" @click="changePhase('bench')">Aceptar el equipo <Icon name="ArrowRight" :size="17"/></button>
      </article>
      <aside class="incoming-machine"><div><span class="ticket-kicker">EQUIPO RECIBIDO</span><span>ORDEN 001</span></div><img src="/turno-recepcion.svg" alt="Laptop apagada, adaptador de corriente y multímetro sobre la mesa de recepción."/><p>La orden se guarda en este navegador. Puedes dejar las herramientas y volver al mismo punto.</p></aside>
    </div>

    <template v-else-if="ticket.phase==='bench'">
      <div class="bench-intro"><div><span class="ticket-kicker">PUESTO 01 · EQUIPO DE PRÁCTICA</span><h2>Elige dónde medir.</h2></div><button class="case-link" @click="changePhase('intake')">Volver a preguntar al cliente ↗</button></div>
      <p class="bench-instructions">La batería interna está desconectada. Conecta el adaptador simulado, fija la punta negra en GND y toca un punto de la placa con la roja. Guarda las lecturas que te ayuden a localizar la falla.</p>
      <div class="order-bench">
        <article class="probe-sheet">
          <div class="ticket-running"><span>PLACA / VISTA DE MEDICIÓN</span><span>{{ ticket.powered?'ADAPTADOR CONECTADO':'SIN ADAPTADOR' }}</span></div>
          <div class="ticket-stage"><BoardScene ref="scene" device="laptop" mode="board" flow-kind="energy" guided probe-mode :red-point="ticket.redPoint" :grounded="ticket.grounded" :step="-1" :selected="''" :reduced-motion="reducedMotion" @probe="probe"/></div>
          <div class="probe-tools"><span>Arrastra la placa para girarla.</span><button aria-label="Acercar la placa del caso" @click="scene?.zoom(1)">＋</button><button aria-label="Alejar la placa del caso" @click="scene?.zoom(-1)">−</button><button @click="scene?.reset()">Centrar</button></div>
          <details class="case-details"><summary>Seleccionar puntas por nombre</summary><div class="probe-list"><button :aria-pressed="ticket.grounded" @click="probe('gnd')">Negra · GND</button><button v-for="p in testPoints" :key="p.id" :aria-pressed="ticket.redPoint===p.id" @click="probe(p.id)">{{ p.name }}</button></div></details>
        </article>
        <aside class="bench-instrument"><div class="instrument-face">
          <span class="ticket-kicker">INSTRUMENTO 01 / MULTÍMETRO</span><div class="case-lcd" aria-live="polite"><small>TENSIÓN CONTINUA</small><div>{{ display }} <b>V</b></div><small>{{ ticket.redPoint?pointName(ticket.redPoint):'Punta roja libre' }}</small></div>
          <div class="probe-status"><span><i></i> Negra · {{ ticket.grounded?'GND':'libre' }}</span><span><i></i> Roja · {{ ticket.redPoint?pointName(ticket.redPoint).split(' · ')[0]:'libre' }}</span></div>
          <button class="adapter-switch" role="switch" :aria-checked="ticket.powered" aria-label="Adaptador simulado" @click="patch({powered:!ticket.powered});message=''"><span class="adapter-light"></span>{{ ticket.powered?'Desconectar adaptador':'Conectar adaptador' }}</button>
          <button class="ticket-btn meter-save" @click="record"><Icon name="NotebookPen" :size="17"/> Guardar lectura</button>
        </div><p v-if="message" class="case-message" role="status">{{ message }}</p></aside>
      </div>
      <div class="desk-notes"><section><span class="ticket-kicker">BITÁCORA</span><h3>Lecturas guardadas <small>{{ ticket.readings.length }}</small></h3>
        <p v-if="!ticket.readings.length">Aquí aparecerán el punto, la tensión y el estado del adaptador.</p>
        <ul v-else class="evidence-log"><li v-for="reading in ticket.readings" :key="readingKey(reading)"><span>{{ pointName(reading.point) }}<small>Adaptador {{ reading.powered?'conectado':'desconectado' }}</small></span><b>{{ reading.display.replace('.',',') }} V</b></li></ul>
        <button class="ticket-btn dark" @click="changePhase('report')">Preparar el informe <Icon name="ArrowRight" :size="17"/></button>
      </section><section><span class="ticket-kicker">HERRAMIENTAS DE APOYO</span><h3>Otras comprobaciones</h3>
        <div class="interview-list"><button v-for="item in inspections" :key="item.id" @click="examine(item)">{{ ticket.inspected.includes(item.id)?'✓ ':'' }}{{ item.action }}</button></div>
        <p v-if="inspection" class="case-answer" role="status">{{ inspection }}</p>
        <button class="case-link" @click="hints=Math.min(hints+1,hintsText.length)" :disabled="hints===hintsText.length">Pedir pista ({{ hints }} / {{ hintsText.length }})</button>
        <p v-if="hints" class="case-answer" role="status">{{ hintsText[hints-1] }}</p>
        <button class="case-link" @click="emit('reference')">Consultar el encendido de una placa sana ↗</button>
      </section></div>
    </template>

    <form v-else-if="ticket.phase==='report'" class="order-report" @submit.prevent="submit">
      <span class="ticket-kicker">INFORME DE SERVICIO / 001</span><h2>Sustenta tu diagnóstico.</h2><p>Elige la pareja de lecturas que delimita la falla, una conclusión y la siguiente comprobación.</p>
      <fieldset><legend>01 · ¿Qué dos lecturas sostienen tu conclusión?</legend>
        <p v-if="!ticket.readings.length">Tu bitácora está vacía. Vuelve al banco y guarda una lectura a cada lado de la etapa que quieres investigar.</p>
        <label v-for="reading in ticket.readings" :key="readingKey(reading)"><input type="checkbox" :checked="ticket.evidence.includes(readingKey(reading))" :disabled="ticket.evidence.length===2 && !ticket.evidence.includes(readingKey(reading))" @change="evidence(readingKey(reading))"/><span>{{ pointName(reading.point) }} · <b>{{ reading.display.replace('.',',') }} V</b> · Adaptador {{ reading.powered?'conectado':'desconectado' }}</span></label>
      </fieldset>
      <fieldset><legend>02 · ¿Qué puedes afirmar?</legend><label v-for="item in conclusions" :key="item.id"><input type="radio" name="conclusion" :checked="ticket.conclusion===item.id" @change="patch({conclusion:item.id});feedback=''"/>{{ item.label }}</label></fieldset>
      <fieldset><legend>03 · ¿Qué comprobarías después?</legend><label v-for="item in followUps" :key="item.id"><input type="radio" name="followup" :checked="ticket.followUp===item.id" @change="patch({followUp:item.id});feedback=''"/>{{ item.label }}</label></fieldset>
      <label class="note-field">Nota para el cliente (opcional)<textarea maxlength="400" rows="2" :value="ticket.note" @input="patch({note:$event.target.value})" placeholder="Explica con tus palabras lo que encontraste."></textarea></label>
      <p v-if="feedback" class="case-answer" role="status">{{ feedback }}</p>
      <div class="report-actions"><button type="button" class="case-link" @click="changePhase('bench')">← Volver a medir</button><button class="ticket-btn primary" type="submit">Validar y pasar al microscopio <Icon name="ArrowRight" :size="16"/></button></div>
    </form>

    <PowerStation v-else-if="ticket.phase==='repair'" :model-value="ticket.repairEvents" @update:model-value="events=>patch({repairEvents:events})" @deliver="deliver"/>
    <template v-else>
      <article class="order-closed"><span class="ticket-kicker">✓ EQUIPO ENTREGADO / 001</span><h2>La laptop volvió a encender.</h2><p>Confirmaste que PR1 estaba abierta fuera del circuito y soldaste el repuesto. Con el mismo adaptador, <b>TP2 pasó de 0,00 V a 19,00 V</b>. El equipo completó la autoprueba de arranque.</p><blockquote v-if="ticket.note">«{{ ticket.note }}»</blockquote></article>
      <BootDisplay on :lines="['POST correcto','Orden 001 · equipo verificado']"/>
      <button class="ticket-btn dark" @click="emit('menu')">Elegir otro reto ↗</button>
      <details class="delivery-replay"><summary>Comparar la falla original con la secuencia de una placa sana</summary><CaseReplay :reduced-motion="reducedMotion"/></details>
      <button class="case-link retry-case" @click="restart">Practicar de nuevo con una orden en blanco ↗</button>
    </template>
  </section>
</template>
