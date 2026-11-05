<script setup>
import OrderProgress from './OrderProgress.vue'
import { computed, nextTick, ref, watch } from 'vue'
import JackBench from './JackBench.vue'
import Icon from './Icon.vue'
import LearningGuide from './workshop/LearningGuide.vue'
import { useJackTool } from '../game/jackTools.js'
import { actOnJack, jackProcedure, jackVoltage, newJackJob, positionNames, probeNames, sweepPositions } from '../game/jackChallenge.js'

const job = defineModel({required:true})
defineEmits(['menu'])
const notice = ref('')
const noticeArea = ref('')
const heading = ref(null)
const tool = ref('scope')
const warmed = ref([])
const benchTools = [['scope','Lupa'],['iron','Cautín'],['driver','Destornillador']]
function chooseTool(id) { tool.value=id; warmed.value=[] }
function useTool(target) {
  const result = useJackTool(job.value.stage, tool.value, target, warmed.value)
  warmed.value = result.warmed
  if (result.action) act(result.action)
  else { notice.value=result.message; noticeArea.value='bench' }
}
const phases = ['intake','diagnosis','repair','verify','delivered']
const labels = ['Recepción','Medición','Intervención','Prueba','Entrega']
const measuring = computed(()=>['diagnosis','verify'].includes(job.value.phase))
const fixed = computed(()=>job.value.stage >= 3)
const powered = computed(()=>job.value.phase !== 'repair' || job.value.stage === 0)
const voltage = n => n.toFixed(1).replace('.',',')+' V'
const live = computed(()=>jackVoltage(job.value.probe,job.value.position,fixed.value))
const charge = computed(()=>jackVoltage('pad',job.value.position,fixed.value) > 0)
const rows = computed(()=>{
  const entries = job.value.captures.map(id=>({label:'Antes · '+idToLabel(id),point:id,fixed:false}))
  if (job.value.verified) entries.push({label:'Después · P2',point:'pad',fixed:true})
  return entries.map(row=>({...row,values:sweepPositions.map(pos=>jackVoltage(row.point,pos,row.fixed))}))
})
function idToLabel(id) { return id === 'pin'?'P1':'P2' }
function spark(values) { return values.map((value,i)=>(6+32*i)+','+(value?5:25)).join(' ') }
function act(action,value) {
  const result = actOnJack(job.value,action,value)
  noticeArea.value = ['diagnose','deliver'].includes(action) ? 'decision' : 'bench'
  notice.value = result.message
  if (job.value !== result.job) job.value = result.job
}
watch(()=>job.value.phase,async()=>{
  notice.value=''
  await nextTick()
  heading.value?.focus({preventScroll:true})
  heading.value?.scrollIntoView({block:'start'})
})
</script>

<template>
  <section class="turno jack-order" aria-label="Orden de servicio 004">
    <button class="case-link" @click="$emit('menu')">← Volver a las órdenes</button>
    <header class="order-header"><div><span class="ticket-kicker"><i></i> ORDEN 004 / FALLA INTERMITENTE</span><h1 ref="heading" tabindex="-1">Solo carga <em>en cierta posición.</em></h1></div></header>
    <OrderProgress :labels="labels" :step="phases.indexOf(job.phase)"/>
    <LearningGuide v-if="job.phase==='intake' || job.phase==='delivered'" topic="jack" :phase="job.phase"/>
    <div v-if="job.phase==='intake'" class="order-intake">
      <article class="intake-card"><span class="ticket-kicker">DECLARACIÓN DEL CLIENTE</span><h2>«Solo pasa si muevo el cable».</h2>
        <blockquote>«En la mesa carga bien. Si levanto un poquito la clavija, el icono de carga desaparece. Cuando la suelto, vuelve».</blockquote>
        <p>La laptop llega encendida con batería. Reproduce el gesto, localiza dónde se corta la alimentación y comprueba que el equipo sigue cargando después de repararlo.</p>
        <button class="ticket-btn primary jack-gap" @click="act('accept')">Aceptar la orden <Icon name="ArrowRight" :size="17"/></button>
      </article>
      <figure class="jack-intake"><div class="ticket-running">MUESTRA DE BANCO / DC–IN</div><img src="/components/dc-jack.svg" alt="Clavija y conector cilíndrico de alimentación de la laptop"/><figcaption>Equipo de práctica con jack DC soldado a la placa.</figcaption></figure>
    </div>
    <template v-else-if="job.phase!=='delivered'">
      <span class="ticket-kicker">{{ measuring?'REGISTRADOR DE TENSIÓN / DC':'BANCO DE REPARACIÓN / JACK DC' }}</span>
      <h2>{{ job.phase==='diagnosis'?'Reproduce el corte.':job.phase==='repair'?'Intervén sobre la unión.':'Repite el movimiento del cliente.' }}</h2>
      <p v-if="measuring" class="jack-instruction">{{ job.phase==='diagnosis'?'En P1 mides el terminal positivo del conector. En P2 mides la pista justo después de su soldadura. La punta negra está fija en masa. Compara ambos puntos mientras mueves la misma clavija.':'En el mismo punto P2, registra otra vez centro, arriba y centro. Comprueba que la máquina sigue cargando en las tres posiciones del recorrido.' }}</p>
      <div class="station-layout">
        <div class="station-figure"><JackBench :position="job.position" :probe="job.probe" :stage="job.stage" :powered="powered" :repair-mode="job.phase==='repair'" @target="useTool" @position="p=>act('position',p)" @probe="p=>act('probe',p)"/></div>
        <aside v-if="measuring" class="station-tray">
          <span class="ticket-kicker">MULTÍMETRO / TENSIÓN CONTINUA</span>
          <div class="jack-lcd" aria-live="polite"><small>{{ probeNames[job.probe] }} · {{ positionNames[job.position] }}</small><strong>{{ voltage(live) }}</strong><span>{{ charge?'● Batería cargando':'○ Alimentación por batería' }}</span></div>
          <fieldset class="jack-controls"><legend>1 · Coloca la punta roja</legend><button v-for="(name,id) in probeNames" :key="id" :aria-pressed="job.probe===id" @click="act('probe',id)">{{ name }}</button></fieldset>
          <fieldset class="jack-controls"><legend>2 · Mueve la clavija</legend><button v-for="pos in [-1,0,1]" :key="pos" :aria-pressed="job.position===pos" @click="act('position',pos)">{{ positionNames[pos] }}</button></fieldset>
          <p class="jack-hint">Desde el centro, inicia la captura. Sube la clavija y vuelve al centro para guardar las tres lecturas.</p>
          <button class="ticket-btn dark" :disabled="job.sweep!=='idle'" @click="act('record')">{{ job.sweep==='center'?'Grabando · sube la clavija':job.sweep==='raised'?'Grabando · vuelve al centro':'Iniciar captura' }}</button>
          <p v-if="notice && noticeArea==='bench'" role="status" class="station-note">{{ notice }}</p>
        </aside>
        <aside v-else class="station-tray">
          <span class="ticket-kicker">INTERVENCIÓN {{ job.stage+1 }} / {{ jackProcedure.length }}</span><h3>{{ jackProcedure[job.stage].label }}</h3>
          <p>{{ jackProcedure[job.stage].instruction }}</p><p v-if="job.stage" class="station-note">{{ jackProcedure[job.stage-1].result }}</p>
          <p>Elige una herramienta y toca una zona del dibujo. El cautín debe actuar en terminal y pad; el destornillador, en el soporte.</p>
          <div class="jack-controls"><button v-for="[id,label] in benchTools" :key="id" :aria-pressed="tool===id" @click="chooseTool(id)">{{label}}</button></div>
          <p v-if="warmed.length" role="status">Contacto preparado: {{warmed[0]==='pad'?'pad':'terminal'}} · falta la otra superficie.</p>
          <button v-if="job.stage===0" class="ticket-btn dark" @click="act('isolate')">Apagar y aislar la alimentación</button>
          <button v-if="job.stage===4" class="ticket-btn dark" @click="act('rebuild')">Cerrar y reconectar el equipo</button>
          <small class="jack-simulation-note">Gestos de banco simulados; no representan temperaturas ni tiempos de soldadura reales.</small>
          <p v-if="notice && notice!==jackProcedure[job.stage-1]?.result" role="status" class="case-answer">{{ notice }}</p>
          <LearningGuide topic="jack" phase="repair" :stage="job.stage"/>
        </aside>
      </div>
    </template>
    <article v-else class="order-closed"><span class="ticket-kicker">✓ EQUIPO ENTREGADO / 004</span><h2>Ahora carga aunque muevas la clavija.</h2><p>Confirmaste la fisura, recuperaste la unión y fijaste el soporte. Al repetir el movimiento del cliente, la entrada de la placa conservó sus {{ voltage(jackVoltage('pad',1,true)) }} y el indicador de carga permaneció activo.</p></article>
    <section v-if="job.phase!=='intake'" class="jack-journal">
      <span class="ticket-kicker">BITÁCORA / CENTRO → ARRIBA → CENTRO</span><h3>La misma prueba en cada punto</h3>
      <p v-if="!rows.length">Tus recorridos aparecerán aquí al volver al centro durante una captura.</p>
      <table v-else><caption>Tensión respecto a masa en esta laptop simulada</caption><thead><tr><th>Punto</th><th>Centro</th><th>Arriba</th><th>Centro</th><th class="jack-wave">Traza</th></tr></thead><tbody>
        <tr v-for="row in rows" :key="row.label"><th scope="row">{{ row.label }}</th><td v-for="(v,i) in row.values" :key="i">{{ voltage(v) }}</td><td class="jack-wave"><svg viewBox="0 0 76 30" aria-hidden="true"><polyline :points="spark(row.values)" fill="none" stroke="currentColor" stroke-width="2.5"/></svg></td></tr>
      </tbody></table>
    </section>
    <section v-if="job.phase==='diagnosis'" class="jack-verdict"><span class="ticket-kicker">DECISIÓN DE BANCO</span><h3>¿Qué revisarías primero?</h3><p>Usa las dos capturas para elegir dónde buscar el mal contacto.</p>
      <LearningGuide v-if="job.captures.length===2" topic="jack" phase="diagnosis"/>
      <div class="interview-list"><button @click="act('diagnose','adapter')">El cable de salida del adaptador</button><button @click="act('diagnose','joint')">La unión del terminal positivo con la placa</button><button @click="act('diagnose','battery')">El conector de la batería</button></div>
      <div v-if="notice && noticeArea==='decision'" role="status" class="jack-decision-note">{{ notice }}</div>
    </section>
    <div v-else-if="job.phase==='verify'" class="jack-verdict"><button class="ticket-btn primary" @click="act('deliver')">Entregar el equipo</button><p v-if="notice && noticeArea==='decision'" role="status" class="jack-decision-note">{{ notice }}</p></div>
    <div v-else-if="job.phase==='delivered'" class="report-actions"><button class="ticket-btn dark" @click="$emit('menu')">Volver al taller ↗</button><button class="case-link" @click="job=newJackJob()">Repetir esta orden</button></div>
  </section>
</template>

<style scoped>
.jack-intake,.jack-journal,.jack-verdict {background:var(--paper-white);border:1px solid var(--rule);margin:0}.jack-intake img {width:100%;max-height:230px;object-fit:contain;background:#dbe9e5}.jack-intake figcaption {padding:12px 16px;color:#344c47}.jack-gap,.jack-journal,.jack-verdict {margin-top:16px}.jack-instruction {margin:0 0 16px}.jack-order h1:focus {outline:none}
.jack-simulation-note{display:block;margin-top:12px;font-size:.85rem;line-height:1.5;color:#4b6253}
.jack-lcd {background:#e0ead3;border:2px solid #344a41;padding:10px 15px;margin:12px 0;color:#20392e;display:grid;font-family:var(--mono)}.jack-lcd strong {font-size:clamp(2rem,4vw,3.1rem);line-height:1.3;text-align:right}.jack-lcd small,.jack-lcd span {font-size:.86rem}
.jack-controls {border:0;padding:0;margin:12px 0}.jack-controls legend {font-weight:700;margin-bottom:4px}.jack-controls button,.jack-tools button {padding:8px 10px;border:1px solid #8c9f95;margin:3px 5px 2px 0;background:#f3f2e8;color:#263e39;min-height:40px}.jack-controls button[aria-pressed=true] {background:#244b42;border-color:#244b42;color:white}.jack-tools {display:flex;flex-wrap:wrap;gap:3px}.jack-tools button:disabled,.jack-order button:disabled {opacity:.65}.jack-hint,.jack-order .jack-decision-note {font-size:.95rem}.jack-journal,.jack-verdict {padding:clamp(14px,2.3vw,26px)}.jack-journal table {border-collapse:collapse;width:100%;max-width:850px;font-variant-numeric:tabular-nums}.jack-journal caption {text-align:left;color:#485650;font-size:.88rem;margin-bottom:5px}.jack-journal td,.jack-journal th {border-top:1px solid #a9b3aa;padding:6px;text-align:left}.jack-journal td {white-space:nowrap}.jack-wave svg {width:72px;height:28px;color:#326853}.jack-verdict .interview-list {max-width:720px}.jack-order .jack-decision-note {margin:8px 0 0;color:#5d421c}
@media(max-width:500px){.jack-wave {display:none}.jack-journal th,.jack-journal td {font-size:.87rem;padding:6px 3px}}
</style>

