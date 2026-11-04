<script setup>
import Icon from '../components/Icon.vue'
import { ref, computed } from 'vue'
import { glossary, sources } from '../data.js'

const glossarySearch = ref('')
const matchingTerms = computed(() =>
  glossary.filter(([term, definition]) =>
    (term + ' ' + definition).toLowerCase().includes(glossarySearch.value.toLowerCase()),
  ),
)
</script>

<template>
  <section class="glossary-page">
    <div class="glossary-search">
      <Icon name="Search" :size="20" /><input
        v-model="glossarySearch"
        aria-label="Buscar término en el glosario"
        placeholder="Busca un término, por ejemplo: VCORE…"
      />
    </div>
    <div class="glossary-grid">
      <article v-for="[term, definition] in matchingTerms" :key="term">
        <span class="glossary-mark">↗</span>
        <h3>{{ term }}</h3>
        <p>{{ definition }}</p>
      </article>
      <p v-if="!matchingTerms.length" class="empty-small">
        No encontramos ese término. Prueba “tensión”, “memoria” o “GND”.
      </p>
    </div>
    <div class="reference-section">
      <div>
        <Icon name="Library" :size="24" />
        <h2>Del modelo a la documentación.</h2>
        <p>
          Este laboratorio ilustra principios generales. Para trabajar en una placa real, usa el manual
          de servicio, el esquema de esa revisión y las hojas de datos. No todos los equipos comparten
          tensiones, componentes o secuencias.
        </p>
      </div>
      <div class="source-links">
        <a
          v-for="source in sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          >{{ source.title }}<Icon name="ArrowUpRight" :size="16"
        /></a>
      </div>
    </div>
  </section>
</template>
