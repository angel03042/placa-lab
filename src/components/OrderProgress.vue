<script setup>
defineProps({
  labels:{type:Array, required:true},
  step:{type:Number, required:true},
  digits:{type:Number, default:1},
})
</script>

<template>
  <ol class="order-progress" aria-label="Etapas del turno">
    <li v-for="(label,index) in labels" :key="label" :class="{past:index<step}" :aria-current="index===step?'step':undefined">
      <span>{{ index<step?'✓':String(index+1).padStart(digits,'0') }}</span> {{ label }}
    </li>
  </ol>
</template>
