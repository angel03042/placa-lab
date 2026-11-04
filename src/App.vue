<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import Icon from './components/Icon.vue'
import AppHeader from './components/layout/AppHeader.vue'
import PageHeading from './components/layout/PageHeading.vue'
import SettingsDialog from './components/layout/SettingsDialog.vue'
import LessonModal from './components/LessonModal.vue'
import { routes } from './router/routes.js'
import { provideRouter } from './router/index.js'
import { provideProgress } from './composables/useProgress.js'
import { provideStudy } from './composables/useStudy.js'
import { provideBoardPreferences } from './composables/useBoard.js'

const router = provideRouter()
const progress = provideProgress()
const { route } = router
const { activeLesson, toast, completeLesson, exploreLesson } = provideStudy(progress, router)
const { completed, reducedMotion, storageAvailable } = progress
provideBoardPreferences(progress.device)
const views = Object.fromEntries(routes.map((page) => [page.id, defineAsyncComponent(page.load)]))
const currentView = computed(() => views[route.value.page.id])
const settings = ref(null)
function focusContent() {
  document.getElementById('main')?.focus()
}
</script>

<template>
  <div class="app-shell print-edition" :class="{ 'reduce-motion': reducedMotion }">
    <a class="skip-link" href="#main" @click.prevent="focusContent">Saltar al contenido</a>
    <AppHeader @settings="settings.open()" />
    <div class="main-shell">
      <main id="main" class="main-content" tabindex="-1">
        <PageHeading />
        <KeepAlive>
          <component v-if="route.page.cache" :is="currentView" :key="route.page.id" />
        </KeepAlive>
        <component v-if="!route.page.cache" :is="currentView" />
        <footer class="page-footer">
          <span
            ><Icon name="CircuitBoard" :size="14" /> PLACA LAB
            <span class="footer-divider">/</span> Escuela de diagnóstico · Edición 05</span
          ><span
            >{{
              storageAvailable
                ? 'Tu progreso se guarda en este dispositivo'
                : 'Almacenamiento no disponible · progreso solo en esta sesión'
            }}<span class="tiny-dot"></span
          ></span>
        </footer>
      </main>
    </div>
    <LessonModal
      v-if="activeLesson"
      :key="activeLesson.id"
      :lesson="activeLesson"
      :completed="completed.includes(activeLesson.id)"
      @close="activeLesson = null"
      @complete="completeLesson"
      @explore="exploreLesson"
    />
    <SettingsDialog ref="settings" />
    <Transition name="toast"
      ><div v-if="toast" class="toast-message" role="status">
        <Icon name="CircleCheck" :size="19" />{{ toast
        }}<button aria-label="Cerrar aviso" @click="toast = ''">
          <Icon name="X" :size="15" />
        </button></div
    ></Transition>
  </div>
</template>
