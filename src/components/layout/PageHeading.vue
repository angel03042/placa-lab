<script setup>
import { lessons } from '../../data.js'
import { useProgress } from '../../composables/useProgress.js'
import { useRouter } from '../../router/index.js'

const { route, go } = useRouter()
const { completed } = useProgress()
</script>

<template>
  <section v-if="route.page.title" class="page-heading folio-intro">
    <div>
      <div class="folio-kicker"><i></i> CUADERNO DE TALLER / {{ route.page.name }}</div>
      <h1>{{ route.page.title }}</h1>
      <p>{{ route.page.subtitle }}</p>
    </div>
    <button class="folio-progress" @click="go('lessons')">
      {{ completed.length }} / {{ lessons.length }} lecciones ↗
    </button>
  </section>
</template>
