<script setup>
import { ref } from 'vue'
import Icon from '../Icon.vue'
import { useProgress } from '../../composables/useProgress.js'
import { useStudy } from '../../composables/useStudy.js'

const { completed, solved, reducedMotion, deliveredOrders, resetProgress } = useProgress()
const { notify } = useStudy()
const settings = ref(null)
const confirmReset = ref(false)
function reset() {
  resetProgress()
  confirmReset.value = false
  notify('Tu progreso se ha reiniciado.')
}
defineExpose({
  open() {
    confirmReset.value = false
    settings.value.showModal()
  },
})
</script>

<template>
  <dialog ref="settings" class="settings-dialog">
    <div class="dialog-content">
      <button
        class="icon-button close-dialog"
        aria-label="Cerrar preferencias"
        @click="settings.close()"
      >
        <Icon name="X" /></button
      ><span class="eyebrow">A TU MANERA</span>
      <h2>Tu espacio de trabajo.</h2>
      <div class="setting-row">
        <span
          ><strong>Reducir movimiento</strong
          ><small
            >Mantiene fijas las flechas de los recorridos y evita los desplazamientos animados.</small
          ></span
        ><button
          role="switch"
          class="switch"
          :class="{ on: reducedMotion }"
          :aria-checked="reducedMotion"
          aria-label="Reducir movimiento"
          @click="reducedMotion = !reducedMotion"
        >
          <span></span>
        </button>
      </div>
      <div class="setting-row">
        <span
          ><strong>Progreso local</strong
          ><small
            >{{ completed.length }} lecciones, {{ solved.length }} diagnósticos y
            {{ deliveredOrders }} órdenes entregadas.</small
          ></span
        ><button class="text-link" @click="confirmReset = true">Reiniciar</button>
      </div>
      <div v-if="confirmReset" class="reset-confirm">
        <p>Se borrará el progreso de este navegador.</p>
        <button class="button button-outline" @click="confirmReset = false">Conservar</button
        ><button class="button button-dark" @click="reset">Reiniciar progreso</button>
      </div>
      <p class="help-text">
        Tus órdenes de taller, tus guías, las lecciones y los casos se guardan en este navegador.
      </p>
    </div>
  </dialog>
</template>
