<script setup>
import Icon from '../components/Icon.vue'
import { lessons } from '../data.js'
import { useProgress } from '../composables/useProgress.js'
import { useStudy } from '../composables/useStudy.js'

const { completed, nextLesson } = useProgress()
const { activeLesson } = useStudy()
</script>

<template>
  <section class="learning-page">
    <div class="route-banner">
      <div>
        <span class="eyebrow">TU RUTA · NIVEL INICIAL</span>
        <h2>La reparación comienza<br />por entender.</h2>
        <p>
          43 minutos de conceptos, exploración y práctica.<br />Sin prisa. Tu progreso se guarda en este
          navegador.
        </p>
        <button class="button button-lime" @click="activeLesson = nextLesson">
          {{ completed.length ? 'Continúa tu recorrido' : 'Empezar por lo esencial'
          }}<Icon name="ArrowRight" :size="17" />
        </button>
      </div>
      <div class="route-illustration" aria-hidden="true">
        <span class="orbit one"></span><span class="orbit two"></span
        ><Icon name="CircuitBoard" :size="110" /><span class="orbit-node n1"
          ><Icon name="Zap" :size="25" /></span
        ><span class="orbit-node n2"><Icon name="Search" :size="25" /></span
        ><span class="orbit-node n3"><Icon name="Wrench" :size="25" /></span>
      </div>
    </div>
    <div class="lesson-grid">
      <button
        v-for="(lesson, i) in lessons"
        :key="lesson.id"
        class="lesson-card"
        @click="activeLesson = lesson"
      >
        <div class="lesson-card-top">
          <span class="lesson-card-icon"><Icon :name="lesson.icon" :size="27" /></span
          ><span class="lesson-status" :class="{ done: completed.includes(lesson.id) }"
            ><Icon v-if="completed.includes(lesson.id)" name="CircleCheck" :size="13" />{{
              completed.includes(lesson.id) ? 'Completada' : `${lesson.time} min`
            }}</span
          >
        </div>
        <span class="eyebrow">LECCIÓN {{ String(i + 1).padStart(2, '0') }}</span>
        <h3>{{ lesson.title }}</h3>
        <p>{{ lesson.subtitle }}</p>
        <div class="lesson-card-bottom">
          {{ completed.includes(lesson.id) ? 'Volver a explorar' : 'Abrir lección' }}
          <Icon name="ArrowUpRight" :size="19" />
        </div>
      </button>
    </div>
  </section>
</template>
