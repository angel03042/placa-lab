import { inject, onBeforeUnmount, provide, ref } from 'vue'

const key = Symbol('study')

export function provideStudy({ markLesson, markCase }, { go }) {
  const activeLesson = ref(null)
  const toast = ref('')
  let timer
  function notify(message) {
    toast.value = message
    clearTimeout(timer)
    timer = setTimeout(() => {
      toast.value = ''
    }, 4800)
  }
  function completeLesson(id) {
    if (markLesson(id)) notify('Una idea más clara. Lección completada.')
  }
  function solveCase(id) {
    if (markCase(id)) notify('Caso resuelto. Tu diagnóstico tiene evidencia.')
  }
  function exploreLesson(lesson) {
    activeLesson.value = null
    const page = ['meter', 'faults', 'method'].includes(lesson.id) ? 'diagnostics' : 'lab'
    go(page, lesson.id === 'power' ? 'energia' : '', {
      intent: { part: lesson.focus, autoplay: lesson.id === 'power' },
    })
  }
  onBeforeUnmount(() => clearTimeout(timer))
  const study = { activeLesson, toast, notify, completeLesson, solveCase, exploreLesson }
  provide(key, study)
  return study
}
export const useStudy = () => inject(key)
