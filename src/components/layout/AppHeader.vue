<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Icon from '../Icon.vue'
import { getComponents } from '../../data.js'
import { useProgress } from '../../composables/useProgress.js'
import { routes } from '../../router/routes.js'
import { useRouter } from '../../router/index.js'

const emit = defineEmits(['settings'])
const { route, go, inspect } = useRouter()
const { device } = useProgress()
const mobileMenu = ref(false)
const search = ref('')
const searchInput = ref(null)
const matchingParts = computed(() => {
  const query = search.value.trim().toLowerCase()
  return query
    ? getComponents(device.value)
        .filter((part) => [part.name, part.short, part.category].join(' ').toLowerCase().includes(query))
        .slice(0, 6)
    : []
})
function closeMenu() {
  mobileMenu.value = false
  search.value = ''
}
function openSettings() {
  closeMenu()
  emit('settings')
}
function keydown(event) {
  if (
    event.key === '/' &&
    !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
    !document.querySelector('dialog[open]')
  ) {
    event.preventDefault()
    mobileMenu.value = true
    nextTick(() => searchInput.value?.focus())
  }
  if (event.key === 'Escape') closeMenu()
}
watch(route, closeMenu)
onMounted(() => document.addEventListener('keydown', keydown))
onBeforeUnmount(() => document.removeEventListener('keydown', keydown))
</script>

<template>
  <header class="press-header">
    <div class="press-bar">
      <a class="press-brand" href="#home" aria-label="Placa Lab · Portada" @click.prevent="go('home')">
        <span class="press-mark" aria-hidden="true"
          ><svg viewBox="0 0 36 36" fill="none">
            <path d="M4 27h7V10h15M16 27V15h16M22 27v-6h10" stroke="currentColor" stroke-width="3" />
            <circle cx="27" cy="10" r="2.5" fill="currentColor" /></svg
        ></span>
        <b>PLACA<span>LAB</span></b>
      </a>
      <nav class="press-nav" aria-label="Secciones principales">
        <button
          v-for="item in routes.filter((item) => item.primary)"
          :key="item.id"
          :aria-current="route.page.id === item.id ? 'page' : undefined"
          @click="go(item.id)"
        >
          {{ item.name }}
        </button>
      </nav>
      <button
        class="index-trigger"
        :aria-expanded="mobileMenu"
        aria-controls="press-index"
        @click="mobileMenu = !mobileMenu"
      >
        <Icon :name="mobileMenu ? 'X' : 'Menu'" :size="17" /> Índice
      </button>
    </div>
    <div v-if="mobileMenu" id="press-index" class="press-index">
      <div class="index-inner">
        <div>
          <div class="folio-kicker">ÍNDICE GENERAL</div>
          <nav aria-label="Índice general">
            <button v-for="(item, i) in routes" :key="item.id" @click="go(item.id)">
              <small>{{ String(i + 1).padStart(2, '0') }}</small
              >{{ item.name }}<span>↗</span>
            </button>
          </nav>
        </div>
        <div class="index-search">
          <label for="index-find"
            >Buscar en la placa de {{ device === 'laptop' ? 'laptop' : 'escritorio' }}</label
          >
          <input
            id="index-find"
            ref="searchInput"
            v-model="search"
            placeholder="RAM, ventilador, bobina…"
            autocomplete="off"
          />
          <button v-for="c in matchingParts" :key="c.id" @click="inspect(c.id)">{{ c.name }} ↗</button>
          <p v-if="search.trim() && !matchingParts.length">Sin coincidencias.</p>
          <button class="ink-link" @click="openSettings">
            <Icon name="Settings2" :size="15" /> Preferencias
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
