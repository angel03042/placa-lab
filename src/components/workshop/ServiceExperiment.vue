<script setup>
import { computed, ref } from "vue";
import {
  memoryPost,
  memoryPattern,
  postStages,
  thermalSample,
} from "../../game/experiments.js";

const props = defineProps({
  kind: String,
  verify: Boolean,
  booted: Boolean,
  tested: Boolean,
});
const emit = defineEmits(["action"]);
const cursor = ref(props.verify && props.booted ? 4 : 0);
const pattern = ref(props.tested ? 4 : 0);
const time = ref(props.tested ? 120 : 0);
const load = ref(props.tested ? "export" : "idle");
const target = ref("internal");
const compatibility = ref("");
const captured = ref(false);
const post = computed(() => memoryPost(cursor.value, props.verify));
const test = computed(() => memoryPattern(pattern.value));
const sample = computed(() => {
  const reading = thermalSample(time.value, {
    repaired: props.verify,
    load: props.verify ? load.value : "export",
  });
  return props.verify && !props.booted
    ? { ...reading, command: 0, rpm: 0 }
    : reading;
});
const graph = computed(() =>
  Array.from({ length: Math.floor(time.value / 5) + 1 }, (_, i) => {
    const value = thermalSample(i * 5, {
      repaired: props.verify,
      load: props.verify ? load.value : "export",
    });
    return `${40 + i * 5 * 3.5},${155 - (value.temperature - 30) * 1.7}`;
  }).join(" "),
);
function advancePost() {
  cursor.value = memoryPost(cursor.value + 1, props.verify).cursor;
  if (post.value.blocked)
    emit(
      "action",
      "observe/" + (target.value === "external" ? "display" : "post"),
    );
  if (post.value.complete) emit("action", "power");
}
function changeScreen(value) {
  target.value = value;
  cursor.value = 0;
}
function advanceTest() {
  if (!props.booted) return;
  pattern.value = Math.min(4, pattern.value + 1);
  if (test.value.complete) emit("action", "test");
}
function advanceThermal() {
  if (props.verify && !props.booted) return;
  time.value = Math.min(props.verify ? 120 : 60, time.value + 30);
}
function changeLoad(value) {
  load.value = value;
  time.value = 0;
  captured.value = false;
}
function capture() {
  if (props.verify) {
    if (sample.value.complete && props.booted) emit("action", "test");
  } else if (time.value >= 60) {
    emit("action", "observe/thermal");
  }
  captured.value = true;
}
</script>

<template>
  <section
    class="experiment"
    :aria-label="
      kind === 'memory'
        ? 'Simulador de arranque y memoria'
        : 'Simulador térmico'
    "
  >
    <header>
      <span class="ticket-kicker">{{
        verify
          ? "COMPROBACIÓN DESPUÉS DEL MONTAJE"
          : "EXPERIMENTO DE DIAGNÓSTICO"
      }}</span>
      <h3>
        {{
          kind === "memory"
            ? "Sigue el arranque, etapa por etapa."
            : verify
              ? "¿Resiste la misma carga?"
              : "Reconstruye el apagado."
        }}
      </h3>
    </header>
    <template v-if="kind === 'memory'">
      <p>
        POST es la autoprueba al encender. Avanza y observa hasta dónde llega
        este equipo
        {{
          verify ? "después de reparar el montaje" : "antes de mostrar imagen"
        }}.
      </p>
      <div
        v-if="!verify"
        class="experiment-controls"
        aria-label="Pantalla de prueba"
      >
        <button
          :aria-pressed="target === 'internal'"
          @click="changeScreen('internal')"
        >
          Pantalla interna</button
        ><button
          :aria-pressed="target === 'external'"
          @click="changeScreen('external')"
        >
          Monitor externo
        </button>
      </div>
      <ol class="post-track">
        <li v-for="(name, i) in postStages" :key="name" :class="post.states[i]">
          <span>{{
            post.states[i] === "passed"
              ? "✓"
              : post.states[i] === "failed"
                ? "×"
                : i + 1
          }}</span
          ><strong>{{ name }}</strong
          ><small>{{
            post.states[i] === "passed"
              ? "Completado"
              : post.states[i] === "failed"
                ? "Se detuvo aquí"
                : "Pendiente"
          }}</small>
        </li>
      </ol>
      <div class="experiment-readout" role="status">
        <strong>{{
          post.blocked
            ? "MEM INIT · Sin completar"
            : post.complete
              ? "8192 MB · POST completo"
              : cursor
                ? "Tensiones principales presentes"
                : "Equipo apagado"
        }}</strong>
        <p>
          {{
            post.blocked
              ? "El controlador no consiguió inicializar la memoria. Video todavía no se ha ejecutado; una pantalla negra por sí sola no demuestra que el panel esté averiado."
              : post.complete
                ? "El firmware reconoce los 8 GB. Ahora hay que escribir y leer patrones: detectar capacidad no demuestra que todos los datos se conserven."
                : "El indicador del banco muestra la etapa actual. Los códigos de una laptop real se consultan en el manual de su modelo."
          }}
        </p>
      </div>
      <button
        class="ticket-btn dark"
        :disabled="post.blocked || post.complete"
        @click="advancePost"
      >
        {{ cursor ? "Avanzar una etapa del POST" : "Pulsar encendido" }}
      </button>
      <template v-if="!verify">
        <details class="experiment-manual">
          <summary>Comparar etiqueta y manual del equipo</summary>
          <div class="module-spec">
            <p>
              <b>Etiqueta del módulo</b><br />PL-M8 · 8 GB<br />DDR4 · SO-DIMM ·
              1,2 V
            </p>
            <p>
              <b>Manual PL–14 de práctica</b><br />Admite PL-M8 de 8 GB<br />DDR4
              · SO-DIMM · 1,2 V
            </p>
          </div>
          <p>La referencia coincide. ¿Qué demuestra?</p>
          <div class="experiment-controls">
            <button
              @click="
                compatibility = 'match';
                emit('action', 'observe/part');
              "
            >
              El módulo está admitido</button
            ><button @click="compatibility = 'working'">
              La memoria funciona bien
            </button>
          </div>
          <p role="status" v-if="compatibility">
            {{
              compatibility === "match"
                ? "Correcto: compatibilidad confirmada. Todavía falta comprobar el asiento y el funcionamiento; una etiqueta no prueba ninguno de los dos."
                : "La etiqueta describe compatibilidad, no el estado de la pieza. Compara su referencia con la lista y después comprueba el montaje."
            }}
          </p>
        </details>
      </template>
      <template v-else-if="booted">
        <div class="memory-test">
          <h4>Escribir → leer → comparar</h4>
          <p>
            En cada bloque, el banco escribe un patrón y compara lo leído con lo
            esperado.
          </p>
          <progress
            :value="tested ? 100 : test.percent"
            max="100"
            :aria-label="
              'Prueba de memoria: ' + (tested ? 100 : test.percent) + '%'
            "
          /><strong
            >{{ tested ? 100 : test.percent }} % ·
            {{ tested ? "0 errores" : "recorrido de prueba" }}</strong
          >
          <ul>
            <li v-for="line in test.lines" :key="line">
              {{ line }} · leído = escrito ✓
            </li>
          </ul>
          <button
            class="ticket-btn dark"
            :disabled="tested"
            @click="advanceTest"
          >
            {{ tested ? "✓ Prueba guardada" : "Probar el siguiente patrón" }}
          </button>
        </div>
      </template>
    </template>
    <template v-else>
      <p>
        {{
          verify
            ? "Elige reposo o exportación y avanza el reloj. Para entregar, completa la exportación de 120 segundos simulados y guarda el registro."
            : "Reproduce el registro previo del cliente. No estás calentando de nuevo una laptop averiada. Compara temperatura, orden de giro y respuesta real."
        }}
      </p>
      <div v-if="verify" class="experiment-controls">
        <button :aria-pressed="load === 'idle'" @click="changeLoad('idle')">
          Reposo</button
        ><button
          :aria-pressed="load === 'export'"
          @click="changeLoad('export')"
        >
          Exportar video
        </button>
      </div>
      <svg
        class="thermal-plot"
        viewBox="0 0 500 180"
        role="img"
        :aria-label="
          'Temperatura de CPU: ' +
          sample.temperature +
          ' grados a los ' +
          time +
          ' segundos'
        "
      >
        <path
          d="M40 24V155H470M40 53H470M40 104H470"
          fill="none"
          stroke="#637d7b"
          stroke-dasharray="4 5"
        />
        <g fill="#d9e9dd" font-family="monospace" font-size="13">
          <text x="2" y="30">°C</text>
          <text x="9" y="57">90</text>
          <text x="9" y="108">60</text>
          <text x="32" y="175">0 s</text>
          <text x="230" y="175">60 s</text>
          <text x="430" y="175">120 s</text>
        </g>
        <polyline
          :points="graph"
          fill="none"
          stroke="#ffd990"
          stroke-width="3"
          stroke-linejoin="round"
        />
        <circle
          :cx="40 + time * 3.5"
          :cy="155 - (sample.temperature - 30) * 1.7"
          r="5"
          fill="#fff5d3"
        />
      </svg>
      <div class="thermal-metrics" aria-live="polite">
        <div>
          <small>CPU</small><b>{{ sample.temperature }} °C</b>
        </div>
        <div>
          <small>Orden de giro</small><b>{{ sample.command }} %</b>
        </div>
        <div>
          <small>Tacómetro</small><b>{{ sample.rpm }} RPM</b>
        </div>
      </div>
      <p class="experiment-explanation" role="status">
        {{
          sample.shutdown
            ? "El registro termina por protección térmica. Se pidió giro alto, pero el tacómetro siguió en 0 RPM. Eso localiza la investigación en el sistema de ventilación; aún no demuestra qué pieza falló."
            : sample.complete
              ? "La temperatura se estabilizó mientras el ventilador respondió. La misma exportación terminó; el reposo por sí solo no habría comprobado la reparación."
              : verify && load === "idle"
                ? "En reposo se genera poco calor. Que no se apague aquí no confirma el resultado bajo carga."
                : "Sigue el reloj: ¿el ventilador responde cuando aumenta la orden del controlador?"
        }}
      </p>
      <div class="experiment-controls">
        <button
          v-if="verify && !booted"
          class="ticket-btn dark"
          @click="emit('action', 'power')"
        >
          Encender la laptop</button
        ><button
          :disabled="(verify && !booted) || time >= (verify ? 120 : 60)"
          @click="advanceThermal"
        >
          Avanzar 30 s · {{ time }} s</button
        ><button
          @click="
            time = 0;
            captured = false;
          "
        >
          Reiniciar registro</button
        ><button
          class="ticket-btn dark"
          :disabled="
            captured || (verify ? !sample.complete || !booted : time < 60)
          "
          @click="capture"
        >
          {{ captured ? "✓ Registro guardado" : "Guardar registro completo" }}
        </button>
      </div>
    </template>
    <footer>
      Modelo didáctico PL · cifras y tiempos simulados. Las pruebas completadas
      se guardan; una ejecución a medias puede repetirse.
    </footer>
  </section>
</template>

<style scoped>
.experiment {
  background: #fcfaf2;
  border: 1px solid #9aa99e;
  padding: clamp(16px, 2vw, 26px);
  color: #233d3b;
  min-width: 0;
}
.experiment header h3 {
  font-size: 1.45rem;
  margin: 8px 0 12px;
}
.experiment p {
  line-height: 1.6;
  margin: 10px 0;
  font-size: 1rem;
}
.experiment-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}
.experiment button {
  min-height: 44px;
  padding: 9px 13px;
  border: 1px solid #758a7c;
  background: #f3efe1;
  color: #203a35;
  text-align: left;
  font-weight: 650;
}
.experiment button[aria-pressed="true"],
.experiment .ticket-btn.dark {
  background: #284e43;
  color: #fff9e8;
}
.experiment button:disabled {
  opacity: 0.55;
  cursor: default;
}
.experiment button:focus-visible,
summary:focus-visible {
  outline: 3px solid #b16c30;
  outline-offset: 3px;
}
.post-track {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 0;
  margin: 22px 0;
  gap: 6px;
}
.post-track li {
  border-top: 3px solid #aebbb2;
  display: grid;
  gap: 6px;
  padding: 10px 5px;
  color: #52625a;
}
.post-track span {
  font: 700 1.5rem var(--mono);
}
.post-track small {
  font-size: 0.85rem;
}
.post-track strong {
  font-size: 0.95rem;
}
.post-track .passed {
  border-color: #407458;
  color: #25513b;
}
.post-track .failed {
  border-color: #a9502f;
  background: #f4e4d6;
  color: #7a371f;
}
.experiment-readout {
  padding: 16px;
  background: #1e3939;
  color: #f6f6de;
  margin-bottom: 15px;
}
.experiment-readout strong {
  font: 700 1rem var(--mono);
}
.experiment-readout p {
  color: #d8e5d9;
}
.experiment-manual {
  margin: 20px 0 0;
  border-top: 1px dashed #9cae9e;
  padding-top: 14px;
}
.experiment-manual summary {
  cursor: pointer;
  font-weight: 700;
  min-height: 38px;
}
.module-spec {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.module-spec p {
  background: #e7ecdf;
  padding: 12px;
}
.memory-test {
  border-top: 1px solid #acb9a9;
  margin-top: 20px;
  padding-top: 18px;
}
.memory-test progress {
  width: 100%;
  accent-color: #367455;
  height: 18px;
  display: block;
  margin: 12px 0;
}
.memory-test ul {
  padding: 0 0 0 20px;
  line-height: 1.8;
}
.thermal-plot {
  display: block;
  background: #1c373c;
  width: 100%;
  margin: 14px 0 0;
}
.thermal-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #dfe9df;
  padding: 15px 10px;
  gap: 8px;
}
.thermal-metrics div {
  display: grid;
  gap: 6px;
}
.thermal-metrics small {
  font-size: 0.85rem;
}
.thermal-metrics b {
  font: 700 clamp(1rem, 1.7vw, 1.4rem) var(--mono);
}
.experiment-explanation {
  border-left: 3px solid #a36436;
  padding-left: 12px;
}
.experiment footer {
  margin-top: 20px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #4b6054;
  border-top: 1px solid #c5cebf;
  padding-top: 12px;
}
@media (max-width: 500px) {
  .post-track {
    grid-template-columns: 1fr 1fr;
  }
  .module-spec {
    grid-template-columns: 1fr;
  }
  .thermal-metrics {
    gap: 5px;
    padding: 10px 6px;
  }
  .thermal-metrics small {
    font-size: 0.8rem;
  }
}
</style>
