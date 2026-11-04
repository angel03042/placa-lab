<script setup>
import Icon from '../components/Icon.vue'
import BoardWorkbench from '../components/board/BoardWorkbench.vue'
import ComponentInspector from '../components/board/ComponentInspector.vue'
import BenchNote from '../components/board/BenchNote.vue'
import { provideBoard } from '../composables/useBoard.js'
import { lessons } from '../data.js'
import { useRouter } from '../router/index.js'
import { useProgress } from '../composables/useProgress.js'
import { useStudy } from '../composables/useStudy.js'

provideBoard('lab')
const { route, go } = useRouter()
const { completed, nextLesson } = useProgress()
const { activeLesson } = useStudy()
</script>

<template>
  <button
    v-if="route.intent.returnOrder"
    class="case-link return-case"
    @click="go('turno', route.intent.returnOrder)"
  >
    ← Volver a mi orden de taller
  </button>
  <section class="lab-layout" aria-label="Laboratorio interactivo">
    <BoardWorkbench /><ComponentInspector />
  </section>
  <BenchNote />
  <section class="learning-strip">
    <div class="section-heading">
      <div>
        <span class="eyebrow">CUADERNO DE ESTUDIO</span>
        <h2>Lecciones de la placa.</h2>
      </div>
      <button class="text-link" @click="go('lessons')">
        Ver la ruta completa <Icon name="ArrowUpRight" :size="17" />
      </button>
    </div>
    <div class="lesson-strip-grid">
      <button
        v-for="(lesson, i) in lessons.slice(0, 4)"
        :key="lesson.id"
        class="lesson-strip-card"
        :class="{ featured: lesson.id === nextLesson.id, completed: completed.includes(lesson.id) }"
        @click="activeLesson = lesson"
      >
        <span class="lesson-num">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="lesson-art"><Icon :name="lesson.icon" :size="30" /></div>
        <span class="lesson-strip-name"
          >{{ lesson.title
          }}<small
            ><Icon name="Clock3" :size="11" /> {{ lesson.time }} min <span>·</span>
            {{
              completed.includes(lesson.id) ? 'Completada' : i === 0 ? 'Empieza aquí' : 'A tu ritmo'
            }}</small
          ></span
        ><Icon :name="completed.includes(lesson.id) ? 'CircleCheck' : 'ArrowUpRight'" :size="17" />
      </button>
    </div>
  </section>
</template>
