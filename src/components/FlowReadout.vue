<script setup>
import { computed } from 'vue'
const props = defineProps({ steps: Array, index: Number, kind: String })
defineEmits(['seek','locate'])
const stage = computed(() => props.steps[props.index])
</script>

<template>
  <section class="flow-readout" aria-label="Detalle del recorrido">
    <div class="flow-reading" aria-live="polite" aria-atomic="true">
      <div class="flow-page">{{ String(index+1).padStart(2,'0') }}<small> / {{ String(steps.length).padStart(2,'0') }}</small></div>
      <div><div class="flow-kicker">{{ kind==='thermal'?'TRANSFERENCIA DE CALOR':'SECUENCIA DE ENCENDIDO' }}</div>
        <h2>{{ stage.title }}</h2>
        <div class="flow-chain"><span>{{ stage.from }}</span><span aria-label="hacia">→</span><span>{{ stage.to }}</span></div>
        <p>{{ stage.text }}</p><strong class="flow-value">{{ stage.value }}</strong>
      </div>
    </div>
    <nav class="flow-stages" aria-label="Elegir etapa"><button v-for="(item,i) in steps" :key="item.label" :aria-current="i===index?'step':undefined" @click="$emit('seek',i)"><span>{{ String(i+1).padStart(2,'0') }}</span>{{ item.label }}</button></nav>
    <button class="ink-link flow-locate" @click="$emit('locate')">Ver esta etapa en la placa ↑</button>
    <div class="flow-key"><span v-if="kind==='energy'"><i class="swatch energy"></i> Alimentación</span><span v-if="kind==='energy'"><i class="swatch signal"></i> Señal o datos</span><span v-if="kind==='thermal'"><i class="swatch heat"></i> Calor en la pieza</span><span v-if="kind==='thermal'"><i class="swatch air"></i> Movimiento del aire</span></div>
    <p class="flow-footnote">{{ kind==='energy'?'Las flechas muestran conexiones funcionales. Las ramas pueden activarse a la vez y el orden varía según la placa.':'La CPU está en funcionamiento. Las cuatro etapas muestran un proceso continuo. Los colores identifican el recorrido y no representan temperaturas medidas.' }}</p>
  </section>
</template>
