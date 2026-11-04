import { computed, inject, provide, ref, watch } from 'vue'
import { lessons } from '../data.js'
import { guides } from '../workshop/guides.js'
import { orders, orderStatus, restoreOrders, saveOrders } from '../game/orders.js'

const key = Symbol('progress')
export const STORAGE_KEY = 'placa-lab:v1'

function validIds(raw, allowed) {
  return Array.isArray(raw) ? [...new Set(raw.filter((id) => allowed.includes(id)))] : []
}

function restoreGuideRecords(raw) {
  const records = {}
  for (const device of ['laptop', 'desktop']) {
    for (const guide of guides) {
      const id = device + '/' + guide.id
      if (Array.isArray(raw?.[id]))
        records[id] = validIds(
          raw[id],
          guide.steps.map((_, i) => i),
        )
    }
  }
  return records
}

export function createProgress(getStorage, prefersReducedMotion = false) {
  let stored = {}
  const storageAvailable = ref(true)
  try {
    stored = JSON.parse(getStorage().getItem(STORAGE_KEY) || '{}') ?? {}
  } catch {
    storageAvailable.value = false
  }

  const device = ref(stored.device === 'desktop' ? 'desktop' : 'laptop')
  const reducedMotion = ref(
    typeof stored.reducedMotion === 'boolean' ? stored.reducedMotion : prefersReducedMotion,
  )
  const completed = ref(
    validIds(
      stored.completed,
      lessons.map((lesson) => lesson.id),
    ),
  )
  const solved = ref(validIds(stored.solved, ['no-power', 'no-display']))
  const guideRecords = ref(restoreGuideRecords(stored.guideRecords))
  const jobs = ref(restoreOrders(stored))
  const orderCards = computed(() =>
    orders.map((order) => ({ ...order, status: orderStatus(jobs.value[order.key]) })),
  )
  const deliveredOrders = computed(
    () => orderCards.value.filter((card) => card.status === 'Entregada').length,
  )
  const nextLesson = computed(
    () => lessons.find((lesson) => !completed.value.includes(lesson.id)) ?? lessons[0],
  )

  watch([device, reducedMotion, completed, solved, guideRecords, jobs], () => {
    try {
      getStorage().setItem(
        STORAGE_KEY,
        JSON.stringify({
          device: device.value,
          reducedMotion: reducedMotion.value,
          completed: completed.value,
          solved: solved.value,
          guideRecords: guideRecords.value,
          ...saveOrders(jobs.value),
        }),
      )
      storageAvailable.value = true
    } catch {
      storageAvailable.value = false
    }
  })
  function mark(list, id) {
    if (list.value.includes(id)) return false
    list.value = [...list.value, id]
    return true
  }
  function resetProgress() {
    jobs.value = restoreOrders()
    completed.value = []
    solved.value = []
    guideRecords.value = {}
  }
  return {
    device,
    reducedMotion,
    completed,
    solved,
    guideRecords,
    jobs,
    orderCards,
    deliveredOrders,
    nextLesson,
    storageAvailable,
    resetProgress,
    saveJob: (id, job) => {
      jobs.value = { ...jobs.value, [id]: job }
    },
    saveStep: (id, steps) => {
      guideRecords.value = { ...guideRecords.value, [id]: steps }
    },
    markLesson: (id) => mark(completed, id),
    markCase: (id) => mark(solved, id),
  }
}

export function provideProgress() {
  const progress = createProgress(
    () => window.localStorage,
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  provide(key, progress)
  return progress
}
export const useProgress = () => inject(key)
