<script setup>
import { ref, computed, watch } from 'vue'
import { guides } from '../workshop/guides.js'
import { illustrationFor } from '../recognition.js'
import Icon from '../components/Icon.vue'

import { useProgress } from '../composables/useProgress.js'
import { useRouter } from '../router/index.js'

const { route, go, inspect } = useRouter()
const { device, guideRecords, saveStep } = useProgress()
const guide = computed(() => guides.find((entry) => entry.id === route.value.section) || guides[0])
const recordKey = computed(() => device.value + '/' + guide.value.id)
const done = computed(() => guideRecords.value[recordKey.value] || [])
const position = ref(0)
const step = computed(() => guide.value.steps[position.value])
const allDone = computed(() => done.value.length === guide.value.steps.length)
const modeText = computed(() => (device.value === 'laptop' ? 'Laptop' : 'PC de escritorio'))
const artwork = computed(() => illustrationFor(guide.value.part, device.value))
const schematic = computed(() => {
  const name = step.value.diagram
  if (!name || (name === 'airflow' && device.value === 'desktop')) return null
  return '/service/' + (name === 'ram' ? 'ram-' + device.value : name) + '.svg'
})

const enlarged = ref(false)
watch([step, schematic], () => {
  enlarged.value = false
})

function firstOpen() {
  const index = guide.value.steps.findIndex((_, i) => !done.value.includes(i))
  position.value = index < 0 ? 0 : index
}
watch(recordKey, firstOpen, { immediate: true })
function markStep() {
  const steps = [...new Set([...done.value, position.value])]
  saveStep(recordKey.value, steps)
  const next = guide.value.steps.findIndex((_, i) => i > position.value && !steps.includes(i))
  const remaining = guide.value.steps.findIndex((_, i) => !steps.includes(i))
  if (next >= 0) position.value = next
  else if (remaining >= 0) position.value = remaining
}
function restart() {
  saveStep(recordKey.value, [])
  position.value = 0
}
</script>

<template>
  <section class="guidebook">
    <div class="folio-intro">
      <div class="folio-kicker"><i></i> MANUAL DE SERVICIO / {{ guide.number }}</div>
      <h1>Manual de <em>mantenimiento.</em></h1>
      <p>
        Elige una intervención y el equipo que tienes sobre la mesa. Marca cada paso después de
        revisarlo.
      </p>
    </div>
    <nav class="guide-tabs" aria-label="Procedimientos">
      <button
        v-for="item in guides"
        :key="item.id"
        :aria-pressed="item.id === guide.id"
        @click="go('workshop', item.id)"
      >
        <span>{{ item.number }}</span
        >{{ item.short }}
      </button>
    </nav>
    <div class="reader">
      <aside class="reader-index">
        <span class="folio-kicker">ORDEN DE TRABAJO / {{ guide.number }}</span>
        <h2>{{ guide.name }}</h2>
        <div class="type-switch">
          <button
            v-for="(label, key) in { laptop: 'Laptop', desktop: 'PC' }"
            :key="key"
            :aria-pressed="device === key"
            @click="device = key"
          >
            {{ label }}
          </button>
        </div>
        <ol aria-label="Pasos del procedimiento">
          <li v-for="(entry, i) in guide.steps" :key="entry.title">
            <button
              :class="{ current: position === i }"
              :aria-current="position === i ? 'step' : undefined"
              @click="position = i"
            >
              <span>{{ done.includes(i) ? '✓' : String(i + 1).padStart(2, '0') }}</span
              >{{ entry.title }}
            </button>
          </li>
        </ol>
        <div class="reader-progress">
          <span>PASOS REVISADOS</span><b>{{ done.length }} / {{ guide.steps.length }}</b
          ><progress :value="done.length" :max="guide.steps.length"></progress>
        </div>
      </aside>
      <article class="reader-page">
        <div class="reader-running">
          <span>{{ modeText }} / {{ guide.area }}</span
          ><b>PÁG. {{ String(position + 1).padStart(2, '0') }}</b>
        </div>
        <div class="step-hero">
          <div>
            <span class="step-ordinal">{{ String(position + 1).padStart(2, '0') }}</span>
            <h3>{{ step.title }}</h3>
          </div>
          <img v-if="artwork" :src="artwork" :alt="guide.area" />
        </div>
        <p class="step-prose">{{ step.text }}</p>
        <figure v-if="schematic" class="procedure-figure">
          <div
            class="figure-viewport"
            :class="{ enlarged }"
            :tabindex="enlarged ? 0 : undefined"
            :aria-label="
              enlarged ? 'Lámina ampliada. Desplázate horizontalmente para verla completa.' : undefined
            "
          >
            <img :src="schematic" :alt="step.caption" />
          </div>
          <figcaption>{{ step.caption }}</figcaption>
          <button class="figure-open" :aria-pressed="enlarged" @click="enlarged = !enlarged">
            {{ enlarged ? 'Ajustar al ancho' : 'Ampliar lámina' }}
          </button>
        </figure>
        <div v-if="step[device]" class="device-note">
          <span class="folio-kicker">{{ modeText }} / EN EL BANCO</span>
          <p>{{ step[device] }}</p>
        </div>
        <div v-if="allDone" class="completed-stamp" role="status">
          <b>✓ Procedimiento revisado</b><button @click="restart">Volver a practicar</button>
        </div>
        <div class="step-actions">
          <button class="ink-link" :disabled="position === 0" @click="position--">← Anterior</button
          ><button v-if="!allDone" class="print-button vermilion" @click="markStep">
            {{
              done.includes(position)
                ? 'Ir al paso pendiente'
                : position === guide.steps.length - 1
                  ? 'Marcar como revisado'
                  : 'Marcar y continuar'
            }}
            <Icon name="ArrowRight" :size="16" /></button
          ><button v-else class="print-button ink" @click="inspect(guide.part, true)">
            Ver la pieza en 3D ↗
          </button>
        </div>
      </article>
    </div>
    <div class="guide-resources">
      <div>
        <div class="folio-kicker">SOBRE LA MESA</div>
        <h3>Material necesario</h3>
        <ul>
          <li v-for="tool in guide.tools" :key="tool">{{ tool }}</li>
        </ul>
      </div>
      <div>
        <div class="folio-kicker">REFERENCIAS</div>
        <h3>Documentación de apoyo</h3>
        <a v-for="[label, url] in guide.sources" :key="url" :href="url" target="_blank" rel="noopener"
          >{{ label }} ↗</a
        >
      </div>
      <div>
        <div class="folio-kicker">EN EL LABORATORIO</div>
        <h3>Reconoce la pieza</h3>
        <button class="ink-link" @click="inspect(guide.part, true)">Inspeccionar en 3D ↗</button
        ><button v-if="['ram', 'ssd'].includes(guide.id)" class="ink-link" @click="go('fit', guide.id)">
          Revisar compatibilidad ↗
        </button>
      </div>
    </div>
  </section>
</template>
