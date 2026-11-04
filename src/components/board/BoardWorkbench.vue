<script setup>
import Icon from '../Icon.vue'
import BoardScene from '../BoardScene.vue'
import FlowReadout from '../FlowReadout.vue'
import { useBoard } from '../../composables/useBoard.js'

const {
  device,
  reducedMotion,
  selected,
  modelMode,
  labels,
  parts,
  scene,
  stageFrame,
  diagnostic,
  diagnosticPower,
  modelModes,
  flowKind,
  flowActive,
  flowSteps,
  flowIndex,
  flowStage,
  stageName,
  thermalStep,
  sceneStep,
  playing,
  openFlow,
  closeFlow,
  goStep,
  play,
  changeMode,
  selectPart,
  focusPart,
} = useBoard()
</script>

<template>
  <div class="workbench">
    <div class="workbench-header">
      <div class="device-tabs" role="group" aria-label="Tipo de placa">
        <button
          :class="{ active: device === 'laptop' }"
          :aria-pressed="device === 'laptop'"
          @click="device = 'laptop'"
        >
          <Icon name="Laptop" :size="17" /> Laptop</button
        ><button
          :class="{ active: device === 'desktop' }"
          :aria-pressed="device === 'desktop'"
          @click="device = 'desktop'"
        >
          <Icon name="Monitor" :size="17" /> PC de escritorio
        </button>
      </div>
      <span class="model-badge"><span class="tiny-dot"></span> MODELO 3D</span>
    </div>
    <div v-if="!diagnostic" class="flow-bar">
      <div class="flow-bar-heading">
        <span class="flow-kicker">LÁMINA ANIMADA</span><strong>Recorridos de la placa</strong>
      </div>
      <div class="flow-tabs" role="group" aria-label="Elegir recorrido">
        <button :aria-pressed="flowActive && flowKind === 'energy'" @click="openFlow('energy')">
          <Icon name="Zap" :size="18" /> Encendido
        </button>
        <button :aria-pressed="flowActive && flowKind === 'thermal'" @click="openFlow('thermal')">
          <Icon name="Flame" :size="18" /> Calor
        </button>
      </div>
    </div>
    <div class="anatomy-modes" role="group" aria-label="Vista del modelo">
      <button
        v-for="m in modelModes"
        :key="m.id"
        :class="{ active: modelMode === m.id }"
        :aria-pressed="modelMode === m.id"
        @click="changeMode(m.id)"
      >
        {{ m.name }}</button
      ><span>{{
        modelMode === 'exploded'
          ? 'Conjuntos separados para estudiar'
          : modelMode === 'board'
            ? 'Refrigeración oculta para inspeccionar'
            : 'Explora de fuera hacia dentro'
      }}</span>
    </div>
    <div
      ref="stageFrame"
      class="board-stage"
      :class="{ 'showing-flow': flowActive, 'showing-heat': flowActive && flowKind === 'thermal' }"
    >
      <div v-if="flowActive" class="flow-stage-caption">
        <span>{{ stageName }} · {{ flowIndex + 1 }} / {{ flowSteps.length }}</span
        ><strong>{{ flowStage.from }} → {{ flowStage.to }}</strong>
      </div>
      <div v-else class="stage-caption">
        <span>01 / {{ device === 'laptop' ? 'LAPTOP' : 'DESKTOP' }}</span
        ><strong>{{ device === 'laptop' ? 'Anatomía de una laptop' : 'Anatomía de una PC' }}</strong
        ><small>Modelo didáctico · {{ parts.length }} componentes</small>
      </div>
      <div class="stage-coordinates" aria-hidden="true">
        <span>Y</span>
        <div>↖<span>↑</span>↗</div>
        <span>X &nbsp;&nbsp;&nbsp; Z</span>
      </div>
      <BoardScene
        ref="scene"
        :device="device"
        :selected="selected"
        :labels="labels"
        :step="sceneStep"
        :running="diagnostic ? diagnosticPower : playing"
        :mode="modelMode"
        :flow-kind="diagnostic ? 'energy' : flowKind"
        :thermal-step="thermalStep"
        :guided="flowActive"
        :reduced-motion="reducedMotion"
        @select="selectPart"
      />
      <div class="stage-hint">
        <Icon name="MousePointer2" :size="13" /><span
          >Arrastra para girar · Selecciona para descubrir</span
        >
      </div>
      <div class="scene-tools">
        <button class="icon-button" @click="scene?.zoom(1)" aria-label="Acercar placa" title="Acercar">
          <Icon name="Plus" :size="17" /></button
        ><button class="icon-button" @click="scene?.zoom(-1)" aria-label="Alejar placa" title="Alejar">
          <Icon name="Minus" :size="17" /></button
        ><span></span
        ><button
          class="icon-button"
          @click="scene?.rotate()"
          aria-label="Girar placa 45 grados"
          title="Girar"
        >
          <Icon name="Rotate3d" :size="18" /></button
        ><button
          class="icon-button"
          @click="scene?.reset()"
          aria-label="Restablecer vista"
          title="Restablecer vista"
        >
          <Icon name="Scan" :size="17" /></button
        ><span></span
        ><button
          class="icon-button"
          :class="{ active: labels }"
          :aria-pressed="labels"
          @click="labels = !labels"
          aria-label="Mostrar etiquetas"
          title="Etiquetas"
        >
          <Icon name="Tags" :size="17" />
        </button>
      </div>
      <div class="stage-scale" aria-hidden="true">LP / REV 02 <span></span></div>
    </div>
    <div class="component-picker">
      <label for="part-picker">INSPECCIONAR</label
      ><select
        id="part-picker"
        aria-label="INSPECCIONAR"
        :value="selected"
        @change="selectPart($event.target.value)"
      >
        <option v-for="c in parts" :key="c.id" :value="c.id">{{ c.name }}</option></select
      ><button @click="focusPart"><Icon name="ScanSearch" :size="16" /> Ver de cerca</button>
    </div>
    <div v-if="diagnostic" class="workbench-footer">
      <span class="live-state"
        ><i class="status-dot" :class="{ powered: diagnosticPower }"></i
        >{{ diagnosticPower ? 'Placa alimentada · simulación' : 'Placa desconectada' }}</span
      ><span class="footer-tag">MEDICIONES VIRTUALES</span>
    </div>
    <template v-else>
      <div class="flow-transport">
        <button class="flow-play" @click="play">
          <Icon :name="playing ? 'Pause' : 'Play'" :size="16" />{{
            playing
              ? 'Pausar'
              : !flowActive
                ? 'Ver encendido'
                : flowIndex === flowSteps.length - 1
                  ? 'Repetir recorrido'
                  : 'Reproducir'
          }}
        </button>
        <template v-if="flowActive"
          ><button
            :disabled="flowIndex === 0"
            @click="goStep(flowIndex - 1)"
            aria-label="Etapa anterior"
          >
            ← Anterior</button
          ><button
            :disabled="flowIndex === flowSteps.length - 1"
            @click="goStep(flowIndex + 1)"
            aria-label="Etapa siguiente"
          >
            Siguiente →</button
          ><button class="close-flow" @click="closeFlow" aria-label="Cerrar recorrido">
            <Icon name="X" :size="18" /></button
        ></template>
        <span v-else>Observa el encendido paso a paso sobre la placa.</span>
      </div>
      <FlowReadout
        v-if="flowActive"
        :steps="flowSteps"
        :index="flowIndex"
        :kind="flowKind"
        @seek="goStep"
        @locate="stageFrame?.scrollIntoView({ block: 'center' })"
      />
    </template>
  </div>
</template>
