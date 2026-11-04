<script setup>
import Icon from '../Icon.vue'
import { useRouter } from '../../router/index.js'
const { go } = useRouter()
</script>

<template>
  <div class="bench-note">
    <Icon name="Info" :size="14" /><span
      >Aprende con un modelo simplificado. La distribución, las tensiones y la secuencia varían entre
      equipos.</span
    ><button @click="go('glossary')">Guía y referencias <Icon name="ArrowUpRight" :size="13" /></button>
  </div>
</template>
