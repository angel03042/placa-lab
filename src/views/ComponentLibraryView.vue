<script setup>
import Icon from '../components/Icon.vue'
import { ref, computed, watch } from 'vue'
import { getComponents } from '../data.js'
import { illustrationFor } from '../recognition.js'
import { useRouter } from '../router/index.js'
import { useProgress } from '../composables/useProgress.js'

const { device } = useProgress()
const { inspect } = useRouter()
const libraryFilter = ref('Todos')
const parts = computed(() => getComponents(device.value))
const categories = computed(() => ['Todos', ...new Set(parts.value.map((part) => part.category))])
const filteredParts = computed(() =>
  parts.value.filter((part) => libraryFilter.value === 'Todos' || part.category === libraryFilter.value),
)
watch(device, () => {
  libraryFilter.value = 'Todos'
})
</script>

<template>
  <section class="library-page">
    <div class="library-toolbar">
      <div class="device-tabs">
        <button :class="{ active: device === 'laptop' }" @click="device = 'laptop'">
          <Icon name="Laptop" :size="17" /> Laptop</button
        ><button :class="{ active: device === 'desktop' }" @click="device = 'desktop'">
          <Icon name="Monitor" :size="17" /> PC de escritorio
        </button>
      </div>
      <span>{{ parts.length }} componentes para explorar</span>
    </div>
    <div class="filter-tabs" aria-label="Filtrar componentes">
      <button
        v-for="category in categories"
        :key="category"
        :class="{ active: libraryFilter === category }"
        @click="libraryFilter = category"
      >
        {{ category }}
      </button>
    </div>
    <div class="component-grid">
      <button v-for="c in filteredParts" :key="c.id" class="library-card" @click="inspect(c.id)">
        <div class="library-card-art" :style="{ '--part-color': c.color }">
          <img
            v-if="illustrationFor(c.id, device)"
            :src="illustrationFor(c.id, device)"
            :alt="c.name"
          /><Icon v-else :name="c.icon" :size="51" /><span>{{ c.ref }}</span>
          <div class="component-crosshair"></div>
        </div>
        <div class="library-card-body">
          <span class="eyebrow">{{ c.category }}</span>
          <h3>{{ c.name }}</h3>
          <p>{{ c.summary }}</p>
          <span class="library-card-link"
            >Explorar en la placa <Icon name="ArrowUpRight" :size="16"
          /></span>
        </div>
      </button>
    </div>
  </section>
</template>
