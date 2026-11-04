<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import BootDisplay from './BootDisplay.vue'
import Icon from './Icon.vue'
import { applyServiceAction, newServiceJob, serviceOrders } from '../game/serviceChallenges.js'

const props = defineProps({ id:{ type:String, required:true } })
const job = defineModel({ required:true })
defineEmits(['menu'])
const order = computed(() => serviceOrders[props.id])
const memory = computed(() => props.id === 'memory')
const phases = ['intake','diagnosis','repair','verify','delivered']
const phaseNames = ['Recepción','Diagnóstico','Intervención','Prueba','Entrega']
const stage = computed(() => job.value.stage)
const feedback = ref('')
const hinted = ref(false)
const heading = ref(null)
const phaseIndex = computed(() => phases.indexOf(job.value.phase))
const step = computed(() => order.value.procedure[stage.value])
const modulePose = computed(() => ['translate(7 13) rotate(-3 238 114)','translate(7 13) rotate(-3 238 114)','translate(0 7) scale(1 .91)','translate(-7 48) rotate(-3 238 114)','translate(0 12) scale(1 .88)'][stage.value] || '')
const markerPosition = computed(() => memory.value ? { module:[52,65], clips:[15,68], socket:[76,29] } : { lead:[56,67],header:[83,49],guide:[55,31] })
const fanSeated = computed(() => stage.value >= 3)
const fanRouted = computed(() => stage.value >= 4)
const wires = ['#e2b569','#303e47','#e3937c','#99c3d0']
function wire(index) {
  const position = index * 3
  const start = 'M183 ' + (188 + position)
  if (fanRouted.value) return start + ' Q222 203 223 172 V101 Q223 91 234 91 H272 Q284 91 290 103 L312 ' + (124 + position) + ' H343'
  return start + ' C233 213 288 202 301 164 Q308 145 ' + (fanSeated.value ? 325 : 293) + ' ' + (124 + position) + ' H' + (fanSeated.value ? 343 : 309)
}
function act(action) {
  const result = applyServiceAction(job.value, action)
  job.value = result.job
  feedback.value = result.message
  hinted.value = false
}
function restart() { job.value = newServiceJob(props.id) }
watch([() => props.id, () => job.value.phase], async () => {
  feedback.value = ''
  hinted.value = false
  await nextTick()
  heading.value?.focus({ preventScroll:true })
  heading.value?.scrollIntoView({block:'start'})
})
</script>
<template>
  <section class="turno service-case" :aria-label="'Orden de servicio '+order.number">
    <button class="case-link" @click="$emit('menu')">← Volver a las órdenes</button>
    <header class="order-header"><div><span class="ticket-kicker"><i></i> ORDEN {{ order.number }} / {{ order.specialty.toUpperCase() }}</span><h1 ref="heading" tabindex="-1">{{ order.title }}</h1></div></header>
    <ol class="order-progress svc-progress" aria-label="Etapas del servicio">
      <li v-for="(name,index) in phaseNames" :key="name" :class="{past:index<phaseIndex}" :aria-current="index===phaseIndex?'step':undefined"><span>{{ index<phaseIndex?'✓':index+1 }}</span> {{name}}</li>
    </ol>
    <div v-if="job.phase==='intake'" class="order-intake">
      <article class="intake-card">
        <span class="ticket-kicker">DECLARACIÓN DEL CLIENTE</span><h2>Un equipo en recepción.</h2>
        <blockquote>«{{ order.quote }}»</blockquote><p>{{ order.goal }}</p>
        <button class="ticket-btn primary svc-gap" @click="act('accept')">Aceptar la orden <Icon name="ArrowRight" :size="17"/></button>
      </article>
      <figure class="svc-intake-figure"><img :src="'/components/'+order.part+'.svg'" :alt="memory?'Identificación del módulo SO-DIMM':'Identificación de una turbina de laptop'"/><figcaption>PIEZA DE REFERENCIA · {{ memory?'SO-DIMM':'TURBINA' }}</figcaption></figure>
    </div>
    <div v-else-if="job.phase==='diagnosis'" class="svc-grid">
      <article class="svc-card">
        <span class="ticket-kicker">BANCO / RECOLECCIÓN DE INDICIOS</span><h2>¿Por dónde empezarías?</h2>
        <p>«{{ order.quote }}»</p><div class="interview-list">
          <button v-for="item in order.observations" :key="item.id" @click="act('observe/'+item.id)"><span aria-hidden="true">{{ job.observations.includes(item.id)?'✓':'+' }}</span>{{ item.label }}</button>
        </div>
        <div v-if="job.observations.length" class="svc-journal"><h3>Indicios registrados</h3><p v-for="item in order.observations.filter(o=>job.observations.includes(o.id))" :key="item.id">{{ item.result }}</p></div>
      </article>
      <aside class="svc-card svc-notepad"><span class="ticket-kicker">DECISIÓN DE BANCO</span><h2>Elige qué revisar.</h2><p>Usa los indicios de este equipo para decidir cuál sería la primera intervención.</p>
        <div class="interview-list"><button v-for="item in order.suspects" :key="item.id" @click="act('diagnose/'+item.id)">{{item.label}} ↗</button></div>
        <button class="case-link" @click="hinted=!hinted" :aria-expanded="hinted">Consultar una pista</button>
        <p v-if="hinted" class="case-answer">{{ memory?'Compara la etapa señalada por el indicador de diagnóstico con la compatibilidad del módulo instalado.':'Compara el momento del apagado con la velocidad real de la turbina registrada durante la carga.' }}</p>
      </aside>
    </div>
    <template v-else-if="job.phase==='repair'">
      <span class="ticket-kicker">BANCO / MONTAJE</span><h2>{{order.benchTitle}}</h2>
      <div class="svc-grid">
        <figure class="svc-bench">
          <div class="ticket-running"><span>VISTA DE SERVICIO</span><span>{{ stage===0?'EQUIPO RECIBIDO':'ALIMENTACIÓN AISLADA' }}</span></div>
          <div class="svc-surface">
            <svg viewBox="0 0 480 256" role="img" :aria-label="order.benchTitle">
              <rect width="480" height="256" fill="#203e44"/>
              <path d="M23 35H110L131 15H435L458 37V217L437 240H45L23 217Z" fill="#2e6358" stroke="#749485" stroke-width="3"/>
              <g fill="none" stroke="#739a81" opacity=".75">
                <path v-for="i in 6" :key="i" :d="'M39 '+(48+i*4)+' H79 L'+(106+i*2)+' '+(28+i*4)+' H'+(136+i*6)+' M'+(116+i*5)+' 212 L'+(130+i*5)+' 226 H375'"/>
                <path v-for="i in 4" :key="i" :d="'M'+(387+i*6)+' 29 V55 L'+(445+i*2)+' '+(105+i*4)+' V189'"/>
              </g>
              <g v-for="[x,y] in [[38,47],[440,46],[43,214],[432,217]]" :key="x" :transform="'translate('+x+' '+y+')'">
                <circle r="8" fill="#bca779"/><circle r="4" fill="#234048"/><circle r="2" fill="#152d34"/>
              </g>
              <g fill="#a9b9ae" stroke="#243f46" stroke-width="1.1">
                <rect v-for="i in 9" :key="i" :x="151+i*13" y="40" width="7" height="4" rx="1"/>
                <rect v-for="i in 4" :key="i" x="414" :y="141+i*9" width="11" height="5"/>
              </g>
              <template v-if="memory">
                <rect x="77" y="90" width="324" height="19" rx="3" fill="#171f28" stroke="#8e9894" stroke-width="2"/>
                <rect x="84" y="94" width="309" height="6" rx="2" fill="#b4b5a6"/>
                <rect x="174" y="89" width="7" height="22" fill="#ded7b7"/>
                <g :transform="modulePose">
                  <path d="M90 101H174V109H180V101H389V186L382 192H98L90 185V169L96 168V161L90 160Z" fill="#427a5c" stroke="#c3d1a0" stroke-width="2"/>
                  <g stroke="#e7c777" stroke-width="3"><path v-for="j in 52" :key="j" :d="(j<15 || j>16)?'M'+(91+j*5.55)+' 102v8':''"/></g>
                  <g v-for="j in 4" :key="j" :transform="'translate('+(107+(j-1)*69)+' 125)'">
                    <rect x="2" y="3" width="49" height="33" rx="2" fill="#26362f"/><rect width="49" height="32" rx="2" fill="#25383c" stroke="#7c8e85"/>
                    <path d="M8 9h22m-22 5h13" fill="none" stroke="#8a9d94"/><circle cx="6" cy="26" r="1.5" fill="#99a79d"/>
                  </g>
                  <rect x="200" y="171" width="73" height="11" rx="1" fill="#dcdcca"/><g stroke="#344449"><path v-for="j in 14" :key="j" :d="'M'+(203+j*3.4)+' 173v6'"/></g>
                </g>
                <path :d="stage>=5?'M79 108v58l13 5h7':'M79 108l-8 57 14 4'" fill="none" stroke="#cfcec0" stroke-width="5"/>
                <path :d="stage>=5?'M400 108v58l-11 5h-7':'M400 108l8 54-12 5'" fill="none" stroke="#cfcec0" stroke-width="5"/>
              </template>
              <template v-else>
                <path d="M70 63Q112 31 170 53Q207 63 219 94H277V144H223Q207 185 168 193Q115 210 80 177Q54 150 55 116Q55 87 70 63Z" fill="#a1afa9" stroke="#22383d" stroke-width="4"/>
                <path d="M64 114a76 69 0 1 0 152 0a76 69 0 1 0 -152 0" fill="#38484a" stroke="#cdd3c7" stroke-width="3"/>
                <g fill="#727f79" stroke="#223233" stroke-width="1">
                  <path v-for="j in 25" :key="j" :transform="'rotate('+j*14.4+' 140 115)'" d="M147 96Q159 72 186 66Q178 84 155 103Z"/>
                </g>
                <circle cx="140" cy="115" r="23" fill="#969f92" stroke="#263a3c" stroke-width="3"/><circle cx="140" cy="115" r="9" fill="#bac0ae"/>
                <g stroke="#566663" stroke-width="3"><path v-for="j in 12" :key="j" :d="'M'+(230+j*3.8)+' 98v42'"/></g>
                <g v-for="[x,y] in [[65,69],[83,177],[207,161]]" :key="x"><circle :cx="x" :cy="y" r="6" fill="#ced2bd"/><path :d="'M'+(x-3)+' '+y+'h6'" stroke="#3b4648" stroke-width="2"/></g>
                <rect x="350" y="114" width="40" height="31" rx="3" fill="#e4ddc3" stroke="#273d43" stroke-width="2"/>
                <rect x="348" y="119" width="17" height="21" rx="1" fill="#898d7f"/><path v-for="j in 4" :key="j" :d="'M350 '+(119+j*4)+'h10'" stroke="#dbc18d" stroke-width="2"/>
                <path v-for="(color,i) in wires" :key="color" :d="wire(i)" fill="none" :stroke="color" stroke-width="3.3"/>
                <g :transform="fanSeated?'translate(341 118)':'translate(306 118)'"><rect width="20" height="21" rx="2" fill="#efebd4" stroke="#3b4c49" stroke-width="2"/><path d="M4 5h12m-12 4h12m-12 4h12" stroke="#b3b5a2"/></g>
                <path d="M232 85v11h15V85" stroke="#bfc3ad" fill="none" stroke-width="4"/>
              </template>
            </svg>
            <button v-for="(label,key) in order.targets" :key="key" @click="act(key)" :style="{left:markerPosition[key][0]+'%',top:markerPosition[key][1]+'%'}" class="svc-marker" :aria-label="'Actuar sobre '+label.slice(4)" :title="label.slice(4)">{{label[0]}}</button>
          </div>
          <figcaption>Selecciona una zona de la placa o su nombre.</figcaption>
          <div class="svc-tools"><button v-for="(name,key) in order.targets" :key="key" @click="act(key)">{{name}}</button></div>
        </figure>
        <aside class="svc-card svc-notepad">
          <span class="ticket-kicker">INTERVENCIÓN · {{stage+1}} / {{order.procedure.length}}</span>
          <h3>{{stage===0?'Aísla el equipo.':stage===order.procedure.length-1?'Prepara el arranque.':'Trabaja sobre la pieza.'}}</h3>
          <p>{{step.instruction}}</p><p v-if="stage" class="svc-readback">{{order.procedure[stage-1].result}}</p>
          <button v-if="stage===0" class="ticket-btn dark svc-gap" @click="act('isolate')">Apagar y aislar el equipo</button>
          <button v-else class="ticket-btn dark svc-gap" @click="act('rebuild')">Reconectar batería y cerrar la tapa</button>
        </aside>
      </div>
    </template>
    <template v-else>
      <span class="ticket-kicker">{{job.phase==='delivered'?'✓ ORDEN ENTREGADA':'CONTROL DE CALIDAD'}}</span>
      <h2>{{job.phase==='delivered'?'Equipo listo para el cliente.':'Pon a prueba la reparación.'}}</h2>
      <div class="svc-grid">
        <BootDisplay :on="job.booted" :lines="job.tested?order.testLines:order.bootLines"/>
        <section class="svc-card">
          <template v-if="job.phase==='verify'">
            <p>{{order.beforeTest}}</p><p>{{ job.tested?order.delivery:job.booted?'El encendido respondió. Falta reproducir la condición original y comprobar el resultado.':'El equipo está cerrado y listo para arrancar.' }}</p>
            <div class="svc-test-actions">
              <button class="ticket-btn dark" :disabled="job.booted" @click="act('power')">{{job.booted?'✓ Equipo encendido':'Encender la laptop'}}</button>
              <button class="ticket-btn dark" :disabled="job.tested" @click="act('test')">{{job.tested?'✓ Prueba completada':order.testAction}}</button>
              <button class="ticket-btn primary" @click="act('deliver')">Entregar el equipo <Icon name="ArrowRight" :size="17"/></button>
            </div>
          </template>
          <template v-else>
            <h3>{{memory?'Se reconocen los 8 GB.':'La exportación termina.'}}</h3><p>{{order.delivery}}</p>
            <button class="ticket-btn dark svc-gap" @click="$emit('menu')">Elegir otra orden <Icon name="ArrowRight" :size="17"/></button>
            <button class="case-link svc-again" @click="restart">Repetir esta orden</button>
          </template>
        </section>
      </div>
      <div v-if="job.tested && !memory" class="svc-chart"><strong>CPU durante la misma exportación</strong>
        <table><caption>Lecturas de este equipo de práctica</caption><thead><tr><th>Registro</th><th>Inicio</th><th>Mitad</th><th>Final</th></tr></thead><tbody>
          <tr><th>Recibido</th><td>44 °C</td><td>92 °C</td><td>Apagado</td></tr><tr><th>Reparado</th><td>44 °C</td><td>70 °C</td><td>71 °C</td></tr>
        </tbody></table>
      </div>
    </template>
    <p v-if="feedback" class="case-message" role="status">{{ feedback }}</p>
  </section>
</template>

<style scoped>
.service-case { --work-ink:#20384a; }
.service-case h1 { max-width:20ch; scroll-margin-top:1rem; }
.service-case h1:focus { outline:none; }
.service-case .svc-progress { grid-template-columns:repeat(5,minmax(0,1fr)); }
.svc-grid { display:grid; grid-template-columns:minmax(0,1.3fr) minmax(0,1fr); gap:clamp(13px,2.3vw,27px); align-items:start; }
.svc-card { padding:clamp(16px,2.4vw,30px); background:var(--paper-white); border:1px solid var(--rule); min-width:0; }
.svc-card h2 { font-size:clamp(1.65rem,2.8vw,2.7rem); }.svc-card p + p { margin-top:.8rem; }
.svc-notepad { background:#f0eadc; border-top:4px solid #8d5a3d; }
.svc-gap { margin-top:1rem; }
.svc-intake-figure { margin:0; background:#e4e9e3; border:1px solid #8e9f99; display:grid; place-items:center; }
.svc-intake-figure img { height:min(225px,52vw); width:100%; object-fit:contain; }
.svc-intake-figure figcaption,.svc-bench figcaption { width:100%; background:#f4f1e5; margin:0; padding:9px 14px; color:#30484a; font:650 .82rem/1.5 var(--mono); }
.svc-journal { border-top:1px dashed #94a096; margin-top:18px; padding-top:12px; }
.svc-journal p { padding-left:10px; border-left:3px solid #6e8e76; }
.svc-bench { min-width:0; margin:0; border:1px solid #91a19b; background:#f6f4e8; }
.svc-surface { position:relative; aspect-ratio:480/256; background:#203e44; }
.svc-surface svg { display:block; width:100%; height:100%; }
.svc-marker { position:absolute; transform:translate(-50%,-50%); min-width:38px; min-height:38px; border-radius:50%; border:2px solid #f6df92; background:#162e3f; color:#fff9de; box-shadow:0 1px 8px #0007; font:700 .95rem var(--mono); }
.svc-marker:hover,.svc-marker:focus-visible { background:#86401e; outline:2px solid #fff7d5; }
.svc-tools,.svc-test-actions { display:flex; flex-wrap:wrap; gap:8px; padding:0 12px 12px; }
.svc-tools button { padding:6px 10px; min-height:38px; border:1px solid #7c9189; background:#fffdf4; font-size:.92rem; color:var(--work-ink); }
.svc-test-actions { padding:0; margin-top:17px; } .svc-test-actions button:disabled { background:#d9e6d8; color:#315640; opacity:1; }
.svc-readback { padding:12px; border-left:3px solid #4a7163; background:#dfe8dc; }
.svc-again { display:flex; margin-top:7px; }
.svc-chart { margin-top:16px; max-width:640px; padding:15px; color:#223c48; border:1px solid #aab9ad; background:#f6f3e8; }
.svc-chart table { border-collapse:collapse; width:100%; font-size:.95rem; }.svc-chart th,.svc-chart td { border-bottom:1px solid #b2c0b4; text-align:left; padding:5px; }
.svc-chart caption { caption-side:bottom; text-align:left; font-size:.85rem; padding:6px 5px 0; }
@media(max-width:780px) {
  .svc-grid { grid-template-columns:minmax(0,1fr); }
  .service-case .svc-progress { display:flex; flex-wrap:wrap; }
  .svc-progress li { flex:1 1 94px; padding:6px 8px; }
}
</style>
