<script setup>
import { computed, ref, watch } from 'vue'
import CircuitLens from './CircuitLens.vue'
import BootDisplay from './BootDisplay.vue'
import { stationStages, operateRepair, restoreRepair, repairLog } from '../game/powerRepair.js'

const events = defineModel({ required:true })
defineEmits(['deliver'])
const state = computed(()=>restoreRepair(events.value))
const step = computed(()=>state.value.step)
const tool = ref('meter')
const message = ref('')
const tools = [
  ['meter','Multímetro'],['tweezers','Pinza térmica'],['wick','Malla de desoldar'],['iron','Cautín'],['scope','Lupa'],
]
const spares = [['place','4,02 kΩ · 0603'],['jumper','0 Ω · 0603'],['wrongpart','402 Ω · 0603']]
const headline = computed(()=>stationStages[step.value])
const feedback = computed(()=>message.value || repairLog(state.value.events).at(-1) || 'Lista la punta de referencia en la fuente común.')
function act(action) {
  const result = operateRepair(state.value,action)
  message.value = result.message
  if (result.state !== state.value) events.value = result.state.events
}
function useTool(id) { tool.value=id; message.value='' }
watch(step, index => {
  if ([2,4,10].includes(index)) tool.value='meter'
  if (index === 5) tool.value=''
})
</script>

<template>
  <section class="power-station">
    <div class="station-heading"><div><span class="ticket-kicker">{{ step < 9 ? 'INTERVENCIÓN / MICROSCOPIO DE BANCO' : 'CONTROL DE SALIDA / ORDEN 001' }}</span><h2>{{ headline[0] }}</h2></div><span class="power-badge" :class="{hot:state.powered}"><i></i>{{ state.powered?'Placa con tensión':'Placa aislada · 0 V' }}</span></div>
    <p class="station-task">{{ headline[1] }}</p>
    <div class="station-layout">
      <div class="station-figure">
        <CircuitLens v-if="step < 9" :repair-step="step" :tool="tool" :powered="state.powered" @target="id=>act(tool+':'+id)"/>
        <template v-else>
          <div class="ticket-running"><span>PRUEBA EN EL EQUIPO</span><span>PL–14 / ENTRADA DC</span></div>
          <BootDisplay :on="state.booted" :lines="['Alimentación estable','Memoria detectada','POST correcto · firmware listo']"/>
          <div class="post-readings"><span>TP2 al recibir <b>0,00 V</b></span><span>TP2 tras reparar <b>{{ step>=11?'19,00 V':'Por medir' }}</b></span></div>
        </template>
      </div>
      <aside class="station-tray">
        <span class="ticket-kicker">{{ step<9?'CARRO DE HERRAMIENTAS':'BANCO DE PRUEBAS' }}</span>
        <template v-if="step<9">
          <h3>Elige tu herramienta</h3>
          <p>Selecciona una herramienta y toca la pieza o el punto en la vista ampliada.</p>
          <div class="tool-palette"><button v-for="[id,label] in tools" :key="id" :aria-pressed="tool===id" @click="useTool(id)">{{ label }}</button></div>
          <button v-if="step===1" class="ticket-btn dark" @click="act('isolate')">Desconectar y descargar la placa</button>
          <button v-if="step===4" class="tray-part" @click="act(tool+':removed')"><i></i> PR1 en la bandeja</button>
          <fieldset v-if="step===5" class="part-bin"><legend>Repuestos · elige uno y toca PR1</legend><button v-for="[id,label] in spares" :key="id" :aria-pressed="tool===id" @click="useTool(id)">{{ label }}</button></fieldset>
        </template>
        <template v-else>
          <h3>{{ state.booted?'Equipo operativo':'¿Arranca la laptop?' }}</h3>
          <button v-if="step===9" class="ticket-btn dark" @click="act('power')">Reconectar el adaptador</button>
          <button v-if="step===10" class="ticket-btn dark" @click="act('meter:tp2')">Medir TP2 después de reparar</button>
          <button v-if="!state.booted" class="ticket-btn primary" @click="act('boot')">Pulsar el botón de encendido</button>
          <button v-else class="ticket-btn primary" @click="$emit('deliver')">Entregar el equipo reparado ↗</button>
        </template>
        <div class="station-note" role="status"><strong>Lectura de banco</strong>{{ feedback }}</div>
      </aside>
    </div>
    <div class="station-files">
      <details><summary>Ficha del circuito y valores de referencia</summary><p>En esta placa didáctica, PU1 envía la señal por A, atraviesa PR1 de 4,02 kΩ en encapsulado 0603 y llega por B a la compuerta de PQ1. El valor esperado a ambos lados es de unos +6 V respecto a la fuente común mientras el mando está activo. TP1 y TP2 pertenecen a la línea de potencia y se miden respecto a masa.</p><a href="https://www.ti.com/lit/ds/symlink/bq24780s.pdf" target="_blank" rel="noreferrer">Consultar el circuito de referencia de Texas Instruments ↗</a></details>
      <details><summary>Registro de intervención ({{ events.length }})</summary><ol v-if="events.length"><li v-for="line in repairLog(events)" :key="line">{{ line }}</li></ol><p v-else>Las mediciones y operaciones aparecerán aquí al realizarlas.</p></details>
    </div>
  </section>
</template>

