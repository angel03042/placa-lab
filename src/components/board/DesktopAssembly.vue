<script setup>
import { computed } from 'vue'
import { desktopStages } from '../../three/assembly.js'
import Icon from '../Icon.vue'

const props = defineProps({ mode: { type: String, required: true } })
const emit = defineEmits(['change'])
const index = computed(() => Math.max(0, desktopStages.findIndex(stage => stage.mode === props.mode)))
const stage = computed(() => desktopStages[index.value])
function step(offset) {
  const next = (index.value + offset + desktopStages.length) % desktopStages.length
  emit('change', desktopStages[next].mode)
}
</script>

<template>
  <section class="service-tray" aria-label="Desmontaje del gabinete">
    <div class="tray-meta"><span>PC / MESA DE DESMONTAJE</span><span>{{ index + 1 }} DE {{ desktopStages.length }}</span></div>
    <nav class="tray-stops" aria-label="Etapas del desmontaje">
      <button v-for="(item, i) in desktopStages" :key="item.mode" type="button"
        :aria-pressed="item.mode === mode" @click="emit('change', item.mode)">
        <b>{{ String(i + 1).padStart(2, '0') }}</b> {{ item.label }}
      </button>
    </nav>
    <div class="tray-instruction">
      <div aria-live="polite" aria-atomic="true"><strong>{{ stage.title }}</strong><p>{{ stage.detail }}</p></div>
      <div class="tray-actions">
        <button v-if="index > 0" class="tray-back" type="button" @click="step(-1)" aria-label="Etapa anterior del desmontaje">← Atrás</button>
        <button class="tray-next" type="button" @click="step(1)">{{ stage.action }} <Icon name="ArrowRight" :size="16" /></button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.service-tray{background:#f7f2e5;color:#203749;border-block:1px solid #b9b3a2;padding:.8rem clamp(.78rem,2vw,1.36rem)}
.tray-meta,.tray-actions,.tray-next{display:flex;align-items:center}
.tray-meta{justify-content:space-between;gap:.7rem;font:700 .72rem/1.4 ui-monospace,monospace;letter-spacing:.065em;color:#485e61}
.tray-stops{display:flex;gap:.25rem;flex-wrap:wrap;margin:.55rem 0}
.tray-stops button,.tray-actions button{min-height:2.5rem;border-radius:.3rem;font-weight:700}
.tray-stops button{border:1px solid #b5b4a6;color:#34484e;padding:.24rem .5rem;font-size:.86rem;background:#fffdf6}
.tray-stops b{font:600 .7rem/1 ui-monospace,monospace}
.tray-stops button[aria-pressed=true]{background:#20484a;border-color:#20484a;color:#fff}
.tray-instruction{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.tray-instruction strong{font-size:1.03rem}.tray-instruction p{margin:.15rem 0 0;max-width:72ch;font-size:.92rem;line-height:1.48;color:#34484e}
.tray-actions{flex-shrink:0;gap:.45rem}.tray-next{background:#233a48;color:white;gap:.45rem;padding:.4rem .75rem}
.tray-back{color:#264249;text-decoration:underline;padding:.25rem}
@media(max-width:1100px){.tray-instruction{align-items:flex-start;flex-direction:column;gap:.5rem}}
</style>
