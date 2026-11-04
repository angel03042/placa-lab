<script setup>
import Icon from '../components/Icon.vue'
import BoardWorkbench from '../components/board/BoardWorkbench.vue'
import BenchNote from '../components/board/BenchNote.vue'
import DiagnosticPanel from '../components/DiagnosticPanel.vue'
import { provideBoard } from '../composables/useBoard.js'
import { useProgress } from '../composables/useProgress.js'
import { useStudy } from '../composables/useStudy.js'

const { device, diagnosticCase, diagnosticPower, selectPart } = provideBoard('diagnostics')
const { solved } = useProgress()
const { solveCase } = useStudy()
</script>

<template>
  <section class="lab-layout diagnostics-layout" aria-label="Laboratorio interactivo">
    <BoardWorkbench />
    <aside class="component-panel diagnostic-container">
      <DiagnosticPanel
        :device="device"
        @select="selectPart"
        @case-change="diagnosticCase = $event"
        @power-change="diagnosticPower = $event"
        @solved="solveCase"
      />
    </aside>
  </section>
  <BenchNote />
  <section class="diagnostic-guidance">
    <Icon name="NotebookPen" :size="24" />
    <div>
      <h3>Un síntoma es una pista, no un diagnóstico.</h3>
      <p>
        Inspecciona, compara y documenta. En hardware real, mide resistencia con adaptador y batería
        desconectados y sin energía residual. Esta práctica se limita a circuitos de baja tensión; no se
        abre una fuente de alimentación.
      </p>
    </div>
    <span>{{ solved.length }}/2 casos<br />resueltos</span>
  </section>
</template>
