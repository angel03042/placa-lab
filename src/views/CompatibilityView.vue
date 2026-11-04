<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Icon from '../components/Icon.vue'
import { profiles, emptyMachine, emptyPart, evaluateFit, lengths } from '../workshop/fit.js'

import { useProgress } from '../composables/useProgress.js'
import { useRouter } from '../router/index.js'

const { device } = useProgress()
const { route, go } = useRouter()
function openGuide() {
  if (['desktop', 'laptop'].includes(machine.device)) device.value = machine.device
  go('workshop', isRam.value ? 'ram' : 'ssd')
}
const profileId = ref('')
const slotIndex = ref(0)
const machine = reactive(emptyMachine())
const candidate = reactive(emptyPart())
const profile = computed(() => profiles[profileId.value])
const isRam = computed(() => route.value.section !== 'ssd')
const report = computed(() => evaluateFit(route.value.section, machine, candidate))
const stateLabels = {
  pending: 'Faltan datos por confirmar',
  conflict: 'Hay una incompatibilidad',
  match: 'Coincide en los criterios revisados',
}
const checkLabels = { pending: 'Pendiente', conflict: 'No coincide', match: 'Coincide' }
const generations = ['DDR2', 'DDR3', 'DDR3L', 'DDR4', 'DDR5']
const occupiedOptions = [
  ['', 'Por confirmar'],
  ['free', 'Hay un lugar libre'],
  ['replace', 'Voy a reemplazar la pieza instalada'],
  ['full', 'Quiero agregar, pero no hay lugar libre'],
]

function chooseSlot() {
  const slot = profile.value?.slots[slotIndex.value]
  if (!slot) return
  Object.assign(machine, {
    socket: slot.socket,
    bus: slot.bus,
    lengths: [...slot.lengths],
    diskSlot: '',
    diskVerified: false,
  })
}
function chooseProfile() {
  Object.assign(machine, emptyMachine())
  slotIndex.value = 0
  if (!profile.value) return
  const { name, device, format, generation, total, module } = profile.value
  Object.assign(machine, {
    name,
    device,
    format,
    generation,
    total,
    module,
    combinations: profile.value.combinations || null,
  })
  chooseSlot()
}
function selectSocket(target) {
  if (target.socket === '2,5″') target.bus = 'SATA'
  else target.bus = ''
  if (target === machine) machine.lengths = []
  else candidate.length = ''
}
watch(
  () => [
    candidate.format,
    candidate.generation,
    candidate.capacity,
    machine.format,
    machine.generation,
    machine.total,
    machine.module,
    machine.retained,
    machine.ramSlot,
    machine.name,
  ],
  () => {
    machine.ramVerified = false
  },
  { flush: 'sync' },
)
watch(
  () => [
    candidate.socket,
    candidate.bus,
    candidate.length,
    machine.socket,
    machine.bus,
    machine.lengths.join(','),
    machine.diskSlot,
    machine.name,
  ],
  () => {
    machine.diskVerified = false
  },
  { flush: 'sync' },
)
</script>

<template>
  <section class="fit-sheet">
    <div class="folio-intro">
      <div class="folio-kicker"><i></i> INSTRUMENTO DE CONSULTA / C–01</div>
      <h1>Banco de <em>compatibilidad.</em></h1>
      <p>
        Compara la ficha de tu equipo con la de una pieza. Cada coincidencia muestra qué comprobaste y
        qué te falta revisar antes de comprar.
      </p>
    </div>
    <div class="fit-toolbar">
      <div class="type-switch" aria-label="Pieza a comparar">
        <button :aria-pressed="isRam" @click="go('fit', 'ram')">01 / Memoria RAM</button>
        <button :aria-pressed="!isRam" @click="go('fit', 'ssd')">02 / Almacenamiento</button>
      </div>
      <label
        >Ficha de referencia
        <select v-model="profileId" @change="chooseProfile">
          <option value="">Mi propio equipo</option>
          <option value="dell">Dell Latitude 5420</option>
          <option value="msi">MSI B550-A PRO</option>
        </select>
      </label>
    </div>
    <div class="fit-layout">
      <div class="fit-form">
        <details class="model-help" :open="!profile">
          <summary>Cómo encontrar los datos de mi equipo</summary>
          <p>
            En Windows abre <kbd>msinfo32</kbd> y anota el modelo del sistema. En una PC armada,
            identifica fabricante, modelo y revisión de la placa base. En una laptop, contrasta el modelo
            y variante con la etiqueta inferior. Busca el manual de especificaciones y el de servicio en
            el soporte del fabricante.
          </p>
          <p>
            En la ficha de la pieza busca su número de parte exacto. Copia los datos de ambas fichas. El
            tipo de equipo por sí solo no identifica la ranura.
          </p>
        </details>
        <fieldset class="form-sheet">
          <legend><b>A</b> Lo que admite tu equipo</legend>
          <div class="form-fields">
            <label
              >Modelo y revisión<input
                v-model="machine.name"
                :readonly="!!profile"
                placeholder="Fabricante, modelo y revisión"
            /></label>
            <label
              >Tipo de equipo<select v-model="machine.device" :disabled="!!profile">
                <option value="">Por indicar</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">PC de escritorio</option>
              </select></label
            >
            <template v-if="isRam">
              <label
                >Formato de la ranura<select v-model="machine.format" :disabled="!!profile">
                  <option value="">Por confirmar</option>
                  <option>SO-DIMM</option>
                  <option>UDIMM</option>
                  <option>RDIMM</option>
                  <option value="Soldada">Solo soldada, sin ranura</option>
                </select></label
              >
              <label
                >Generación admitida<select v-model="machine.generation" :disabled="!!profile">
                  <option value="">Por confirmar</option>
                  <option v-for="generation in generations" :key="generation">{{ generation }}</option>
                </select></label
              >
              <label
                >Máximo total (GB)<input
                  v-model="machine.total"
                  type="number"
                  min="1"
                  step="1"
                  :readonly="!!profile"
                  placeholder="Consultar el manual"
              /></label>
              <label
                >Máximo por módulo (GB)<input
                  v-model="machine.module"
                  type="number"
                  min="1"
                  step="1"
                  :readonly="!!profile?.module"
                  placeholder="Consultar el fabricante"
              /></label>
              <label
                >Ranura que usarás<select v-model="machine.ramSlot">
                  <option v-for="[value, label] in occupiedOptions" :value="value" :key="value">
                    {{ label }}
                  </option>
                </select></label
              >
              <label
                >GB que conservarás<input
                  v-model="machine.retained"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Incluye la memoria soldada"
              /></label>
            </template>
            <template v-else>
              <label class="wide" v-if="profile"
                >Ranura documentada<select v-model="slotIndex" @change="chooseSlot">
                  <option v-for="(s, i) in profile.slots" :key="s.name" :value="i">{{ s.name }}</option>
                </select></label
              >
              <label
                >Alojamiento<select
                  v-model="machine.socket"
                  :disabled="!!profile"
                  @change="selectSocket(machine)"
                >
                  <option value="">Por confirmar</option>
                  <option>M.2</option>
                  <option value="2,5″">SATA de 2,5 pulgadas</option>
                </select></label
              >
              <label
                >Interfaz admitida<select
                  v-model="machine.bus"
                  :disabled="!!profile || machine.socket === '2,5″'"
                >
                  <option value="">Por confirmar</option>
                  <option value="NVMe">PCIe / NVMe</option>
                  <option>SATA</option>
                  <option value="Ambos">PCIe/NVMe y SATA</option>
                </select></label
              >
              <div class="wide length-options" v-if="machine.socket === 'M.2'">
                <span>Longitudes admitidas</span
                ><label v-for="length in lengths" :key="length"
                  ><input
                    v-model="machine.lengths"
                    type="checkbox"
                    :value="length"
                    :disabled="!!profile"
                  />
                  {{ length }}</label
                >
              </div>
              <label class="wide"
                >Espacio disponible<select v-model="machine.diskSlot">
                  <option v-for="[value, label] in occupiedOptions" :value="value" :key="value">
                    {{ label }}
                  </option>
                </select></label
              >
            </template>
          </div>
          <p class="technical-note" v-if="profile">
            {{ isRam ? profile.note : profile.slots[slotIndex].note }}
            <a
              v-for="[name, url] in profile.sources"
              :key="url"
              :href="url"
              target="_blank"
              rel="noopener"
              >{{ name }} ↗</a
            >
          </p>
        </fieldset>
        <fieldset class="form-sheet">
          <legend><b>B</b> La pieza que quieres instalar</legend>
          <div class="form-fields">
            <template v-if="isRam">
              <label
                >Formato del módulo<select v-model="candidate.format">
                  <option value="">Por confirmar</option>
                  <option>SO-DIMM</option>
                  <option>UDIMM</option>
                  <option>RDIMM</option>
                </select></label
              >
              <label
                >Generación del módulo<select v-model="candidate.generation">
                  <option value="">Por confirmar</option>
                  <option v-for="generation in generations" :key="generation">{{ generation }}</option>
                </select></label
              >
              <label
                >Capacidad de un módulo (GB)<input
                  v-model="candidate.capacity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej. 16"
              /></label>
              <p class="field-hint">
                Para un reemplazo, excluye de los GB que conservarás el módulo que retiras.
              </p>
            </template>
            <template v-else>
              <label
                >Formato del SSD<select v-model="candidate.socket" @change="selectSocket(candidate)">
                  <option value="">Por confirmar</option>
                  <option>M.2</option>
                  <option value="2,5″">SATA de 2,5 pulgadas</option>
                </select></label
              >
              <label
                >Interfaz del SSD<select v-model="candidate.bus" :disabled="candidate.socket === '2,5″'">
                  <option value="">Por confirmar</option>
                  <option value="NVMe">PCIe / NVMe</option>
                  <option>SATA</option>
                </select></label
              >
              <label v-if="candidate.socket === 'M.2'"
                >Tamaño de la tarjeta<select v-model="candidate.length">
                  <option value="">Por confirmar</option>
                  <option v-for="length in lengths" :key="length">{{ length }}</option>
                </select></label
              >
            </template>
          </div>
          <label v-if="isRam" class="confirm-field"
            ><input type="checkbox" v-model="machine.ramVerified" />Verifiqué la referencia y la
            combinación de módulos, ECC, velocidad JEDEC y soporte de CPU/BIOS en la
            documentación.</label
          >
          <label v-else class="confirm-field"
            ><input type="checkbox" v-model="machine.diskVerified" />Verifiqué en el manual la fijación,
            grosor, espacio, conexiones y recursos compartidos de esta instalación.</label
          >
        </fieldset>
      </div>
      <aside class="fit-result" aria-live="polite">
        <div class="folio-kicker">DICTAMEN DE BANCO / {{ isRam ? 'RAM' : 'SSD' }}</div>
        <h2>{{ stateLabels[report.state] }}</h2>
        <p>Resultado para los datos ingresados{{ machine.name ? ' de ' + machine.name : '' }}.</p>
        <ol>
          <li v-for="check in report.checks" :key="check.title" :class="check.state">
            <div>
              <b>{{ check.title }}</b
              ><small>{{ checkLabels[check.state] }}</small>
            </div>
            <p>{{ check.message }}</p>
          </li>
        </ol>
        <button class="print-button pale" @click="openGuide()">
          Ir al procedimiento <Icon name="ArrowRight" :size="17" />
        </button>
      </aside>
    </div>
    <details class="model-help other-hardware">
      <summary>¿Cómo reviso procesador, gráfica y refrigeración?</summary>
      <p>
        <b>Procesador.</b> Busca la CPU exacta en la lista de soporte de la placa y revisa socket,
        versión mínima de BIOS y capacidad de refrigeración. En muchas laptops está soldada.
      </p>
      <p>
        <b>Tarjeta gráfica de escritorio.</b> Verifica ranura PCIe, longitud, altura y grosor disponibles
        en la caja, potencia recomendada de la fuente y conectores de alimentación.
      </p>
      <p>
        <b>Disipador.</b> Comprueba anclaje y kit para el socket, altura libre y separación de la RAM. En
        laptop coteja la referencia de repuesto y la variante de CPU/GPU.
      </p>
    </details>
  </section>
</template>
