<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import BoardScene from './BoardScene.vue'
import Icon from './Icon.vue'
import { sequenceFor } from '../flows.js'
import { measure } from '../simulation.js'

const props = defineProps({ reducedMotion: Boolean })
const stages = sequenceFor('laptop')
const reference = ref(false)
const step = ref(1)
const playing = ref(false)
let timer
const boardStep = computed(() => reference.value ? step.value : Math.min(step.value, 1))
const probes = ['input','protected','standby','core','memory',null]
function voltage(scenario) {
  const point = probes[step.value]
  if (!point) return scenario === 'healthy' ? 'Completa POST' : 'Sin arranque'
  const result = measure({ device:'laptop', scenario, mode:'voltage', point, powered:true })
  return result.display.replace('.', ',') + ' V'
}
function pause() { clearInterval(timer); playing.value = false }
function choose(index) { pause(); step.value = index }
function togglePlay() {
  if (playing.value) return pause()
  if (step.value === stages.length-1) step.value = 0
  playing.value = true
  timer = setInterval(() => {
    step.value++
    if (step.value === stages.length-1) pause()
  }, 2500)
}
watch(() => props.reducedMotion, pause)
onBeforeUnmount(pause)
</script>
<template>
  <section class="case-replay" aria-label="Reconstrucción del encendido">
    <div class="ticket-kicker">RECONSTRUCCIÓN / CASO 001</div>
    <h2>¿Hasta dónde llega la energía?</h2>
    <p>Elige una placa y avanza por el mismo encendido. El anillo señala hasta dónde llega cada recorrido.</p>
    <div class="replay-boards" role="group" aria-label="Placa para comparar">
      <button :aria-pressed="!reference" @click="reference=false">Placa del caso</button>
      <button :aria-pressed="reference" @click="reference=true">Placa sana</button>
    </div>
    <div class="ticket-stage replay-stage">
      <BoardScene device="laptop" mode="board" flow-kind="energy" guided :selected="stages[boardStep].id" :step="boardStep" :running="playing" :reduced-motion="reducedMotion" />
      <span class="scene-sticker">{{ reference?'Referencia sana':'Equipo recibido' }} · {{ step+1 }} / 6</span>
    </div>
    <div class="replay-controls">
      <button class="ticket-btn dark" @click="togglePlay"><Icon :name="playing?'Pause':'Play'" :size="16"/>{{ playing?'Pausar':'Reproducir' }}</button>
      <button :disabled="step===0" @click="choose(step-1)">← Anterior</button>
      <button :disabled="step===5" @click="choose(step+1)">Siguiente →</button>
    </div>
    <div class="replay-reading" aria-live="polite">
      <h3>{{ stages[step].label }}</h3>
      <div><span>Placa del caso <b>{{ voltage('no-power') }}</b></span><span>Placa sana <b>{{ voltage('healthy') }}</b></span></div>
      <p>{{ step===0?'Ambas placas reciben tensión en la entrada.':step===1?'En la salida de protección aparece la primera diferencia. La placa sana conserva la tensión de entrada. La del cliente mide cero.':'En la placa sana el arranque continúa. En el equipo del cliente las etapas posteriores quedan sin alimentación.' }}</p>
    </div>
  </section>
</template>
