import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { getComponents } from '../data.js'
import { sequenceFor, heatSequenceFor } from '../flows.js'
import { externalParts } from '../three/layout.js'
import { desktopStages } from '../three/assembly.js'
import { useProgress } from './useProgress.js'
import { useRouter } from '../router/index.js'

const preferencesKey = Symbol('board-preferences')
const boardKey = Symbol('active-board')

// Keep the user's orientation and labels across screens, but never keep a WebGL scene running.
export function provideBoardPreferences(device) {
  provide(preferencesKey, { selected: ref('ram'), modelMode: ref(device.value === 'desktop' ? 'equipment' : 'interior'), labels: ref(true) })
}

export function provideBoard(page) {
  const { route, go } = useRouter()
  const { device, reducedMotion } = useProgress()
  const { selected, modelMode, labels } = inject(preferencesKey)
  const diagnostic = page === 'diagnostics'
  const parts = computed(() => getComponents(device.value))
  const component = computed(
    () => parts.value.find((part) => part.id === selected.value) ?? parts.value[0],
  )
  const infoTab = ref('recognition')
  const scene = ref(null)
  const stageFrame = ref(null)
  const diagnosticPower = ref(false)
  const diagnosticCase = ref('no-power')
  const modelModes = computed(() => device.value === 'desktop' && !diagnostic
    ? desktopStages.map(stage => ({ id: stage.mode, name: stage.label }))
    : [
      { id: 'equipment', name: 'Equipo' },
      { id: 'interior', name: 'Interior' },
      { id: 'board', name: 'Placa' },
      { id: 'exploded', name: 'Despiece' },
    ].filter((mode) => device.value === 'laptop' || mode.id !== 'equipment'),
  )

  const flowKind = computed(() => (route.value.section === 'calor' ? 'thermal' : 'energy'))
  const flowActive = computed(
    () =>
      !diagnostic && route.value.page.id === page && ['energia', 'calor'].includes(route.value.section),
  )
  const flowSteps = computed(() =>
    flowKind.value === 'thermal' ? heatSequenceFor(device.value) : sequenceFor(device.value),
  )
  const flowIndex = ref(0)
  const flowStage = computed(() => (flowActive.value ? flowSteps.value[flowIndex.value] : null))
  const stageName = computed(() => (flowKind.value === 'thermal' ? 'Calor' : 'Encendido'))
  const thermalStep = computed(() =>
    flowActive.value && flowKind.value === 'thermal' ? flowIndex.value : 0,
  )
  const sceneStep = computed(() => {
    if (diagnostic)
      return diagnosticPower.value ? ({ 'no-power': 0, 'no-display': 3 }[diagnosticCase.value] ?? 5) : -1
    return flowActive.value ? (flowKind.value === 'thermal' ? 5 : flowIndex.value) : -1
  })
  const playing = ref(false)
  let timer
  function stop() {
    clearInterval(timer)
    playing.value = false
  }
  function goStep(index) {
    stop()
    showStage(index)
  }
  function showStage(index) {
    flowIndex.value = index
    selected.value = flowSteps.value[index].id
  }
  function openFlow(kind, autoplay = false) {
    go('lab', kind === 'thermal' ? 'calor' : 'energia', {
      replace: true,
      intent: { returnOrder: route.value.intent.returnOrder, autoplay },
    })
  }
  function closeFlow() {
    stop()
    go('lab', '', { replace: true, intent: { returnOrder: route.value.intent.returnOrder } })
  }
  function play() {
    if (playing.value) return stop()
    if (!flowActive.value) return openFlow('energy', true)
    if (flowIndex.value === flowSteps.value.length - 1) showStage(0)
    playing.value = true
    timer = setInterval(() => {
      if (flowIndex.value < flowSteps.value.length - 1) showStage(flowIndex.value + 1)
      else stop()
    }, 4800)
  }
  function changeMode(id) {
    if (
      flowActive.value &&
      (['exploded', 'released', 'equipment'].includes(id) || (flowKind.value === 'thermal' && id === 'board'))
    )
      closeFlow()
    modelMode.value = id
    if (device.value === 'desktop' && !diagnostic && !flowActive.value) {
      if (id === 'interior' || id === 'released') selected.value = 'gpu'
      if (id === 'board') selected.value = 'pcie'
      infoTab.value = 'recognition'
    }
  }
  function selectPart(id) {
    if (flowActive.value) closeFlow()
    selected.value = id
    infoTab.value = 'recognition'
    if (device.value === 'desktop' && id === 'pcie' && !['board','exploded','released'].includes(modelMode.value)) {
      modelMode.value = 'released'
    } else if (modelMode.value === 'equipment' || (modelMode.value === 'board' && externalParts.includes(id)))
      modelMode.value = 'interior'
  }
  async function focusPart() {
    if (flowActive.value) closeFlow()
    if (['cpu', 'chipset', 'vrm', 'inductor', 'pcie'].includes(selected.value) || ['equipment', 'exploded'].includes(modelMode.value)) {
      modelMode.value = externalParts.includes(selected.value) ? 'interior' : 'board'
    }
    await nextTick()
    scene.value?.focus()
  }
  function startFlow() {
    modelMode.value = flowKind.value === 'thermal' ? 'interior' : 'board'
    infoTab.value = 'function'
    showStage(0)
    nextTick(() => scene.value?.reset())
  }
  function applyRoute() {
    stop()
    if (route.value.page.id !== page) return
    const { intent } = route.value
    if (flowActive.value) {
      startFlow()
      if (intent.autoplay) play()
    } else if (intent.part) {
      selectPart(intent.part)
      if (intent.focus) focusPart()
    }
  }
  function validateSelection() {
    if (!parts.value.some((part) => part.id === selected.value)) selected.value = 'cpu'
    if (!modelModes.value.some((mode) => mode.id === modelMode.value)) modelMode.value = 'interior'
  }
  validateSelection()
  onMounted(applyRoute)
  watch(route, applyRoute)
  watch(device, () => {
    stop()
    modelMode.value = device.value === 'desktop' && !diagnostic ? 'equipment' : 'interior'
    if (flowActive.value) startFlow()
    else validateSelection()
  })
  onBeforeUnmount(stop)

  const board = {
    device,
    reducedMotion,
    selected,
    modelMode,
    labels,
    parts,
    component,
    infoTab,
    scene,
    stageFrame,
    diagnostic,
    diagnosticCase,
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
  }
  provide(boardKey, board)
  return board
}
export const useBoard = () => inject(boardKey)
