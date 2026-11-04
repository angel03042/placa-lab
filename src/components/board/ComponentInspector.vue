<script setup>
import { computed } from 'vue'
import Icon from '../Icon.vue'
import { guides } from '../../workshop/guides.js'
import { illustrationFor, recognitionFor } from '../../recognition.js'
import { useBoard } from '../../composables/useBoard.js'
import { useRouter } from '../../router/index.js'

const { device, component, infoTab, focusPart } = useBoard()
const { go } = useRouter()
const relatedGuide = computed(() => {
  const part = component.value.id
  const id = { cpu: 'termica', heatsink: 'termica', fan: 'limpieza' }[part] ?? part
  return guides.find((guide) => guide.id === id)
})
</script>

<template>
  <aside class="component-panel">
    <div class="panel-eyebrow">
      <span class="tiny-dot orange"></span> EXPLORADOR DE COMPONENTES <span>{{ component.ref }}</span>
    </div>
    <div class="component-title">
      <div class="component-icon"><Icon :name="component.icon" :size="32" /></div>
      <span class="component-category">{{ component.category }}</span>
    </div>
    <h2>{{ component.name }}</h2>
    <p class="component-tagline">{{ component.summary }}</p>
    <div class="info-tabs" role="tablist" aria-label="Información del componente">
      <button
        v-for="t in [
          { id: 'recognition', name: 'Reconocer' },
          { id: 'function', name: 'Función' },
          { id: 'signals', name: 'Señales' },
          { id: 'faults', name: 'Fallas' },
        ]"
        :key="t.id"
        role="tab"
        :aria-selected="infoTab === t.id"
        @click="infoTab = t.id"
        :class="{ active: infoTab === t.id }"
      >
        {{ t.name }}<Icon v-if="t.id === 'faults'" name="ArrowUpRight" :size="13" />
      </button>
    </div>
    <div class="info-content" role="tabpanel">
      <template v-if="infoTab === 'recognition'"
        ><div v-if="illustrationFor(component.id, device)" class="recognition-figure">
          <img
            :src="illustrationFor(component.id, device)"
            :alt="'Ilustración de ' + component.name"
          /><span>FORMA Y ENCAPSULADO · EJEMPLO</span>
        </div>
        <ol class="recognition-clues">
          <li v-for="clue in recognitionFor(component.id, device)" :key="clue">{{ clue }}</li>
        </ol>
        <button class="inspect-action" @click="focusPart">
          <Icon name="ScanSearch" :size="16" /> Examinar en la placa
          <Icon name="ArrowUpRight" :size="16" /></button></template
      ><template v-else-if="infoTab === 'function'"
        ><p>{{ component.description }}</p>
        <div class="component-facts">
          <div>
            <Icon name="MapPin" :size="17" /><span
              ><small>DÓNDE ENCONTRARLO</small>{{ component.location }}</span
            >
          </div>
          <div>
            <Icon name="Fingerprint" :size="17" /><span
              ><small>CÓMO IDENTIFICARLO</small>Referencia habitual:
              <strong>{{ component.prefix }}</strong></span
            >
          </div>
        </div></template
      ><template v-else-if="infoTab === 'signals'"
        ><p>{{ component.detail }}</p>
        <div class="signal-card">
          <span>SEÑALES / LÍNEAS</span><strong>{{ component.signal }}</strong
          ><span>ALIMENTACIÓN</span>
          <p>{{ component.voltage }}</p>
        </div>
        <p class="help-text">
          Verifica siempre el esquema y la hoja de datos del componente real.
        </p></template
      ><template v-else
        ><p class="field-label">Síntomas que orientan</p>
        <ul class="symptom-list">
          <li v-for="symptom in component.symptoms" :key="symptom"><span></span>{{ symptom }}</li>
        </ul>
        <p>{{ component.check }}</p></template
      >
      <div class="technician-tip">
        <Icon name="Lightbulb" :size="19" />
        <div>
          <strong>Piensa como técnico</strong>
          <p>{{ component.tip }}</p>
        </div>
      </div>
    </div>
    <div v-if="relatedGuide" class="linked-procedure">
      <span class="folio-kicker">FICHA DE SERVICIO / {{ relatedGuide.number }}</span
      ><button class="ink-link" @click="go('workshop', relatedGuide.id)">
        {{ relatedGuide.name }} ↗</button
      ><button
        v-if="['ram', 'ssd'].includes(relatedGuide.id)"
        class="ink-link"
        @click="go('fit', relatedGuide.id)"
      >
        Revisar compatibilidad ↗
      </button>
    </div>
    <button class="panel-action" @click="go('diagnostics')">
      <Icon name="ScanSearch" :size="17" /> Llevarlo a la práctica
      <Icon name="ArrowUpRight" :size="17" />
    </button>
  </aside>
</template>
