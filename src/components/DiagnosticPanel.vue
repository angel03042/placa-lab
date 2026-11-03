<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Icon from './Icon.vue'
import { cases, diagnoses, testPoints, measure, canDiagnose } from '../simulation.js'
const props = defineProps({ device: String })
const emit = defineEmits(['select', 'case-change', 'solved', 'power-change'])
const scenario = ref('no-power'), powered = ref(false), mode = ref('voltage'), point = ref('input')
const result = ref(null), readings = ref([]), diagnosis = ref(''), verdict = ref(null)
const currentCase = computed(() => cases.find(c => c.id === scenario.value))
const ready = computed(() => canDiagnose(scenario.value, readings.value))
function reset() { result.value=null;readings.value=[];diagnosis.value='';verdict.value=null;powered.value=false;point.value='input';emit('case-change',scenario.value);emit('select','input') }
onMounted(reset)
watch(() => props.device, reset)
watch(scenario, reset)
watch(powered, value=>{result.value=null;emit('power-change',value)})
watch(mode, ()=>{result.value=null})
watch(point, id => { result.value=null;const p=testPoints.find(p=>p.id===id);emit('select',p.component==='ec'&&props.device==='desktop'?'bios':p.component) })
function takeMeasurement() {
  const params={device:props.device,scenario:scenario.value,point:point.value,mode:mode.value,powered:powered.value}
  result.value=measure(params)
  if(!result.value.blocked) readings.value=[{...params,...result.value,name:testPoints.find(p=>p.id===point.value).name},...readings.value].slice(0,15)
}
function check() {
  if(!ready.value||!diagnosis.value)return
  verdict.value=diagnosis.value===currentCase.value.answer
  if(verdict.value&&scenario.value!=='healthy')emit('solved',scenario.value)
}
</script>
<template>
  <div class="diagnostic-panel">
    <div class="panel-eyebrow"><span class="tiny-dot orange"></span> BANCO DE DIAGNÓSTICO <span>SIMULADO</span></div>
    <h2>De la pista a la causa.</h2>
    <label class="field-label" for="case">Elige un caso</label>
    <select id="case" v-model="scenario"><option v-for="c in cases" :key="c.id" :value="c.id">{{ c.name }}</option></select>
    <p class="case-description">{{ currentCase.description }}</p>
    <div class="meter">
      <div class="meter-top"><span><Icon name="Gauge" :size="15" /> MULTÍMETRO VIRTUAL</span><span class="meter-led" :class="{on:powered}"></span></div>
      <div class="meter-display" aria-live="polite"><small>{{ mode==='voltage'?'TENSIÓN CONTINUA':'RESISTENCIA' }}</small><div>{{ result?.display || '— — —' }}<span>{{ result?.unit || (mode==='voltage'?'V':'Ω') }}</span></div><small>PUNTA NEGRA → GND</small></div>
      <div class="meter-modes"><button @click="mode='voltage'" :class="{active:mode==='voltage'}">V ⎓ Tensión</button><button @click="mode='resistance'" :class="{active:mode==='resistance'}">Ω Resistencia</button></div>
      <label class="field-label" for="testpoint">Punta roja · punto de prueba</label>
      <select id="testpoint" v-model="point"><option v-for="p in testPoints" :value="p.id" :key="p.id">{{ p.name }}</option></select>
      <div class="power-toggle"><span><Icon name="Power" :size="16" /> Alimentación {{ powered?'conectada':'desconectada' }}</span><button class="switch" :class="{on:powered}" role="switch" :aria-checked="powered" aria-label="Alimentar placa simulada" @click="powered=!powered"><span></span></button></div>
      <button class="button button-dark measure-button" @click="takeMeasurement"><Icon name="Activity" :size="16" /> Tomar medición <Icon name="ArrowUpRight" :size="16" /></button>
      <p v-if="result" class="measurement-note" :class="{warning:result.blocked}" role="status">{{ result.note }}</p>
    </div>
    <details class="reading-history" :open="readings.length>0"><summary>Registro de mediciones <span>{{ readings.length }}</span></summary><div v-if="!readings.length" class="empty-small">Tus mediciones aparecerán aquí.</div><ol v-else><li v-for="(reading,i) in readings" :key="i"><span>{{ reading.name }} <small>{{ reading.powered?'Con tensión':'Sin tensión' }}</small></span><strong>{{ reading.display }} {{ reading.unit }}</strong></li></ol></details>
    <div class="diagnosis-answer"><label for="diagnosis" class="field-label">¿Qué respalda la evidencia?</label><select id="diagnosis" v-model="diagnosis"><option disabled value="">Elige una conclusión…</option><option v-for="d in diagnoses" :value="d.id" :key="d.id">{{ d.text }}</option></select><button class="button button-outline" :disabled="!ready||!diagnosis" @click="check">Comprobar diagnóstico <Icon name="ArrowRight" :size="15" /></button><p v-if="!ready" class="help-text">{{ scenario==='no-display'?'Mide tensión con alimentación en TP3 y TP5.':scenario==='no-power'?'Mide tensión con alimentación en TP1 y TP2.':'Mide tensión con alimentación en TP1 y TP5.' }}</p><div v-if="verdict!==null" class="feedback" :class="verdict?'correct':'incorrect'" role="status"><Icon :name="verdict?'CircleCheck':'Info'" :size="18" /><p><strong>{{ verdict?'La evidencia coincide.':'Revisa tu hipótesis.' }}</strong> {{ verdict?currentCase.result:'Compara el último punto con tensión y el primero sin tensión. Estas mediciones no prueban una corrupción del firmware.' }}</p></div></div>
  </div>
</template>
