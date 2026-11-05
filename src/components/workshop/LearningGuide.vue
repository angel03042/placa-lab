<script setup>
import { computed, ref } from "vue";
import { learningContent } from "../../game/learningContent.js";
const props = defineProps({
  topic: String,
  phase: String,
  stage: { type: Number, default: 0 },
});
const lesson = computed(() => learningContent[props.topic]);
const choice = ref(-1);
const done = computed(() => ["delivered", "closed"].includes(props.phase));
const repairing = computed(() => props.phase === "repair");
</script>
<template>
  <aside class="learning-guide" :class="{ compact: repairing }">
    <template v-if="phase === 'intake'"
      ><span class="ticket-kicker">LO QUE VAS A APRENDER</span>
      <p>{{ lesson.goal }}</p>
      <small
        >Observa → interpreta → intervén → vuelve a probar. Puedes equivocarte:
        el banco te explicará qué falta comprobar.</small
      ></template
    >
    <template v-else-if="repairing"
      ><span class="ticket-kicker">POR QUÉ ESTE PASO</span>
      <h3>{{ lesson.steps[stage]?.[0] }}</h3>
      <p>{{ lesson.steps[stage]?.[1] }}</p></template
    >
    <template v-else-if="done"
      ><span class="ticket-kicker">LO QUE DEMOSTRASTE</span>
      <p>{{ lesson.takeaway }}</p>
      <details>
        <summary>¿Y si los resultados fueran distintos?</summary>
        <p>{{ lesson.transfer }}</p>
      </details></template
    >
    <template v-else
      ><span class="ticket-kicker">PAUSA PARA RAZONAR · SIN PENALIZACIÓN</span>
      <h3>{{ lesson.question }}</h3>
      <div class="learning-choices">
        <button
          v-for="(option, i) in lesson.choices"
          :key="option"
          :aria-pressed="choice === i"
          @click="choice = i"
        >
          {{ option }}
        </button>
      </div>
      <p v-if="choice >= 0" role="status" class="learning-response">
        <b>{{
          choice === lesson.correct
            ? "Bien razonado. "
            : "Revisa la evidencia. "
        }}</b
        >{{ lesson.feedback[choice] }}
      </p></template
    >
  </aside>
</template>
<style scoped>
.learning-guide {
  margin: 18px 0 24px;
  background: #e8ede2;
  border: 1px solid #a5b49f;
  border-left: 4px solid #52755a;
  padding: clamp(15px, 2vw, 24px);
  color: #243e34;
}
.learning-guide h3 {
  font-size: 1.15rem;
  line-height: 1.45;
  margin: 8px 0 12px;
}
.learning-guide p {
  font-size: 1rem;
  line-height: 1.6;
  margin: 8px 0;
}
.learning-guide small {
  font-size: 0.9rem;
  line-height: 1.5;
  display: block;
  color: #3f594b;
}
.learning-guide summary {
  cursor: pointer;
  font-weight: 700;
  min-height: 32px;
  padding-top: 6px;
}
.learning-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.learning-choices button {
  flex: 1 1 200px;
  text-align: left;
  padding: 12px;
  border: 1px solid #8ca38c;
  background: #fffcf1;
  color: #294334;
  font-size: 0.95rem;
  min-height: 44px;
}
.learning-choices button[aria-pressed="true"] {
  background: #2e5644;
  color: #fffce9;
}
.learning-choices button:focus-visible {
  outline: 3px solid #a35f2f;
  outline-offset: 2px;
}
.learning-response {
  padding-top: 12px;
  border-top: 1px dashed #92a68e;
}
.compact {
  margin: 16px 0 0;
}
.compact h3 {
  font-size: 1.1rem;
}
</style>
