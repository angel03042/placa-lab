<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'
const props=defineProps({lesson:Object, completed:Boolean})
const emit=defineEmits(['close','complete','explore'])
const dialog=ref(null),answer=ref(null),checked=ref(false)
onMounted(()=>dialog.value.showModal())
onBeforeUnmount(()=>dialog.value?.close())
function check(){checked.value=true;if(answer.value===props.lesson.answer)emit('complete',props.lesson.id)}
</script>
<template>
  <dialog ref="dialog" class="lesson-dialog" @close="emit('close')" @click="e=>{if(e.target===dialog)dialog.close()}">
    <div class="dialog-content"><button class="icon-button close-dialog" aria-label="Cerrar lección" @click="dialog.close()"><Icon name="X" /></button><span class="eyebrow">RUTA DE APRENDIZAJE · {{ lesson.time }} MIN</span><div class="lesson-dialog-icon"><Icon :name="lesson.icon" :size="36" /></div><h2>{{ lesson.title }}</h2><p class="lesson-lead">{{ lesson.subtitle }}</p><p class="lesson-body">{{ lesson.text }}</p><button class="practice-callout" @click="emit('explore',lesson)"><Icon name="MousePointer2" :size="20" /><span><strong>Hazlo en la placa</strong>{{ lesson.task }}</span><Icon name="ArrowUpRight" :size="20" /></button><div class="quiz"><span class="eyebrow">COMPRUEBA LO QUE APRENDISTE</span><h3>{{ lesson.question }}</h3><label v-for="(option,i) in lesson.options" :key="i" class="quiz-option" :class="{picked:answer===i,right:checked&&i===lesson.answer,wrong:checked&&answer===i&&i!==lesson.answer}"><input type="radio" :name="lesson.id" :value="i" v-model="answer" @change="checked=false" /><span>{{ option }}</span><Icon v-if="checked&&i===lesson.answer" name="CircleCheck" :size="18" /></label><div v-if="checked" class="feedback" :class="answer===lesson.answer?'correct':'incorrect'" role="status"><Icon :name="answer===lesson.answer?'CircleCheck':'Info'" :size="18" /><p><strong>{{ answer===lesson.answer?'¡Lección completada!':'Inténtalo de nuevo.' }}</strong> {{ lesson.explanation }}</p></div><button class="button button-dark" :disabled="answer===null" @click="check">{{ completed?'Repasar respuesta':'Comprobar respuesta' }}<Icon name="ArrowRight" :size="17" /></button></div></div>
  </dialog>
</template>
